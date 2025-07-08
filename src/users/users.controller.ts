import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from '@nestjs/swagger';
import { User } from './schemas/user.schema';

import { CartItemDto } from './dto/cart-item.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Return all users.', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Return a single user.',
    type: User,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: User,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/cart')
  @UsePipes(new ValidationPipe())
  @ApiResponse({
    status: 201,
    description: 'The item has been successfully added to the cart.',
    type: User,
  })
  addToCart(@Param('id') id: string, @Body() cartItemDto: CartItemDto) {
    return this.usersService.addToCart(id, cartItemDto);
  }

  @Delete(':id/cart')
  @ApiResponse({
    status: 200,
    description: 'The cart has been successfully cleared.',
    type: User,
  })
  clearCart(@Param('id') id: string) {
    return this.usersService.clearCart(id);
  }
}
