import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { CoffeeService } from './coffee.service';
import { CoffeeGateway } from './coffee.gateway';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Cấu hình thư mục lưu ảnh (trỏ thẳng sang public của frontend)
const uploadDir = join(__dirname, '../../../../frontend/public/images/products');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Controller('api/tenant/coffee')
export class CoffeeController {
  constructor(
    private readonly coffeeService: CoffeeService,
    private readonly coffeeGateway: CoffeeGateway
  ) {}

  @Post('init')
  async initData() {
    return this.coffeeService.initData();
  }

  @Get('menu')
  async getMenu() {
    try {
      const categories = await this.coffeeService.getCategories();
      const products = await this.coffeeService.getMenu();
      const toppings = await this.coffeeService.getToppings();
      const toppingGroups = await this.coffeeService.getToppingGroups();
      return { categories, products, toppings, toppingGroups };
    } catch (error: any) {
      return { error: error.message, stack: error.stack };
    }
  }

  @Get('tables')
  async getTables() {
    return this.coffeeService.getTables();
  }

  @Get('settings')
  async getSettings() {
    return this.coffeeService.getSettings();
  }

  @Post('settings')
  async saveSettings(@Body() body: any) {
    return this.coffeeService.saveSettings(body);
  }

  @Get('vietqr')
  async getVietqrConfigs() {
    return this.coffeeService.getVietqrConfigs();
  }

  @Post('vietqr')
  async createVietqrConfig(@Body() body: any) {
    return this.coffeeService.createVietqrConfig(body);
  }

  @Put('vietqr/:id')
  async updateVietqrConfig(@Param('id') id: string, @Body() body: any) {
    return this.coffeeService.updateVietqrConfig(Number(id), body);
  }

  @Put('vietqr/:id/active')
  async setActiveVietqrConfig(@Param('id') id: string) {
    return this.coffeeService.setActiveVietqrConfig(Number(id));
  }

  @Delete('vietqr/:id')
  async deleteVietqrConfig(@Param('id') id: string) {
    return this.coffeeService.deleteVietqrConfig(Number(id));
  }

  @Post('login')
  async login(@Body() body: { phone: string; name?: string }) {
    if (!body.phone) {
      throw new Error('Số điện thoại là bắt buộc');
    }
    const result = await this.coffeeService.loginOrRegister(body.phone, body.name);
    if (result.isNew && !result.customer) {
      return { success: false, isNew: true, message: 'Vui lòng cung cấp tên để đăng ký' };
    }
    return { success: true, customer: result.customer, isNew: result.isNew };
  }

  @Post('order')
  async placeOrder(@Body() body: any) {
    const status = body.paymentMethod === 'BANK' ? 'UNPAID' : 'PENDING';
    const order = await this.coffeeService.placeOrder(
      body.tableId,
      body.items,
      body.orderType,
      body.customerId,
      body.customerName,
      body.promoCode,
      status
    );
    if (status !== 'UNPAID') {
      this.coffeeGateway.notifyNewOrder(order);
    }
    if (body.tableId) {
      this.coffeeGateway.notifyTableStatusChanged();
    }
    return { success: true, orderId: order.id, message: status === 'UNPAID' ? 'Đã tạo đơn, vui lòng thanh toán' : 'Đã gửi order tới quầy pha chế' };
  }

  @Post('webhook/payos')
  async handleWebhook(@Body() body: { amount: number; description: string }) {
    // Giả lập webhook: Tìm mã đơn hàng từ nội dung chuyển khoản
    // Format: "BIZSAAS 105" hoặc "DH 105"
    const match = body.description.match(/(?:BIZSAAS|DH)\s*(\d+)/i);
    if (match) {
      const orderId = parseInt(match[1]);
      const order = await this.coffeeService['orderRepo'].findOne({ where: { id: orderId }, relations: { items: { product: true, toppings: true }, table: true } });
      if (order && order.status === 'UNPAID' && Number(order.total_price) === Number(body.amount)) {
        order.status = 'PENDING'; // Chờ làm món
        await this.coffeeService['orderRepo'].save(order);
        this.coffeeGateway.notifyNewOrder(order);
        this.coffeeGateway.server.emit('menuUpdated');
        return { success: true, message: 'Đã xác nhận thanh toán và đẩy đơn xuống bếp' };
      }
    }
    return { success: false, message: 'Không tìm thấy đơn hợp lệ' };
  }

