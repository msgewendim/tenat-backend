import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Address extends Document {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  streetNum: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  postal_code: string;

  @Prop({ default: 'Israel' })
  country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema()
export class Customer extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: AddressSchema, required: true })
  address: Address;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

@Schema()
export class OrderItem extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, refPath: 'items.itemType', required: true })
  item: string;

  @Prop({ required: true, enum: ['Product', 'Package'] })
  itemType: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  image: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema()
export class PaymentDetails extends Document {
  @Prop()
  transaction_uid: string;

  @Prop()
  transaction_status: string;

  @Prop()
  transaction_amount: number;

  @Prop({ default: 'ILS' })
  transaction_currency: string;

  @Prop()
  transaction_date: Date;

  @Prop()
  transaction_type: string;

  @Prop({ default: 1 })
  number_of_payments: number;

  @Prop()
  first_payment_amount: number;

  @Prop()
  rest_payments_amount: number;

  @Prop()
  card_holder_name: string;

  @Prop()
  customer_uid: string;

  @Prop()
  terminal_uid: string;
}

export const PaymentDetailsSchema = SchemaFactory.createForClass(PaymentDetails);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: CustomerSchema, required: true })
  customer: Customer;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ enum: ['pending', 'processing', 'paid', 'failed', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ type: PaymentDetailsSchema, default: null })
  paymentDetails: PaymentDetails;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
