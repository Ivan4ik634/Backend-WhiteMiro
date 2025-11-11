import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Важное: подключаем raw body только для вебхука
  app.use(
    '/payment/webhook',
    express.raw({ type: 'application/json' }),
  );

  await app.listen(process.env.PORT ?? 4200);
}
bootstrap();
