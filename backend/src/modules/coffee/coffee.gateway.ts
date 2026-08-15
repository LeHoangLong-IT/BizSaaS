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

  // Hàm này được gọi khi có sản phẩm/danh mục/topping mới được thêm/sửa/xóa
  notifyMenuUpdated() {
    this.server.emit('menuUpdated');
  }

  // Hàm này được gọi khi thay đổi trạng thái đơn (vd: Bếp làm xong)
  notifyOrderStatusChanged(orderId: number, status: string) {
    this.server.emit('orderStatusChanged', { orderId, status });
  }

  // Hàm này được gọi khi thay đổi trạng thái bàn
  notifyTableStatusChanged() {
    this.server.emit('tableStatusChanged');
  }
}
