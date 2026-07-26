import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class CoffeeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[WebSocket] KDS connected: ${client.id}`);
  }

  // Hàm này được gọi bởi CoffeeController khi có khách Order thành công
  notifyNewOrder(order: any) {
    // Emit sự kiện 'newOrder' tới các client (iPad của quầy Barista)
    this.server.emit('newOrder', order);
  }
}
