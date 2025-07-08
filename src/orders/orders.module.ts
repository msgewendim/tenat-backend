import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { PaymentService } from './payments/payment.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OrdersGateway } from './orders.gateway';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Package, PackageSchema } from '../packages/schemas/package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Package.name, schema: PackageSchema },
    ]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PaymentService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
