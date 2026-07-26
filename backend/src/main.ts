import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Bật CORS để Frontend có thể gọi API
  await app.listen(process.env.PORT ?? 3001); // Chạy trên port 3001 thay vì 3000 (Next.js)
}
bootstrap();
