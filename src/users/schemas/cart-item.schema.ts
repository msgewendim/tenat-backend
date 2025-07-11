import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class CartItem extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  @ApiProperty({
    description: 'ID of the product in the cart',
    example: '507f1f77bcf86cd799439011',
  })
  productId: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Quantity of the product in the cart',
    example: 2,
    minimum: 1,
  })
  quantity: number;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Size of the product',
    example: '500g',
  })
  size: string;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
