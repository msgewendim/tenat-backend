import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEmail,
  IsIn,
} from 'class-validator';
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

  @ApiProperty({ example: 'Tel Aviv' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '12345', required: false })
  @IsOptional()
  @IsString()
  postal_code: string;

  @ApiProperty({ example: 'Israel', required: false })
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

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

class MinimalCartItemDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID of the item (Product or Package)',
  })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the item in the cart',
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    example: '500g',
    description: 'Size of the product in grams or kg',
  })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({
    example: 25.5,
    description: 'Price of the item in the cart',
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 'Product',
    description: 'Type of the item (Product or Package)',
    enum: ['Product', 'Package'],
  })
  @IsIn(['Product', 'Package'])
  itemType: 'Product' | 'Package';
}

export class CheckoutPayloadDto {
  @ApiProperty({
    example: 99.98,
    description: 'Total price of all items',
  })
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @ApiProperty({
    type: CustomerDto,
    description: 'Customer information',
  })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiProperty({
    type: [MinimalCartItemDto],
    description: 'Minimal cart items with only IDs and essential data',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MinimalCartItemDto)
  orderItems: MinimalCartItemDto[];
}