  // --- CRUD Products ---
  @Post('products')
  async createProduct(@Body() body: any) {
    const { categoryId, toppingIds, toppingGroupIds, ...productData } = body;
    productData.category = { id: categoryId };
    if (toppingIds) {
      productData.toppings = toppingIds.map((id: number) => ({ id }));
    }
    if (toppingGroupIds) {
      productData.toppingGroups = toppingGroupIds.map((id: number) => ({ id }));
    }
    const res = await this.coffeeService.createProduct(productData);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const { categoryId, toppingIds, toppingGroupIds, ...productData } = body;
    if (categoryId) {
      productData.category = { id: categoryId };
    }
    if (toppingIds !== undefined) {
      productData.toppings = toppingIds.map((tid: number) => ({ id: tid }));
    }
    if (toppingGroupIds !== undefined) {
      productData.toppingGroups = toppingGroupIds.map((tid: number) => ({ id: tid }));
    }
    const res = await this.coffeeService.updateProduct(Number(id), productData);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    const res = await this.coffeeService.deleteProduct(Number(id));
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  // --- CRUD Categories ---
  @Post('categories')
  async createCategory(@Body() body: any) {
    const res = await this.coffeeService.createCategory(body);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Put('categories/reorder')
  async reorderCategories(@Body() body: { items: { id: number; sortOrder: number }[] }) {
    const res = await this.coffeeService.reorderCategories(body.items);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const res = await this.coffeeService.updateCategory(Number(id), body);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    const res = await this.coffeeService.deleteCategory(Number(id));
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  // --- CRUD Toppings ---
  @Post('toppings/bulk')
  async createToppingsBulk(@Body() body: { items: any[] }) {
    if (!body.items || !Array.isArray(body.items)) {
      throw new Error('Dữ liệu không hợp lệ (yêu cầu một mảng items)');
    }
    const res = await this.coffeeService.createToppingsBulk(body.items);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Post('toppings')
  async createTopping(@Body() body: any) {
    const res = await this.coffeeService.createTopping(body);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Put('toppings/:id')
  async updateTopping(@Param('id') id: string, @Body() body: any) {
    const res = await this.coffeeService.updateTopping(Number(id), body);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Delete('toppings/:id')
  async deleteTopping(@Param('id') id: string) {
    const res = await this.coffeeService.deleteTopping(Number(id));
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  // --- CRUD Topping Groups ---
  @Post('topping-groups')
  async createToppingGroup(@Body() body: any) {
    const { toppingIds, ...groupData } = body;
    if (toppingIds) {
      groupData.toppings = toppingIds.map((id: number) => ({ id }));
    }
    const res = await this.coffeeService.createToppingGroup(groupData);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Put('topping-groups/:id')
  async updateToppingGroup(@Param('id') id: string, @Body() body: any) {
    const { toppingIds, ...groupData } = body;
    if (toppingIds !== undefined) {
      groupData.toppings = toppingIds.map((tid: number) => ({ id: tid }));
    }
    const res = await this.coffeeService.updateToppingGroup(Number(id), groupData);
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  @Delete('topping-groups/:id')
  async deleteToppingGroup(@Param('id') id: string) {
    const res = await this.coffeeService.deleteToppingGroup(Number(id));
    this.coffeeGateway.notifyMenuUpdated();
    return res;
  }

  // --- CRUD Tables ---
  @Post('tables')
  async createTable(@Body() body: any) {
    return this.coffeeService.createTable(body);
  }

  @Put('tables/:id')
  async updateTable(@Param('id') id: string, @Body() body: any) {
    return this.coffeeService.updateTable(Number(id), body);
  }

  @Delete('tables/:id')
  async deleteTable(@Param('id') id: string) {
    return this.coffeeService.deleteTable(Number(id));
  }

  // --- Orders Management ---
  @Get('orders')
  async getOrders() {
    return this.coffeeService.getOrders();
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.coffeeService.getOrderById(Number(id));
  }

  @Put('orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const res = await this.coffeeService.updateOrderStatus(Number(id), body.status);
    this.coffeeGateway.notifyOrderStatusChanged(Number(id), body.status);
    if (res.tableStatusChanged) {
      this.coffeeGateway.notifyTableStatusChanged();
    }
    return res.order;
  }

  // --- Upload Image ---
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Trả về đường dẫn tương đối để frontend hiển thị được (ví dụ: /images/products/123-456.png)
    return {
      success: true,
      url: `/images/products/${file.filename}`
    };
  }
}
