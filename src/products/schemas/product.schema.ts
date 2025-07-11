import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema()
export class Feature extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Title of the feature',
    example: 'Organic',
  })
  title: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Description of the feature',
    example: 'Made with 100% organic ingredients',
  })
  description: string;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);

@Schema()
export class FeatureObject extends Document {
  @Prop({ type: [FeatureSchema], default: [] })
  @ApiProperty({
    type: [Feature],
    description: 'Array of product features',
    example: [
      {
        title: 'Organic',
        description: 'Made with 100% organic ingredients',
      },
    ],
  })
  value: Feature[];
}

export const FeatureObjectSchema = SchemaFactory.createForClass(FeatureObject);

@Schema()
export class ProductSize extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Name of the size',
    example: '500g',
  })
  sizeName: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Quantity for this size',
    example: 500,
  })
  sizeQuantity: number;
}

export const ProductSizeSchema = SchemaFactory.createForClass(ProductSize);

@Schema()
export class Pricing extends Document {
  @Prop({ type: ProductSizeSchema, required: true })
  @ApiProperty({
    type: ProductSize,
    description: 'Size information for this pricing tier',
  })
  size: ProductSize;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Price for this size',
    example: 25.99,
  })
  price: number;
}

export const PricingSchema = SchemaFactory.createForClass(Pricing);

@Schema()
export class SubCategory extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Sub-category name in Hebrew',
    example: 'תבלינים חריפים',
  })
  nameInHebrew: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Sub-category name in English',
    example: 'Hot Spices',
  })
  nameInEnglish: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Name of the parent category',
    example: 'Spices',
  })
  nameOfParentCategory: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

@Schema()
export class Category extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Category name in Hebrew',
    example: 'תבלינים',
  })
  nameInHebrew: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Category name in English',
    example: 'Spices',
  })
  nameInEnglish: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

@Schema()
export class Product extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Name of the product',
    example: 'Ethiopian Berbere Spice Mix',
  })
  name: string;

  @Prop({ required: true, minlength: 5, maxlength: 1000 })
  @ApiProperty({
    description: 'Short description of the product',
    example: 'Authentic Ethiopian spice blend perfect for traditional stews',
    minLength: 5,
    maxLength: 1000,
  })
  shortDescription: string;

  @Prop({ type: [PricingSchema], required: true })
  @ApiProperty({
    type: [Pricing],
    description: 'Available pricing options for different sizes',
  })
  pricing: Pricing[];

  @Prop({ required: false, default: '' })
  @ApiProperty({
    description: 'Main product image URL',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/products/berbere.jpg',
    required: false,
  })
  image: string;

  @Prop({ type: [String], default: [] })
  @ApiProperty({
    type: [String],
    description: 'Array of additional product image URLs',
    example: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/products/berbere-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/products/berbere-2.jpg',
    ],
    required: false,
  })
  images: string[];

  @Prop({ type: [CategorySchema], required: true })
  @ApiProperty({
    type: [Category],
    description: 'Product categories',
  })
  categories: Category[];

  @Prop({ type: [SubCategorySchema], default: [] })
  @ApiProperty({
    type: [SubCategory],
    description: 'Product sub-categories',
    required: false,
  })
  subCategories: SubCategory[];

  @Prop({ type: FeatureObjectSchema, required: true })
  @ApiProperty({
    type: FeatureObject,
    description: 'Product features and attributes',
  })
  features: FeatureObject;

  @Prop({ default: 0, min: 0 })
  @ApiProperty({
    description: 'Total number of sales for this product',
    example: 150,
    minimum: 0,
    default: 0,
  })
  totalSales: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
