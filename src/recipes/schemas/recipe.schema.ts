import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Ingredient extends Document {
  @Prop({ required: true, minlength: 3, maxlength: 100 })
  name: string;

  @Prop({ required: true })
  quantity: string;

  @Prop({ required: true, default: false })
  existsInProducts: boolean;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);

@Schema()
export class Instruction extends Document {
  @Prop({ required: true })
  step: number;

  @Prop({ required: true })
  description: string;
}

export const InstructionSchema = SchemaFactory.createForClass(Instruction);

@Schema()
export class Category extends Document {
  @Prop({ required: true })
  nameInHebrew: string;

  @Prop({ required: true })
  nameInEnglish: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

@Schema({ timestamps: true })
export class Recipe extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, minlength: 5, maxlength: 1000 })
  description: string;

  @Prop({ required: true })
  image: string;

  @Prop({ type: [CategorySchema], required: true })
  categories: Category[];

  @Prop({ type: [IngredientSchema], required: true })
  ingredients: Ingredient[];

  @Prop({ required: true, enum: ['Easy', 'Medium', 'Hard'] })
  difficulty: string;

  @Prop({ type: [InstructionSchema], required: true })
  instructions: Instruction[];

  @Prop({ required: true })
  prepTime: string;

  @Prop({ required: true, min: 1, max: 100 })
  servings: number;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
