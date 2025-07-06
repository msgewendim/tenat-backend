import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { CartItem, CartItemSchema } from './cart-item.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ type: { street: String, city: String, zip: String }, required: true })
  address: {
    street: string;
    city: string;
    zip: string;
  };

  @Prop({ required: true })
  role: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orders' }] })
  orders: any[]; // Replace with actual Order type

  @Prop({ type: [CartItemSchema] })
  cart: CartItem[];
}

export const UserSchema = SchemaFactory.createForClass(User);
