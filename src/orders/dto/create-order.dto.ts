import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '1A' })
  @IsString()
  @IsNotEmpty()
  streetNum: string;

  @ApiProperty({ example: 'Anytown' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '12345', required: false })
  @IsOptional()
  @IsString()
  postal_code: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country: string;
}

class CustomerDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123-456-7890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

class CartItemDto {
  @ApiProperty({ example: '60f7e1b9b5a8a7001f8e8b8b' })
  @IsString()
  @IsNotEmpty()
  item: string;

  @ApiProperty({ enum: ['Product', 'Package'], example: 'Product' })
  @IsString()
  @IsNotEmpty()
  itemType: 'Product' | 'Package';

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'L' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ example: 'Amazing Product' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'product.jpg', required: false })
  @IsOptional()
  @IsString()
  image: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: CustomerDto })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ApiProperty({ example: 99.98 })
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
}
