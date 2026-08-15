import { Module, Global } from '@nestjs/common';
import { TenantConnectionProvider } from './tenant-connection.provider';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    // Đây có thể là kết nối tới Master Database mặc định
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'bizsaas_master',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  providers: [TenantConnectionProvider],
  exports: [TenantConnectionProvider],
})
export class DatabaseModule {}
