# Complete Order Flow Documentation

## Overview

This document describes the complete order flow implementation from frontend API call to PayPlus payment processing, including data verification, payment link generation, webhook handling, and real-time updates.

## Flow Architecture

### 1. Frontend Checkout Request

The frontend sends a `CheckoutPayload` to the `/api/orders/generate-sale` endpoint:

```typescript
interface CheckoutPayload {
  totalPrice: number;
  customer: Customer;
  orderItems: MinimalCartItem[];
}

interface MinimalCartItem {
  itemId: string;          // Product or Package ID
  quantity: number;
  size: string;
  price: number;           // Frontend calculated price (will be verified)
  itemType: 'Product' | 'Package';
}

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    streetNum: string;
    city: string;
    postal_code?: string;
    country?: string;
  };
}
```

### 2. Backend Processing Flow

#### 2.1 Item Verification and Price Calculation

```typescript
// 1. Fetch actual items from database using IDs
const verifiedItems = await fetchAndVerifyItems(orderItems);

// 2. Calculate actual total using database prices
const calculatedTotal = calculateTotalPrice(verifiedItems, orderItems);

// 3. Verify frontend total matches database calculation
verifyTotalPrice(calculatedTotal, frontendTotal);
```

#### 2.2 Database Logic

**For Products:**
- Finds product by ID
- Locates pricing for requested size from `pricing` array
- Validates size availability
- Uses database price (not frontend price)

**For Packages:**
- Finds package by ID
- Uses single `price` field
- No size restrictions

#### 2.3 Order Creation with MongoDB Transactions

```typescript
const session = await orderModel.db.startSession();

await session.withTransaction(async () => {
  // Create order in 'pending' state
  const order = await createOrder(orderData);
  
  // Generate PayPlus payment link
  const paymentResponse = await paymentService.getPaymentLink({
    createOrderDto,
    orderId
  });
  
  // Update order with payment reference
  order.paymentDetails = {
    transaction_uid: paymentResponse.page_request_uid,
    transaction_status: 'pending',
    transaction_amount: totalPrice,
    transaction_currency: 'ILS'
  };
  
  await order.save({ session });
});
```

### 3. PayPlus Integration

#### 3.1 Payment Request Payload

```typescript
const payPlusPayload = {
  payment_page_request: {
    refURL_success: `${frontendUrl}/payment/success?orderId=${orderId}`,
    refURL_failure: `${frontendUrl}/payment/failure?orderId=${orderId}`,
    refURL_callback: `${backendUrl}/api/orders/webhook/payment-notification`,
    currency_code: 'ILS',
    amount: totalPrice,
    vat_amount: calculateVAT(totalPrice), // 17% VAT for Israel
    language_code: 'he',
    customer: {
      customer_name: `${firstName} ${lastName}`,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress
    },
    items: orderItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      vat_type: 1 // Standard VAT
    })),
    more_info: orderId, // Critical: Links PayPlus response back to our order
    charge_method: 1, // Immediate charge
    send_email_approval: true,
    send_email_failure: true
  }
};
```

#### 3.2 Response Handling

```typescript
// Success response from PayPlus
{
  order: OrderEntity,
  paymentLink: string,     // Redirect user here
  pageRequestUid: string   // PayPlus reference
}
```

### 4. Payment Completion Flow

#### 4.1 User Payment on PayPlus

1. Frontend redirects user to `paymentLink`
2. User completes payment on PayPlus platform
3. PayPlus processes payment
4. PayPlus sends webhook to `/api/orders/webhook/payment-notification`

#### 4.2 Webhook Processing

```typescript
@Post('webhook/payment-notification')
async handlePaymentWebhook(
  @Body() webhookData: PaymentWebhookData,
  @Headers('x-payplus-signature') signature?: string
) {
  // 1. Verify webhook signature (HMAC-SHA256)
  const isValid = paymentService.verifyWebhookSignature(
    JSON.stringify(webhookData),
    signature
  );
  
  // 2. Update order status based on payment result
  const orderStatus = mapPaymentStatusToOrderStatus(webhookData.status);
  
  // 3. Update database
  const updatedOrder = await orderModel.findByIdAndUpdate(
    webhookData.more_info, // This is our orderId
    {
      status: orderStatus,
      paymentDetails: webhookData.transaction
    }
  );
  
  // 4. Emit real-time updates
  ordersGateway.sendPaymentConfirmation(orderId, orderStatus);
  ordersGateway.sendOrderUpdate(orderId, updateData);
}
```

### 5. Real-time Updates via WebSocket

#### 5.1 Order Status Updates

```typescript
// Emit to specific order room
ordersGateway.sendOrderUpdate(orderId, {
  status: 'paid',
  message: 'Payment completed successfully',
  paymentDetails: transactionData
});
```

#### 5.2 Payment Confirmations

```typescript
// Broadcast payment confirmation
ordersGateway.sendPaymentConfirmation(orderId, 'paid');
```

## Security Features

### 1. Price Verification

- **Frontend prices are never trusted**
- All prices fetched from database
- Frontend total verified against calculated total
- Tolerance of 1 cent for floating-point differences

### 2. Webhook Security

```typescript
// HMAC-SHA256 signature verification
const expectedSignature = crypto
  .createHmac('sha256', secretKey)
  .update(payload)
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(expectedSignature, 'hex'),
  Buffer.from(receivedSignature, 'hex')
);
```

