import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createOrder')
  create(@MessageBody() _createOrderDto: CreateOrderDto) {
    return { message: 'Order creation should be handled via REST API' };
  }

  @SubscribeMessage('findAllOrders')
  findAll() {
    return { message: 'Order fetching should be handled via REST API' };
  }

  @SubscribeMessage('findOneOrder')
  findOne(@MessageBody() _id: number) {
    return { message: 'Order fetching should be handled via REST API' };
  }

  @SubscribeMessage('updateOrder')
  update(
    @MessageBody() _id: string,
    @MessageBody() _updateOrderDto: UpdateOrderDto,
  ) {
    return { message: 'Order updates should be handled via REST API' };
  }

  @SubscribeMessage('removeOrder')
  remove(@MessageBody() _id: number) {
    return { message: 'Order deletion should be handled via REST API' };
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room);
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.leave(room);
  }

  sendPaymentConfirmation(orderId: string, status: string): void {
    this.server
      .to(`order_${orderId}`)
      .emit('paymentStatus', { orderId, status });
  }

  sendOrderUpdate(
    orderId: string,
    data: { status: string; message: string; paymentDetails?: any },
  ): void {
    this.server
      .to(`order_${orderId}`)
      .emit('orderUpdate', { orderId, ...data });
  }
}
