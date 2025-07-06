import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ example: 'Family Package' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'package.jpg', required: false })
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @IsNotEmpty()
  cookingTime: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  ingredientsQuantity: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @IsNotEmpty()
  peoplesQuantity: number;
}
