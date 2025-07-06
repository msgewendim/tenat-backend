import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Feature extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);

@Schema()
export class FeatureObject extends Document {
  @Prop({ type: [FeatureSchema], default: [] })
  value: Feature[];
}

export const FeatureObjectSchema = SchemaFactory.createForClass(FeatureObject);

@Schema()
export class ProductSize extends Document {
  @Prop({ required: true })
  sizeName: string;

  @Prop({ required: true })
  sizeQuantity: number;
}

export const ProductSizeSchema = SchemaFactory.createForClass(ProductSize);

@Schema()
export class Pricing extends Document {
  @Prop({ type: ProductSizeSchema, required: true })
  size: ProductSize;

  @Prop({ required: true })
  price: number;
}

export const PricingSchema = SchemaFactory.createForClass(Pricing);

@Schema()
export class SubCategory extends Document {
  @Prop({ required: true })
  nameInHebrew: string;

  @Prop({ required: true })
  nameInEnglish: string;

  @Prop({ required: true })
  nameOfParentCategory: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

@Schema()
export class Category extends Document {
  @Prop({ required: true })
  nameInHebrew: string;

  @Prop({ required: true })
  nameInEnglish: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

@Schema()
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, minlength: 5, maxlength: 1000 })
  shortDescription: string;

  @Prop({ type: [PricingSchema], required: true })
  pricing: Pricing[];

  @Prop({ required: false, default: false })
  image: string;

  @Prop({ type: [CategorySchema], required: true })
  categories: Category[];

  @Prop({ type: [SubCategorySchema], default: [] })
  subCategories: SubCategory[];

  @Prop({ type: FeatureObjectSchema, required: true })
  features: FeatureObject;

  @Prop({ default: 0, min: 0 })
  totalSales: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
