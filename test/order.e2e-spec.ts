import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PaymentService } from '../src/orders/payments/payment.service';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { CreateProductDto } from '../src/products/dto/create-product.dto';
import { CartItemDto } from '../src/users/dto/cart-item.dto';
import { CreateOrderDto } from '../src/orders/dto/create-order.dto';
import { getConnectionToken } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';

describe('Order Workflow (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  const createdIds: {
    userIds: string[];
    productIds: string[];
    orderIds: string[];
  } = {
    userIds: [],
    productIds: [],
    orderIds: [],
  };

  const mockPaymentService = {
    getPaymentLink: jest.fn().mockResolvedValue('mock_payment_link'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PaymentService)
      .useValue(mockPaymentService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  const ObjectId = (id: string) => {
    return new mongoose.Types.ObjectId(id);
  };
  afterEach(async () => {
    // Clean up created data after each test
    if (createdIds.userIds.length > 0) {
      await connection.collection('users').deleteMany({
        _id: { $in: createdIds.userIds.map((id) => ObjectId(id)) },
      });
      createdIds.userIds = [];
    }
    if (createdIds.productIds.length > 0) {
      await connection.collection('products').deleteMany({
        _id: { $in: createdIds.productIds.map((id) => ObjectId(id)) },
      });
      createdIds.productIds = [];
    }
    if (createdIds.orderIds.length > 0) {
      await connection.collection('orders').deleteMany({
        _id: { $in: createdIds.orderIds.map((id) => ObjectId(id)) },
      });
      createdIds.orderIds = [];
    }
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  it('should successfully complete an order workflow', async () => {
    // 1. Create a user
    const userDto: CreateUserDto = {
      name: 'E2E Test User',
      email: 'e2e-test@example.com', // Use a unique email for the test
      mobile: '1234567890',
      address: { street: '123 Test St', city: 'Testville', zip: '12345' },
      role: 'user',
      orders: [],
      cart: [],
    };
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send(userDto)
      .expect(201);
    const userId = userResponse.body._id;
    createdIds.userIds.push(userResponse.body._id);

    // 2. Create a product
    const productDto: CreateProductDto = {
      name: 'E2E Test Product',
      shortDescription: 'A product for E2E testing',
      pricing: [{ size: { sizeName: 'M', sizeQuantity: 1 }, price: 100 }],
      image: 'e2e.jpg',
      categories: [{ nameInHebrew: 'בדיקה', nameInEnglish: 'Testing' }],
      subCategories: [],
      features: { value: [{ title: 'E2E', description: 'Testable' }] },
      totalSales: 0,
    };
    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .send(productDto)
      .expect(201);
    const productId = productResponse.body._id;
    createdIds.productIds.push(productResponse.body._id);

    // 3. Add product to cart
    const cartItemDto: CartItemDto = {
      productId: productId,
      quantity: 1,
      size: 'M',
    };
    await request(app.getHttpServer())
      .post(`/users/${userId}/cart`)
      .send(cartItemDto)
      .expect(201);

    // 4. Create an order
    const orderDto: CreateOrderDto = {
      customer: {
        firstName: 'E2E',
        lastName: 'User',
        email: 'e2e-test@example.com',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          streetNum: '1',
          city: 'Testville',
          postal_code: '12345',
          country: 'Israel',
        },
      },
      items: [
        {
          item: productId,
          itemType: 'Product',
          quantity: 1,
          price: 100,
          size: 'M',
          name: 'E2E Test Product',
          image: 'e2e.jpg',
        },
      ],
      totalPrice: 100,
    };

    const orderResponse = await request(app.getHttpServer())
      .post('/orders/create')
      .send(orderDto)
      .expect(201);

    const orderId = orderResponse.body._id;
    createdIds.orderIds.push(orderResponse.body._id);

    // 5. Simulate successful payment
    const notificationPayload = {
      more_info: orderId,
      status: 'paid',
      transaction: {
        /* mock transaction details */
      },
    };
    await request(app.getHttpServer())
      .post('/orders/notify')
      .send(notificationPayload)
      .expect(201);

    // 6. Verify order status
    const finalOrderResponse = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .expect(200);

    expect(finalOrderResponse.body.status).toEqual('paid');
  });
});
