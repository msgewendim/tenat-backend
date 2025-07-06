import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class IngredientDto {
  @ApiProperty({ example: 'Flour' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2 cups' })
  @IsString()
  @IsNotEmpty()
  quantity: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  existsInProducts: boolean;
}

class InstructionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  step: number;

  @ApiProperty({ example: 'Mix all ingredients.' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

class CategoryDto {
  @ApiProperty({ example: 'קטגוריה' })
  @IsString()
  @IsNotEmpty()
  nameInHebrew: string;

  @ApiProperty({ example: 'Category' })
  @IsString()
  @IsNotEmpty()
  nameInEnglish: string;
}

export class CreateRecipeDto {
  @ApiProperty({ example: 'Delicious Recipe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A very delicious recipe.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'recipe.jpg', required: false })
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty({ type: [CategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @ApiProperty({ type: [IngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @ApiProperty({ enum: ['Easy', 'Medium', 'Hard'], example: 'Easy' })
  @IsEnum(['Easy', 'Medium', 'Hard'])
  @IsNotEmpty()
  difficulty: string;

  @ApiProperty({ type: [InstructionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructionDto)
  instructions: InstructionDto[];

  @ApiProperty({ example: '30 minutes' })
  @IsString()
  @IsNotEmpty()
  prepTime: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @IsNotEmpty()
  servings: number;
}
