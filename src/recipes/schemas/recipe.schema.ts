import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Ingredient extends Document {
  @Prop({ required: true, minlength: 3, maxlength: 100 })
  @ApiProperty({
    description: 'Name of the ingredient',
    example: 'Flour',
    minLength: 3,
    maxLength: 100,
  })
  name: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Quantity of the ingredient needed',
    example: '2 cups',
  })
  quantity: string;

  @Prop({ required: true, default: false })
  @ApiProperty({
    description: 'Whether this ingredient exists in our products catalog',
    example: false,
    default: false,
  })
  existsInProducts: boolean;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);

@Schema()
export class Instruction extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Step number in the recipe',
    example: 1,
  })
  step: number;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Instruction description for this step',
    example: 'Mix all ingredients in a large bowl',
  })
  description: string;
}

export const InstructionSchema = SchemaFactory.createForClass(Instruction);

@Schema()
export class Category extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Category name in Hebrew',
    example: 'עיקריות',
  })
  nameInHebrew: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Category name in English',
    example: 'Main Dishes',
  })
  nameInEnglish: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

@Schema({ timestamps: true })
export class Recipe extends Document {
  @Prop({ required: true })
  @ApiProperty({
    description: 'Name of the recipe',
    example: 'Traditional Ethiopian Injera',
  })
  name: string;

  @Prop({ required: true, minlength: 5, maxlength: 1000 })
  @ApiProperty({
    description: 'Detailed description of the recipe',
    example: 'A traditional Ethiopian flatbread made from teff flour',
    minLength: 5,
    maxLength: 1000,
  })
  description: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Main recipe image URL',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/recipes/injera.jpg',
  })
  image: string;

  @Prop({ type: [CategorySchema], required: true })
  @ApiProperty({
    description: 'Recipe categories',
    type: [Category],
  })
  categories: Category[];

  @Prop({ type: [IngredientSchema], required: true })
  @ApiProperty({
    description: 'List of ingredients needed for the recipe',
    type: [Ingredient],
  })
  ingredients: Ingredient[];

  @Prop({ required: true, enum: ['Easy', 'Medium', 'Hard'] })
  @ApiProperty({
    description: 'Difficulty level of the recipe',
    example: 'Medium',
    enum: ['Easy', 'Medium', 'Hard'],
  })
  difficulty: string;

  @Prop({ type: [InstructionSchema], required: true })
  @ApiProperty({
    description: 'Step-by-step cooking instructions',
    type: [Instruction],
  })
  instructions: Instruction[];

  @Prop({ required: true })
  @ApiProperty({
    description: 'Preparation time required',
    example: '45 minutes',
  })
  prepTime: string;

  @Prop({ required: true, min: 1, max: 100 })
  @ApiProperty({
    description: 'Number of servings this recipe makes',
    example: 4,
    minimum: 1,
    maximum: 100,
  })
  servings: number;

  @ApiProperty({
    description: 'Date when the recipe was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Date when the recipe was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt?: Date;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
