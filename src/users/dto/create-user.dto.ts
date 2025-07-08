import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123-456-7890' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({
    example: { street: '123 Main St', city: 'Anytown', zip: '12345' },
  })
  @IsNotEmpty()
  address: {
    street: string;
    city: string;
    zip?: string;
  };

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ required: false })
  @IsOptional()
  orders: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  cart: any[];
}
