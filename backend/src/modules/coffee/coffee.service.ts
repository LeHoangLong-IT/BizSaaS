import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Topping } from './entities/topping.entity';

@Injectable()
export class CoffeeService {
  constructor(
    @Inject('TABLE_REPOSITORY') private tableRepo: Repository<Table>,
    @Inject('PRODUCT_REPOSITORY') private productRepo: Repository<Product>,
    @Inject('TOPPING_REPOSITORY') private toppingRepo: Repository<Topping>,
    @Inject('ORDER_REPOSITORY') private orderRepo: Repository<Order>,
    @Inject('ORDER_ITEM_REPOSITORY') private orderItemRepo: Repository<OrderItem>,
  ) {}

  async getMenu() {
    return this.productRepo.find({ relations: { category: true } });
  }

  async getToppings() {
    return this.toppingRepo.find();
  }

  async getTables() {
    return this.tableRepo.find();
  }

  // Khách bấm Order
  async placeOrder(tableId: number, items: { productId: number; quantity: number; note?: string; toppingIds?: number[] }[]) {
    const table = await this.tableRepo.findOneBy({ id: tableId });
    if (!table) throw new Error('Bàn không tồn tại');

    // Tạo Order
    const order = new Order();
    order.table = table;
    order.status = 'PENDING';
    order.total_price = 0; // Sẽ tính toán dựa trên product và toppings
    
    await this.orderRepo.save(order);

    // Lưu các OrderItems (Logic rút gọn, thực tế cần tính tiền)
    for (const item of items) {
      const orderItem = new OrderItem();
      orderItem.order = order;
      
      const product = await this.productRepo.findOneBy({ id: item.productId });
      if (!product) throw new Error(`Product ${item.productId} không tồn tại`);
      orderItem.product = product;
      
      orderItem.quantity = item.quantity;
      orderItem.note = item.note || '';
      
      if (item.toppingIds && item.toppingIds.length > 0) {
        const foundToppings = await Promise.all(
          item.toppingIds.map(id => this.toppingRepo.findOneBy({ id }))
        );
        orderItem.toppings = foundToppings.filter((t): t is Topping => t !== null);
      }
      
      await this.orderItemRepo.save(orderItem);
    }

    // Đổi trạng thái bàn
    table.status = 'OCCUPIED';
    await this.tableRepo.save(table);

    return order;
  }
}
