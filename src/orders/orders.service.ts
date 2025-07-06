import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './schemas/order.schema';
import { OrderEntity } from './entities/order.entity';
import { PaymentService } from './payments/payment.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderEntity>,
    private readonly paymentService: PaymentService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    return this.orderModel.create(createOrderDto);
  }

  async getPaymentLink(createOrderDto: CreateOrderDto): Promise<string> {
    const order = await this.create(createOrderDto);
    const payload = {
      payment_page_request: {
        // ... construct payload for PayPlus
      },
    };
    return this.paymentService.getPaymentLink(payload);
  }

  async updatePaymentStatus(orderId: string, status: string, paymentDetails: any): Promise<OrderEntity> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      { status, paymentDetails },
      { new: true },
    ).exec();

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }
    return updatedOrder;
  }

  async findAll(page: number, limit: number): Promise<OrderEntity[]> {
    return this.orderModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<OrderEntity | null> {
    return this.orderModel.findById(id).exec();
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderEntity | null> {
    return this.orderModel.findByIdAndUpdate(id, updateOrderDto, { new: true }).exec();
  }

  async remove(id: string): Promise<OrderEntity | null> {
    return this.orderModel.findByIdAndDelete(id).exec();
  }
}
