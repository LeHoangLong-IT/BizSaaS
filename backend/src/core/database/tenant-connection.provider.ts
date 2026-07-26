import { DataSource, DataSourceOptions } from 'typeorm';
import { Scope, Provider } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantRequest } from '../tenant/tenant.middleware';

// Lưu trữ các kết nối đã mở để tái sử dụng (Connection Pooling)
const tenantConnectionMap = new Map<string, DataSource>();

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

export const TenantConnectionProvider: Provider = {
  provide: TENANT_CONNECTION,
  scope: Scope.REQUEST, // Rất quan trọng: Scope REQUEST để lấy được req object
  inject: [REQUEST],
  useFactory: async (req: TenantRequest): Promise<DataSource> => {
    const tenantId = req.tenantId;

    if (!tenantId) {
      throw new Error('Tenant ID is missing in request context.');
    }

    // Nếu kết nối đã tồn tại, tái sử dụng
    if (tenantConnectionMap.has(tenantId)) {
      const dataSource = tenantConnectionMap.get(tenantId);
      if (dataSource && dataSource.isInitialized) {
        return dataSource;
      }
    }

    // Cấu hình kết nối cho Tenant DB (giả định tên DB là tenant_xxx_db)
    // Trong thực tế, có thể query Master DB ở đây để lấy credentials của tenant này
    const dbName = `tenant_${tenantId}_db`;

    const config: DataSourceOptions = {
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
      synchronize: true, // Chỉ dùng cho dev, production nên dùng migration
    };

    const dataSource = new DataSource(config);
    await dataSource.initialize();
    
    tenantConnectionMap.set(tenantId, dataSource);
    
    console.log(`[Database] Mở kết nối thành công tới Tenant DB: ${dbName}`);
    return dataSource;
  },
};
