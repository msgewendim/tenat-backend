import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentService } from './payments/payment.service';
import { CreateOrderDto } from './dto/create-order.dto';

const mockOrder = {
  _id: 'orderId',
  customer: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '1234567890',
    address: {
      street: 'Test Street',
      streetNum: '123',
      city: 'Test City',
      postal_code: '12345',
      country: 'Israel',
    },
  },
  items: [],
  totalPrice: 100,
  status: 'pending',
  paymentDetails: null,
};

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            getPaymentLink: jest.fn().mockResolvedValue('payment_link'),
            updatePaymentStatus: jest.fn().mockResolvedValue(mockOrder),
          },
        },
        {
          provide: PaymentService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPaymentLink', () => {
    it('should call getPaymentLink on the service', async () => {
      const createOrderDto: CreateOrderDto = {
        customer: mockOrder.customer,
        items: [],
        totalPrice: 100,
      };
      await controller.getPaymentLink(createOrderDto);
      expect(service.getPaymentLink).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('successfulPayment', () => {
    it('should call updatePaymentStatus on the service', async () => {
      const body = {
        more_info: 'orderId',
        status: 'paid',
        transaction: {},
      };
      await controller.successfulPayment(body);
      expect(service.updatePaymentStatus).toHaveBeenCalledWith(
        'orderId',
        'paid',
        {},
      );
    });
  });
});
