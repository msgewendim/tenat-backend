import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { CheckoutPayloadDto } from './dto/checkout-payload.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './schemas/order.schema';
import { OrderEntity } from './entities/order.entity';
import { PaymentService } from './payments/payment.service';
import { OrdersGateway } from './orders.gateway';

// Import models for item lookup
import { Pricing, Product } from '../products/schemas/product.schema';
import { Package } from '../packages/schemas/package.schema';

export interface PaymentWebhookData {
  more_info: string; // Order ID
  status: string;
  transaction: {
    transaction_uid: string;
    transaction_status: string;
    transaction_amount: number;
    transaction_currency: string;
    transaction_date: string;
    transaction_type: string;
    number_of_payments?: number;
    first_payment_amount?: number;
    rest_payments_amount?: number;
    card_holder_name?: string;
    customer_uid?: string;
    terminal_uid?: string;
  };
}

export interface CreateOrderResponse {
  order: OrderEntity;
  paymentLink: string;
  pageRequestUid: string;
}

interface ItemDetails {
  _id: string;
  name: string;
  price: number;
  image?: string;
  availableSizes?: string[];
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderEntity>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Package.name) private packageModel: Model<Package>,
    private readonly paymentService: PaymentService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    // Create order in 'pending' state initially
    const order = new this.orderModel({
      ...createOrderDto,
      status: 'pending',
      paymentDetails: null,
    });

    return order.save();
  }

  async generateSaleOrder(
    checkoutPayload: CheckoutPayloadDto,
  ): Promise<CreateOrderResponse> {
    this.logger.log('Starting checkout process with item verification');

    // 1. Fetch and verify items from database
    const verifiedItems = await this.fetchAndVerifyItems(
      checkoutPayload.orderItems,
    );

    // 2. Calculate actual total and verify against frontend total
    const calculatedTotal = this.calculateTotalPrice(
      verifiedItems,
      checkoutPayload.orderItems,
    );
    this.verifyTotalPrice(calculatedTotal, checkoutPayload.totalPrice);

    // 3. Transform to CreateOrderDto format
    const createOrderDto = this.transformToCreateOrderDto(
      checkoutPayload,
      verifiedItems,
    );

    // 4. Create order and payment link using existing logic
    return this.createOrderWithPayment(createOrderDto);
  }

  private async fetchAndVerifyItems(
    orderItems: CheckoutPayloadDto['orderItems'],
  ): Promise<ItemDetails[]> {
    const itemPromises = orderItems.map(async (item) => {
      let itemDetails: ItemDetails | null = null;

      if (item.itemType === 'Product') {
        const product = await this.productModel.findById(item.itemId).exec();
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.itemId} not found`,
          );
        }

        // Find the pricing for the requested size
        const pricingForSize = product.pricing.find(
          (p: Pricing) => p.size.sizeName === item.size,
        );

        if (!pricingForSize) {
          const availableSizes = product.pricing.map(
            (p: Pricing) => p.size.sizeName,
          );
          throw new BadRequestException(
            `Size ${item.size} not available for ${product.name}. Available sizes: ${availableSizes.join(', ')}`,
          );
        }

        itemDetails = {
          _id: (product._id as Types.ObjectId).toString(),
          name: product.name,
          price: pricingForSize.price,
          image: product.image,
          availableSizes: product.pricing.map((p: Pricing) => p.size.sizeName),
        };
      } else if (item.itemType === 'Package') {
        const packageItem = await this.packageModel
          .findById(item.itemId)
          .exec();
        if (!packageItem) {
          throw new NotFoundException(
            `Package with ID ${item.itemId} not found`,
          );
        }

        itemDetails = {
          _id: (packageItem._id as Types.ObjectId).toString(),
          name: packageItem.name,
          price: packageItem.price,
          image: packageItem.image,
          availableSizes: [item.size], // Packages might not have size restrictions
        };
      }

      if (!itemDetails) {
        throw new BadRequestException(`Invalid item type: ${item.itemType}`);
      }

      return itemDetails;
    });

    return Promise.all(itemPromises);
  }

  private calculateTotalPrice(
    verifiedItems: ItemDetails[],
    orderItems: CheckoutPayloadDto['orderItems'],
  ): number {
    return orderItems.reduce((total, orderItem, index) => {
      const itemDetails = verifiedItems[index];

      // Use database price, not frontend price for security
      const itemTotal = itemDetails.price * orderItem.quantity;

      this.logger.log(
        `Item: ${itemDetails.name}, DB Price: ${itemDetails.price}, Quantity: ${orderItem.quantity}, Total: ${itemTotal}`,
      );

      return total + itemTotal;
    }, 0);
  }

  private verifyTotalPrice(
    calculatedTotal: number,
    frontendTotal: number,
  ): void {
    // Allow small floating point differences (1 cent)
    const tolerance = 0.01;
    const difference = Math.abs(calculatedTotal - frontendTotal);

    if (difference > tolerance) {
      this.logger.error(
        `Price mismatch - Calculated: ${calculatedTotal}, Frontend: ${frontendTotal}, Difference: ${difference}`,
      );
      throw new BadRequestException(
        `Price verification failed. Expected: ${calculatedTotal}, Received: ${frontendTotal}`,
      );
    }

    this.logger.log(`Price verification passed: ${calculatedTotal}`);
  }

  private transformToCreateOrderDto(
    checkoutPayload: CheckoutPayloadDto,
    verifiedItems: ItemDetails[],
  ): CreateOrderDto {
    const orderItems = checkoutPayload.orderItems.map((orderItem, index) => {
      const itemDetails = verifiedItems[index];

      return {
        item: itemDetails._id,
        itemType: orderItem.itemType,
        quantity: orderItem.quantity,
        price: itemDetails.price, // Use database price
        size: orderItem.size,
        name: itemDetails.name,
        image: itemDetails.image || '',
      };
    });

    return {
      customer: checkoutPayload.customer,
      items: orderItems,
      totalPrice: this.calculateTotalPrice(
        verifiedItems,
        checkoutPayload.orderItems,
      ),
    };
  }

  private async createOrderWithPayment(
    createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderResponse> {
    // Validate order data
    this.validateOrderData(createOrderDto);

    // Start MongoDB session for transaction
    const session = await this.orderModel.db.startSession();

    try {
      const result = await session.withTransaction(async () => {
        // Create order in pending state
        const order = await this.create(createOrderDto);
        const orderId = (order._id as Types.ObjectId).toString();
        this.logger.log(`Order created with ID: ${orderId}`);

        // Generate PayPlus payment link
        const paymentResponse = await this.paymentService.getPaymentLink({
          createOrderDto,
          orderId,
        });

        // Update order with payment reference
        order.paymentDetails = {
          transaction_uid: paymentResponse.page_request_uid,
          transaction_status: 'pending',
          transaction_amount: createOrderDto.totalPrice,
          transaction_currency: 'ILS',
        };

        await order.save({ session });

        this.logger.log(
          `Payment link generated for order ${orderId}: ${paymentResponse.payment_page_link}`,
        );

        return {
          order,
          paymentLink: paymentResponse.payment_page_link,
          pageRequestUid: paymentResponse.page_request_uid,
        };
      });

      // Emit real-time event for order creation
      const orderId = (result.order._id as Types.ObjectId).toString();
      this.ordersGateway.sendOrderUpdate(orderId, {
        status: 'pending',
        message: 'Order created, awaiting payment',
      });

      return result;
    } catch (error) {
      this.logger.error('Error in generateSaleOrder:', error);
      throw new BadRequestException('Failed to create order and payment link');
    } finally {
      await session.endSession();
    }
  }

  async handlePaymentWebhook(
    webhookData: PaymentWebhookData,
  ): Promise<OrderEntity> {
    const { more_info: orderId, status, transaction } = webhookData;

    this.logger.log(
      `Processing payment webhook for order ${orderId} with status: ${status}`,
    );

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Prevent duplicate processing
    if (order.status === 'paid' && status === 'success') {
      this.logger.warn(`Order ${orderId} already marked as paid`);
      return order;
    }

    // Update order based on payment status
    const orderStatus = this.mapPaymentStatusToOrderStatus(status);
    const updatedPaymentDetails = {
      ...order.paymentDetails,
      transaction_uid: transaction.transaction_uid,
      transaction_status: transaction.transaction_status,
      transaction_amount: transaction.transaction_amount,
      transaction_currency: transaction.transaction_currency,
      transaction_date: new Date(transaction.transaction_date),
      transaction_type: transaction.transaction_type,
      number_of_payments: transaction.number_of_payments,
      first_payment_amount: transaction.first_payment_amount,
      rest_payments_amount: transaction.rest_payments_amount,
      card_holder_name: transaction.card_holder_name,
      customer_uid: transaction.customer_uid,
      terminal_uid: transaction.terminal_uid,
    };

    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        status: orderStatus,
        paymentDetails: updatedPaymentDetails,
      },
      { new: true },
    );

    if (!updatedOrder) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Emit real-time payment status update
    this.ordersGateway.sendPaymentConfirmation(orderId, orderStatus);
    this.ordersGateway.sendOrderUpdate(orderId, {
      status: orderStatus,
      message: this.getStatusMessage(orderStatus),
      paymentDetails: updatedPaymentDetails,
    });

    this.logger.log(`Order ${orderId} status updated to: ${orderStatus}`);
    return updatedOrder;
  }

  async updatePaymentStatus(
    orderId: string,
    status: string,
    paymentDetails: PaymentWebhookData['transaction'],
  ): Promise<OrderEntity> {
    // This method is kept for backward compatibility
    // The new handlePaymentWebhook method should be used instead
    return this.handlePaymentWebhook({
      more_info: orderId,
      status,
      transaction: paymentDetails,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    orders: OrderEntity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments().exec(),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByCustomerEmail(email: string): Promise<OrderEntity[]> {
    return this.orderModel
      .find({ 'customer.email': email })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderEntity> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Emit real-time update
    this.ordersGateway.sendOrderUpdate(id, {
      status: updatedOrder.status,
      message: 'Order updated',
    });

    return updatedOrder;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  private validateOrderData(createOrderDto: CreateOrderDto): void {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (createOrderDto.totalPrice <= 0) {
      throw new BadRequestException('Order total must be greater than 0');
    }

    // Validate calculated total matches items
    const calculatedTotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (Math.abs(calculatedTotal - createOrderDto.totalPrice) > 0.01) {
      throw new BadRequestException('Order total does not match item prices');
    }
  }

  private mapPaymentStatusToOrderStatus(paymentStatus: string): string {
    const statusMap: Record<string, string> = {
      success: 'paid',
      approved: 'paid',
      completed: 'paid',
      failed: 'failed',
      declined: 'failed',
      error: 'failed',
      cancelled: 'cancelled',
      pending: 'processing',
    };

    return statusMap[paymentStatus.toLowerCase()] || 'processing';
  }

  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      pending: 'Order created, awaiting payment',
      processing: 'Payment is being processed',
      paid: 'Payment completed successfully',
      failed: 'Payment failed',
      cancelled: 'Order cancelled',
    };

    return messages[status] || 'Order status updated';
  }
}
