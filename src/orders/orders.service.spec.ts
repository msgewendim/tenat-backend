import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';
import { PaymentService } from './payments/payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';

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

describe('OrdersService', () => {
  let service: OrdersService;
  let model: Model<OrderEntity>;
  let paymentService: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            create: jest.fn().mockResolvedValue(mockOrder),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            getPaymentLink: jest.fn().mockResolvedValue('payment_link'),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    model = module.get<Model<OrderEntity>>(getModelToken(Order.name));
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPaymentLink', () => {
    it('should create an order and return a payment link', async () => {
      const createOrderDto: CreateOrderDto = {
        customer: mockOrder.customer,
        items: [],
        totalPrice: 100,
      };
      const result = await service.getPaymentLink(createOrderDto);
      expect(paymentService.getPaymentLink).toHaveBeenCalled();
      expect(result).toEqual('payment_link');
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update the payment status and return the updated order', async () => {
      const updatedOrder = { ...mockOrder, status: 'paid' };
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedOrder),
      } as any);

      const result = await service.updatePaymentStatus(
        mockOrder._id,
        'paid',
        {},
      );
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOrder._id,
        { status: 'paid', paymentDetails: {} },
        { new: true },
      );
      expect(result).toEqual(updatedOrder);
    });
  });
});
