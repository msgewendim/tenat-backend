import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  size: string;
}
