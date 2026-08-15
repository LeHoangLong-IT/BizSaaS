import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Topping } from './entities/topping.entity';
import { ToppingGroup } from './entities/topping-group.entity';
import { Category } from './entities/category.entity';
import { Customer } from './entities/customer.entity';
import { Setting } from './entities/setting.entity';
import { VietqrConfig } from './entities/vietqr-config.entity';

@Injectable()
export class CoffeeService {
  constructor(
    @Inject('TABLE_REPOSITORY') private tableRepo: Repository<Table>,
    @Inject('PRODUCT_REPOSITORY') private productRepo: Repository<Product>,
    @Inject('TOPPING_REPOSITORY') private toppingRepo: Repository<Topping>,
    @Inject('TOPPING_GROUP_REPOSITORY') private toppingGroupRepo: Repository<ToppingGroup>,
    @Inject('CATEGORY_REPOSITORY') private categoryRepo: Repository<Category>,
    @Inject('ORDER_REPOSITORY') private orderRepo: Repository<Order>,
    @Inject('ORDER_ITEM_REPOSITORY') private orderItemRepo: Repository<OrderItem>,
    @Inject('CUSTOMER_REPOSITORY') private customerRepo: Repository<Customer>,
    @Inject('SETTING_REPOSITORY') private settingRepo: Repository<Setting>,
    @Inject('VIETQR_CONFIG_REPOSITORY') private vietqrConfigRepo: Repository<VietqrConfig>,
  ) {}

  async getMenu() {
    return this.productRepo.find({ 
      relations: { category: true, toppings: true, toppingGroups: { toppings: true } },
      order: { id: 'DESC' }
    });
  }

  async getCategories() {
    return this.categoryRepo.find({ order: { sortOrder: 'ASC', id: 'DESC' } });
  }

  async getToppings() {
    return this.toppingRepo.find({ order: { id: 'DESC' } });
  }

  async getToppingGroups() {
    return this.toppingGroupRepo.find({ relations: { toppings: true }, order: { id: 'DESC' } });
  }

  async getTables() {
    return this.tableRepo.find({ order: { id: 'DESC' } });
  }

