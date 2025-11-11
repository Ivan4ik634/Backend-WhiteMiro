import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(
    '/payment/webhook',
    express.raw({ type: 'application/json' }),
  );

  await app.listen(process.env.PORT ?? 4200);
}
bootstrap();