### 3. Database Transactions

- MongoDB transactions ensure atomicity
- Order creation and payment linking are atomic
- Rollback on any failure

### 4. Idempotency Protection

```typescript
// Prevent duplicate processing
if (order.status === 'paid' && webhookStatus === 'success') {
  logger.warn(`Order ${orderId} already marked as paid`);
  return order;
}
```

## Payment Status Mapping

```typescript
const statusMap = {
  'success': 'paid',
  'approved': 'paid', 
  'completed': 'paid',
  'failed': 'failed',
  'declined': 'failed',
  'error': 'failed',
  'cancelled': 'cancelled',
  'pending': 'processing'
};
```

## API Endpoints

### POST `/api/orders/generate-sale`

**Request:**
```json
{
  "totalPrice": 99.98,
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": {
      "street": "Main St",
      "streetNum": "123",
      "city": "Tel Aviv",
      "postal_code": "12345",
      "country": "Israel"
    }
  },
  "orderItems": [
    {
      "itemId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "size": "500g", 
      "price": 25.50,
      "itemType": "Product"
    }
  ]
}
```

**Response:**
```json
{
  "order": { /* OrderEntity */ },
  "paymentLink": "https://payplus.co.il/payment/...",
  "pageRequestUid": "uuid-from-payplus"
}
```

### POST `/api/orders/webhook/payment-notification`

**PayPlus Webhook Data:**
```json
{
  "more_info": "orderId",
  "status": "success",
  "transaction": {
    "transaction_uid": "txn_123",
    "transaction_status": "approved",
    "transaction_amount": 99.98,
    "transaction_currency": "ILS",
    "transaction_date": "2024-01-20T10:30:00Z",
    "transaction_type": "payment",
    "card_holder_name": "John Doe",
    // ... additional transaction details
  }
}
```

## Error Handling

### 1. Item Not Found
```typescript
throw new NotFoundException(`Product with ID ${itemId} not found`);
```

### 2. Size Unavailable
```typescript
throw new BadRequestException(
  `Size ${size} not available for ${productName}. Available: ${availableSizes.join(', ')}`
);
```

### 3. Price Mismatch
```typescript
throw new BadRequestException(
  `Price verification failed. Expected: ${calculated}, Received: ${frontend}`
);
```

### 4. Payment Link Generation Failure
```typescript
throw new BadRequestException('Failed to create payment link');
```

## Testing Strategies

### 1. Unit Tests

```typescript
describe('OrdersService', () => {
  it('should verify item prices correctly', async () => {
    // Test price verification logic
  });
  
  it('should handle product size validation', async () => {
    // Test size availability checks  
  });
  
  it('should map payment statuses correctly', () => {
    // Test status mapping
  });
});
```

### 2. Integration Tests

```typescript
describe('Payment Flow E2E', () => {
  it('should complete full payment flow', async () => {
    // 1. Create checkout request
    // 2. Verify payment link generation
    // 3. Simulate PayPlus webhook
    // 4. Verify order status update
  });
});
```

### 3. Webhook Testing

```typescript
describe('Webhook Security', () => {
  it('should verify webhook signatures', () => {
    // Test HMAC signature verification
  });
  
  it('should reject invalid signatures', () => {
    // Test signature validation failure
  });
});
```

## Configuration Requirements

### Environment Variables

```bash
# PayPlus Configuration
PAYPLUS_API_KEY=your_api_key
PAYPLUS_SECRET_KEY=your_secret_key

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/your_db
```

### PayPlus Setup

1. Register PayPlus merchant account
2. Configure webhook endpoint: `${BACKEND_URL}/api/orders/webhook/payment-notification`
3. Set success/failure URLs in PayPlus dashboard
4. Enable webhook signature verification

## Performance Considerations

### 1. Database Optimization

- Index on order ID for fast webhook lookups
- Index on customer email for order history
- Connection pooling for concurrent requests

### 2. Real-time Updates

- WebSocket room-based messaging for scalability
- Efficient order update broadcasting
- Connection management for multiple clients

### 3. Error Recovery

- Retry logic for PayPlus API calls
- Webhook duplicate handling
- Transaction rollback mechanisms

## Monitoring and Logging

### 1. Key Metrics

- Order creation success rate
- Payment completion rate  
- Webhook processing time
- Price verification failures

### 2. Logging Strategy

```typescript
// Order flow logging
logger.log(`Order created with ID: ${orderId}`);
logger.log(`Payment link generated: ${paymentLink}`);
logger.log(`Webhook processed for order ${orderId}: ${status}`);

// Error logging
logger.error(`Price mismatch - Calculated: ${calculated}, Frontend: ${frontend}`);
logger.error('PayPlus API error:', error);
```

### 3. Alerting

- Failed payment webhook processing
- Repeated price verification failures
- PayPlus API connection issues
- Database transaction failures

## Future Enhancements

### 1. Advanced Features

- Partial refunds support
- Multi-currency handling
- Subscription payments
- Installment payments

### 2. Optimization

- Redis caching for product/package data
- Async webhook processing queue
- Payment retry mechanisms
- Advanced fraud detection

### 3. Analytics

- Payment success rate tracking
- Customer payment behavior analysis
- Revenue reporting integration
- Performance metrics dashboard

This implementation provides a production-ready, secure, and scalable order processing system with comprehensive error handling, real-time updates, and proper integration with the PayPlus payment gateway. 