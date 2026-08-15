import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TENANT_CONNECTION } from '../../core/database/tenant-connection.provider';

import { Table } from './entities/table.entity';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { Topping } from './entities/topping.entity';
import { ToppingGroup } from './entities/topping-group.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from './entities/customer.entity';
import { Setting } from './entities/setting.entity';
import { VietqrConfig } from './entities/vietqr-config.entity';

import { CoffeeService } from './coffee.service';
import { CoffeeController } from './coffee.controller';
import { CoffeeGateway } from './coffee.gateway';

// Khởi tạo Repositories động trỏ thẳng tới Database của Tenant
const createTenantRepository = (entity: any, provideToken: string) => ({
  provide: provideToken,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
  inject: [TENANT_CONNECTION],
});

@Module({
  controllers: [CoffeeController],
  providers: [
    CoffeeService,
    CoffeeGateway,
    createTenantRepository(Table, 'TABLE_REPOSITORY'),
    createTenantRepository(Category, 'CATEGORY_REPOSITORY'),
    createTenantRepository(Product, 'PRODUCT_REPOSITORY'),
    createTenantRepository(Topping, 'TOPPING_REPOSITORY'),
    createTenantRepository(ToppingGroup, 'TOPPING_GROUP_REPOSITORY'),
    createTenantRepository(Order, 'ORDER_REPOSITORY'),
    createTenantRepository(OrderItem, 'ORDER_ITEM_REPOSITORY'),
    createTenantRepository(Customer, 'CUSTOMER_REPOSITORY'),
    createTenantRepository(Setting, 'SETTING_REPOSITORY'),
    createTenantRepository(VietqrConfig, 'VIETQR_CONFIG_REPOSITORY'),
  ],
})
export class CoffeeModule {}
