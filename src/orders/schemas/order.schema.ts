import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Address extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Street name',
    example: 'Main Street',
  })
  street: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Street number',
    example: '123',
  })
  streetNum: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'City name',
    example: 'Tel Aviv',
  })
  city: string;

  @Prop()
  @ApiProperty({
    description: 'Postal code',
    example: '12345',
    required: false,
  })
  postal_code: string;

  @Prop({ default: 'Israel' })
  @ApiProperty({
    description: 'Country name',
    example: 'Israel',
    default: 'Israel',
  })
  country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema()
export class Customer extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  firstName: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  lastName: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Customer phone number',
    example: '+972-50-123-4567',
  })
  phone: string;

  @Prop({ type: AddressSchema, required: true })
  @ApiProperty({
    description: 'Customer address',
    type: Address,
  })
  address: Address;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

@Schema()
export class OrderItem extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    refPath: 'items.itemType',
    required: true,
  })
  @ApiProperty({
    description: 'ID of the item (Product or Package)',
    example: '507f1f77bcf86cd799439011',
  })
  item: string;

  @Prop({ required: true, enum: ['Product', 'Package'] })
  @ApiProperty({
    description: 'Type of the item',
    enum: ['Product', 'Package'],
    example: 'Product',
  })
  itemType: string;

  @Prop({ required: true, min: 1 })
  @ApiProperty({
    description: 'Quantity of the item',
    example: 2,
    minimum: 1,
  })
  quantity: number;

  @Prop({ required: true, min: 0 })
  @ApiProperty({
    description: 'Price of the item',
    example: 29.99,
    minimum: 0,
  })
  price: number;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Size of the product',
    example: '500g',
  })
  size: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Name of the item',
    example: 'Ethiopian Spice Mix',
  })
  name: string;

  @Prop()
  @ApiProperty({
    description: 'Item image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  image: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema()
export class PaymentDetails extends Document {
  @Prop()
  @ApiProperty({
    description: 'Transaction unique identifier',
    example: 'txn_123456789',
    required: false,
  })
  transaction_uid: string;

  @Prop()
  @ApiProperty({
    description: 'Transaction status',
    example: 'completed',
    required: false,
  })
  transaction_status: string;

  @Prop()
  @ApiProperty({
    description: 'Transaction amount',
    example: 159.99,
    required: false,
  })
  transaction_amount: number;

  @Prop({ default: 'ILS' })
  @ApiProperty({
    description: 'Transaction currency',
    example: 'ILS',
    default: 'ILS',
  })
  transaction_currency: string;

  @Prop()
  @ApiProperty({
    description: 'Transaction date',
    example: '2023-12-01T10:30:00Z',
    required: false,
  })
  transaction_date: Date;

  @Prop()
  @ApiProperty({
    description: 'Transaction type',
    example: 'credit_card',
    required: false,
  })
  transaction_type: string;

  @Prop({ default: 1 })
  @ApiProperty({
    description: 'Number of payments',
    example: 1,
    default: 1,
  })
  number_of_payments: number;

  @Prop()
  @ApiProperty({
    description: 'First payment amount',
    example: 159.99,
    required: false,
  })
  first_payment_amount: number;

  @Prop()
  @ApiProperty({
    description: 'Rest payments amount',
    example: 0,
    required: false,
  })
  rest_payments_amount: number;

  @Prop()
  @ApiProperty({
    description: 'Card holder name',
    example: 'John Doe',
    required: false,
  })
  card_holder_name: string;

  @Prop()
  @ApiProperty({
    description: 'Customer unique identifier',
    example: 'cust_123456789',
    required: false,
  })
  customer_uid: string;

  @Prop()
  @ApiProperty({
    description: 'Terminal unique identifier',
    example: 'term_123456789',
    required: false,
  })
  terminal_uid: string;
}

export const PaymentDetailsSchema =
  SchemaFactory.createForClass(PaymentDetails);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: CustomerSchema, required: true })
  @ApiProperty({
    description: 'Customer information',
    type: Customer,
  })
  customer: Customer;

  @Prop({ type: [OrderItemSchema], required: true })
  @ApiProperty({
    description: 'List of ordered items',
    type: [OrderItem],
  })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  @ApiProperty({
    description: 'Total price of the order',
    example: 159.99,
    minimum: 0,
  })
  totalPrice: number;

  @Prop({
    enum: ['pending', 'processing', 'paid', 'failed', 'cancelled'],
    default: 'pending',
  })
  @ApiProperty({
    description: 'Order status',
    enum: ['pending', 'processing', 'paid', 'failed', 'cancelled'],
    example: 'pending',
    default: 'pending',
  })
  status: string;

  @Prop({ type: PaymentDetailsSchema, default: null })
  @ApiProperty({
    description: 'Payment details',
    type: PaymentDetails,
    required: false,
  })
  paymentDetails: PaymentDetails;

  @ApiProperty({
    description: 'Date when the order was created',
    example: '2023-12-01T10:30:00Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Date when the order was last updated',
    example: '2023-12-01T10:30:00Z',
  })
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

@Schema()
export class MinimalCartItem extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'ID of the item',
    example: '507f1f77bcf86cd799439011',
  })
  itemId: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Quantity of the item',
    example: 2,
  })
  quantity: number;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Size of the item',
    example: '500g',
  })
  size: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Price of the item',
    example: 29.99,
  })
  price: number;
}
