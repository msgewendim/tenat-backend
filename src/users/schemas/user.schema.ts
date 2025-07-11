import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { CartItem, CartItemSchema } from './cart-item.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '507f1f77bcf86cd799439011',
  })
  _id?: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name: string;

  @Prop({ required: true, unique: true })
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Mobile phone number',
    example: '+1-555-123-4567',
  })
  mobile: string;

  @Prop({ type: { street: String, city: String, zip: String }, required: true })
  @ApiProperty({
    description: 'User address information',
    example: {
      street: '123 Main St',
      city: 'Anytown',
      zip: '12345',
    },
  })
  address: {
    street: string;
    city: string;
    zip: string;
  };

  @Prop({ required: true })
  @ApiProperty({
    description: 'User role in the system',
    example: 'user',
    enum: ['user', 'admin', 'moderator'],
  })
  role: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orders' }] })
  @ApiProperty({
    description: 'Array of order IDs associated with this user',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    required: false,
  })
  orders: any[]; // Replace with actual Order type

  @Prop({ type: [CartItemSchema] })
  @ApiProperty({
    description: 'Shopping cart items',
    type: [CartItem],
    required: false,
  })
  cart: CartItem[];

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
