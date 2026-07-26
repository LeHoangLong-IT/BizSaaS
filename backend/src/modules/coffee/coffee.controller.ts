import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CoffeeService } from './coffee.service';
import { CoffeeGateway } from './coffee.gateway';

@Controller('api/tenant/coffee')
export class CoffeeController {
  constructor(
    private readonly coffeeService: CoffeeService,
    private readonly coffeeGateway: CoffeeGateway
  ) {}

  @Get('menu')
  async getMenu() {
    const products = await this.coffeeService.getMenu();
    const toppings = await this.coffeeService.getToppings();
    return { products, toppings };
  }

  @Get('tables')
  async getTables() {
    return this.coffeeService.getTables();
  }

  @Post('order')
  async placeOrder(@Body() body: any) {
    // Luồng: Khách quét QR gọi món -> Lưu DB -> Báo cho Kitchen Display
    const order = await this.coffeeService.placeOrder(body.tableId, body.items);
    
    // Gửi tín hiệu Realtime qua WebSocket để Barista nhận đơn ngay lập tức
    this.coffeeGateway.notifyNewOrder(order);

    return { success: true, orderId: order.id, message: 'Đã gửi order tới quầy pha chế' };
  }
}
