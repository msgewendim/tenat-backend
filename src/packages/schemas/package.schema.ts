import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema()
export class Package extends Document {
  @Prop({ required: true, unique: true })
  @ApiProperty({
    description: 'Name of the package',
    example: 'Family Dinner Package',
  })
  name: string;

  @Prop({ required: false })
  @ApiProperty({
    description: 'Package image URL',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/packages/family-dinner.jpg',
    required: false,
  })
  image: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Price of the package',
    example: 89.99,
  })
  price: number;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Total cooking time in minutes',
    example: 60,
  })
  cookingTime: number;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Number of ingredients included',
    example: 12,
  })
  ingredientsQuantity: number;

  @Prop({ required: true, min: 1, max: 100 })
  @ApiProperty({
    description: 'Number of people this package serves',
    example: 4,
    minimum: 1,
    maximum: 100,
  })
  peoplesQuantity: number;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
