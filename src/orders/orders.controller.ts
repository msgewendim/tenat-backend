import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  Headers,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrdersService, PaymentWebhookData } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CheckoutPayloadDto } from './dto/checkout-payload.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderEntity,
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Post('generate-sale')
  @ApiOperation({
    summary: 'Generate sale order with PayPlus payment link',
    description:
      'Creates order from minimal cart data, verifies pricing from database, and generates PayPlus payment link',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment link generated successfully',
    schema: {
      type: 'object',
      properties: {
        order: { $ref: '#/components/schemas/OrderEntity' },
        paymentLink: { type: 'string' },
        pageRequestUid: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order data or price verification failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Product or Package not found',
  })
  async generateSale(@Body() checkoutPayload: CheckoutPayloadDto) {
    try {
      this.logger.log('Received checkout request');
      return await this.ordersService.generateSaleOrder(checkoutPayload);
    } catch (error) {
      this.logger.error('Error in generateSale:', error);
      throw error;
    }
  }

  @Post('webhook/payment-notification')
  @ApiOperation({
    summary: 'Handle PayPlus payment webhook',
    description: 'Receives and processes payment status updates from PayPlus',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or payload',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async handlePaymentWebhook(
    @Body() webhookData: PaymentWebhookData,
    @Headers('x-payplus-signature') signature?: string,
  ) {
    try {
      this.logger.log(
        `Payment webhook received for order: ${webhookData.more_info}`,
      );

      // Verify webhook signature if provided (recommended for production)
      if (signature) {
        const isValid = this.ordersService[
          'paymentService'
        ].verifyWebhookSignature(JSON.stringify(webhookData), signature);
        if (!isValid) {
          throw new BadRequestException('Invalid webhook signature');
        }
      }

      const updatedOrder =
        await this.ordersService.handlePaymentWebhook(webhookData);
      this.logger.log(`Order ${webhookData.more_info} updated successfully`);

      return {
        success: true,
        order: updatedOrder,
        message: 'Payment status updated successfully',
      };
    } catch (error) {
      this.logger.error('Error processing payment webhook:', error);
      throw error;
    }
  }

  // Legacy webhook endpoint for backward compatibility
  @Post('notify')
  @ApiOperation({
    summary: 'Legacy payment notification endpoint',
    description:
      'Legacy endpoint for payment notifications (use webhook/payment-notification instead)',
  })
  async notify(@Body() notificationData: any) {
    this.logger.warn(
      'Legacy notify endpoint used - consider migrating to webhook/payment-notification',
    );
    return this.handlePaymentWebhook(notificationData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        orders: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrderEntity' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.ordersService.findAll(pageNum, limitNum);
  }

  @Get('customer/:email')
  @ApiOperation({ summary: 'Get orders by customer email' })
  @ApiResponse({
    status: 200,
    description: 'Customer orders retrieved successfully',
    type: [OrderEntity],
  })
  findByCustomerEmail(@Param('email') email: string) {
    return this.ordersService.findByCustomerEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
