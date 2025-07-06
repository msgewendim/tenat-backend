import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiResponse } from '@nestjs/swagger';
import { Order } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiResponse({ status: 201, description: 'The order has been successfully created.', type: Order })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto)
  }

  @Post('generate-sale')
  @UsePipes(new ValidationPipe())
  @ApiResponse({ status: 201, description: 'The payment link has been successfully created.' })
  getPaymentLink(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.getPaymentLink(createOrderDto);
  }

  @Post('notify')
  @ApiResponse({ status: 201, description: 'The payment status has been successfully updated.' })
  successfulPayment(@Body() body: any) {
    const { more_info, status, transaction } = body;
    return this.ordersService.updatePaymentStatus(more_info, status, transaction);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Return all orders.', type: [Order] })
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.ordersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Return a single order.', type: Order })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiResponse({ status: 200, description: 'The order has been successfully updated.', type: Order })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The order has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
