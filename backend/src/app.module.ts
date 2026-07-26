import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { TenantMiddleware } from './core/tenant/tenant.middleware';
import { CoffeeModule } from './modules/coffee/coffee.module';

@Module({
  imports: [DatabaseModule, CoffeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Áp dụng TenantMiddleware cho tất cả các API route có logic liên quan đến tenant
    consumer.apply(TenantMiddleware).forRoutes('api/tenant/*');
  }
}