  // --- Settings ---
  async getSettings() {
    const settings = await this.settingRepo.find();
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  async saveSettings(data: Record<string, string>) {
    for (const key of Object.keys(data)) {
      const value = data[key];
      let setting = await this.settingRepo.findOneBy({ key });
      if (!setting) {
        setting = this.settingRepo.create({ key, value });
      } else {
        setting.value = value;
      }
      await this.settingRepo.save(setting);
    }
    return this.getSettings();
  }

  // --- VietQR Configs ---
  async getVietqrConfigs() {
    return this.vietqrConfigRepo.find({ order: { id: 'DESC' } });
  }

  async createVietqrConfig(data: Partial<VietqrConfig>) {
    if (data.is_active) {
      await this.vietqrConfigRepo.update({ is_active: true }, { is_active: false });
    }
    const newConfig = this.vietqrConfigRepo.create(data);
    return this.vietqrConfigRepo.save(newConfig);
  }

  async updateVietqrConfig(id: number, data: Partial<VietqrConfig>) {
    if (data.is_active) {
      await this.vietqrConfigRepo.update({ is_active: true }, { is_active: false });
    }
    await this.vietqrConfigRepo.update(id, data);
    return this.vietqrConfigRepo.findOneBy({ id });
  }

  async setActiveVietqrConfig(id: number) {
    await this.vietqrConfigRepo.update({ is_active: true }, { is_active: false });
    await this.vietqrConfigRepo.update(id, { is_active: true });
    return { success: true };
  }

  async deleteVietqrConfig(id: number) {
    await this.vietqrConfigRepo.delete(id);
    return { success: true };
  }

  // Khách bấm Order
  async placeOrder(
    tableId: number, 
    items: { productId: number; quantity: number; note?: string; toppingIds?: number[]; finalPrice?: number }[],
    orderType: string = 'TAKEAWAY',
    customerId?: number,
    customerName?: string,
    promoCode?: string,
    status: string = 'PENDING'
  ) {
    let table = null;
    if (tableId && !isNaN(tableId)) {
      table = await this.tableRepo.findOneBy({ id: tableId });
      if (!table) table = null;
    }

    let customer = null;
    if (customerId) {
      customer = await this.customerRepo.findOneBy({ id: customerId });
    }

    // Tính tổng tiền
    let totalPrice = 0;
    for (const item of items) {
      totalPrice += (item.finalPrice || 0) * item.quantity;
    }

    if (promoCode === 'NEWBIE100' && customer) {
      totalPrice = Math.max(0, totalPrice - 20000); // Giảm cứng 20k
    } else if (promoCode === 'BIZSAAS10') {
      totalPrice = Math.max(0, totalPrice - (totalPrice * 0.1));
    }

    // Tạo Order
    const order = new Order();
    if (table) order.table = table;
    if (customer) {
      order.customer = customer;
      // Tích 10% điểm
      customer.points += Math.floor(totalPrice * 0.1);
      await this.customerRepo.save(customer);
    }
    order.customer_name = customerName || null;
    order.order_type = table ? 'DINE_IN' : orderType;
    order.status = status;
    order.total_price = totalPrice;
    
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

    // Đổi trạng thái bàn nếu có
    if (table) {
      table.status = 'OCCUPIED';
      await this.tableRepo.save(table);
    }

    const populatedOrder = await this.orderRepo.findOne({
      where: { id: order.id },
      relations: { items: { product: true, toppings: true }, table: true }
    });
    return populatedOrder || order;
  }

  // Cập nhật CRUD Products
  async createProduct(data: Partial<Product>) {
    const product = this.productRepo.create(data);
    return this.productRepo.save(product);
  }

  async updateProduct(id: number, data: Partial<Product>) {
    const product = await this.productRepo.findOne({ where: { id }, relations: { toppings: true, toppingGroups: true } });
    if (!product) throw new Error('Product not found');
    const updated = this.productRepo.merge(product, data);
    return this.productRepo.save(updated);
  }

  async deleteProduct(id: number) {
    return this.productRepo.delete(id);
  }

  // --- Customer & Login ---
  async loginOrRegister(phone: string, name?: string) {
    let customer = await this.customerRepo.findOneBy({ phone });
    if (!customer) {
      if (!name) return { customer: null, isNew: true };
      customer = this.customerRepo.create({ phone, name });
      customer = await this.customerRepo.save(customer);
      return { customer, isNew: true };
    }
    return { customer, isNew: false };
  }

  // --- CRUD Categories ---
  async createCategory(data: Partial<Category>) {
    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  async updateCategory(id: number, data: Partial<Category>) {
    await this.categoryRepo.update(id, data);
    return this.categoryRepo.findOneBy({ id });
  }

  async deleteCategory(id: number) {
    await this.categoryRepo.delete(id);
    return { success: true };
  }

  async reorderCategories(items: { id: number; sortOrder: number }[]) {
    // Bulk update using a transaction or a loop
    for (const item of items) {
      await this.categoryRepo.update(item.id, { sortOrder: item.sortOrder });
    }
    return { success: true };
  }

  // --- CRUD Toppings ---
  async createTopping(data: Partial<Topping>) {
    const topping = this.toppingRepo.create(data);
    return this.toppingRepo.save(topping);
  }

  async createToppingsBulk(items: Partial<Topping>[]) {
    const toppings = this.toppingRepo.create(items);
    return this.toppingRepo.save(toppings);
  }

  async updateTopping(id: number, data: Partial<Topping>) {
    await this.toppingRepo.update(id, data);
    return this.toppingRepo.findOneBy({ id });
  }

  async deleteTopping(id: number) {
    await this.toppingRepo.delete(id);
    return { success: true };
  }

  // --- CRUD Topping Groups ---
  async createToppingGroup(data: Partial<ToppingGroup>) {
    const group = this.toppingGroupRepo.create(data);
    return this.toppingGroupRepo.save(group);
  }

  async updateToppingGroup(id: number, data: Partial<ToppingGroup>) {
    const group = await this.toppingGroupRepo.findOne({ where: { id }, relations: { toppings: true } });
    if (!group) return null;
    const updated = this.toppingGroupRepo.merge(group, data);
    return this.toppingGroupRepo.save(updated);
  }

  async deleteToppingGroup(id: number) {
    await this.toppingGroupRepo.delete(id);
    return { success: true };
  }

  // --- CRUD Tables ---
  async createTable(data: Partial<Table>) {
    const table = this.tableRepo.create(data);
    return this.tableRepo.save(table);
  }

  async updateTable(id: number, data: Partial<Table>) {
    await this.tableRepo.update(id, data);
    return this.tableRepo.findOneBy({ id });
  }

  async deleteTable(id: number) {
    await this.tableRepo.delete(id);
    return { success: true };
  }

  // --- Orders ---
  async getOrders() {
    return this.orderRepo.find({
      relations: { table: true, items: { product: true, toppings: true } },
      order: { created_at: 'DESC' }
    });
  }
  async getOrderById(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { table: true, items: { product: true, toppings: true } }
    });
    if (!order) throw new Error('Order not found');
    return order;
  }

