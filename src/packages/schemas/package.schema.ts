import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Package extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  cookingTime: number;

  @Prop({ required: true })
  ingredientsQuantity: number;

  @Prop({ required: true, min: 1, max: 100 })
  peoplesQuantity: number;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
