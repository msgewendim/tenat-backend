import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class FeatureDto {
  @ApiProperty({ example: 'Feature Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Feature Description' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

class FeatureObjectDto {
  @ApiProperty({ type: [FeatureDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  value: FeatureDto[];
}

class ProductSizeDto {
  @ApiProperty({ example: 'M' })
  @IsString()
  @IsNotEmpty()
  sizeName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  sizeQuantity: number;
}

class PricingDto {
  @ApiProperty({ type: ProductSizeDto })
  @ValidateNested()
  @Type(() => ProductSizeDto)
  size: ProductSizeDto;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}

class SubCategoryDto {
  @ApiProperty({ example: 'תת קטגוריה' })
  @IsString()
  @IsNotEmpty()
  nameInHebrew: string;

  @ApiProperty({ example: 'Sub Category' })
  @IsString()
  @IsNotEmpty()
  nameInEnglish: string;

  @ApiProperty({ example: 'Main Category' })
  @IsString()
  @IsNotEmpty()
  nameOfParentCategory: string;
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

export class CreateProductDto {
  @ApiProperty({ example: 'Amazing Product' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'This product is truly amazing.' })
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @ApiProperty({ type: [PricingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  pricing: PricingDto[];

  @ApiProperty({ example: 'product.jpg', required: false })
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty({ type: [CategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @ApiProperty({ type: [SubCategoryDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubCategoryDto)
  subCategories: SubCategoryDto[];

  @ApiProperty({ type: FeatureObjectDto })
  @ValidateNested()
  @Type(() => FeatureObjectDto)
  features: FeatureObjectDto;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  totalSales: number;
}