  async updateOrderStatus(id: number, status: string) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: { table: true } });
    if (!order) throw new Error('Order not found');
    
    await this.orderRepo.update(id, { status });
    let tableStatusChanged = false;

    if (order.table && (status === 'PAID' || status === 'COMPLETED' || status === 'CANCELLED')) {
      const activeOrders = await this.orderRepo.count({
        where: [
          { table: { id: order.table.id }, status: 'PENDING' },
          { table: { id: order.table.id }, status: 'PREPARING' },
          { table: { id: order.table.id }, status: 'SERVED' }
        ]
      });
      if (activeOrders === 0) {
        await this.tableRepo.update(order.table.id, { status: 'AVAILABLE' });
        tableStatusChanged = true;
      }
    }

    return { order: await this.orderRepo.findOne({ where: { id }, relations: { table: true, items: { product: true, toppings: true } } }), tableStatusChanged };
  }

  async initData() {
    // 1. Init Categories
    const categories = [
      { id: 1, name: 'Cà Phê', icon: 'coffee' },
      { id: 2, name: 'Trà & Trà Sữa', icon: 'tea' },
      { id: 3, name: 'Nước Ép', icon: 'juice' },
    ];
    for (const cat of categories) {
      await this.categoryRepo.save(cat);
    }

    // 2. Init Products
    const products = [
      { id: 1, name: 'Cà Phê Đen', price: 25000, image_url: '/images/products/ca-phe-den.png', category: { id: 1 } },
      { id: 2, name: 'Cà Phê Sữa', price: 29000, image_url: '/images/products/ca-phe-sua.png', category: { id: 1 } },
      { id: 3, name: 'Bạc Xỉu', price: 32000, image_url: '/images/products/bac-xiu.png', category: { id: 1 } },
      { id: 4, name: 'Trà Sữa Truyền Thống', price: 35000, image_url: '/images/products/tra-sua-truyen-thong.png', category: { id: 2 } },
      { id: 5, name: 'Trà Sữa Khoai Môn', price: 39000, image_url: '/images/products/tra-sua-khoai-mon.png', category: { id: 2 } },
      { id: 6, name: 'Trà Sữa Matcha', price: 39000, image_url: '/images/products/tra-sua-matcha.png', category: { id: 2 } },
      { id: 7, name: 'Matcha Latte', price: 45000, image_url: '/images/products/matcha-latte.png', category: { id: 2 } },
      { id: 8, name: 'Trà Tắc', price: 20000, image_url: '/images/products/tra-tat.png', category: { id: 2 } },
      { id: 9, name: 'Trà Đường', price: 15000, image_url: '/images/products/tra-duong.png', category: { id: 2 } },
      { id: 10, name: 'Cam Ép', price: 35000, image_url: '/images/products/cam-ep.png', category: { id: 3 } },
    ];
    for (const prod of products) {
      await this.productRepo.save(prod);
    }

    // 3. Init Toppings
    const toppings = [
      { id: 1, name: 'Trân châu trắng', price: 5000 },
      { id: 2, name: 'Kem Macchiato', price: 10000 },
      { id: 3, name: 'Pudding trứng', price: 8000 },
    ];
    for (const top of toppings) {
      await this.toppingRepo.save(top);
    }

    return { message: 'Đã khởi tạo dữ liệu mẫu thành công!' };
  }
}
