import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { Product } from './products/schemas/product.schema';
import { Recipe } from './recipes/schemas/recipe.schema';
import { Package } from './packages/schemas/package.schema';
import { Order } from './orders/schemas/order.schema';
import { User } from './users/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const ENABLED_CORS_ORIGIN = [
    'https://te-enat-shop.onrender.com',
    'http://localhost:5173',
    'https://www.tenat.co.il',
  ];
  app.enableCors({
    origin: ENABLED_CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Tenat API')
    .setDescription('The API documentation for the Tenat application.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [Product, Recipe, Package, Order, User],
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  Logger.verbose(`Server is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap().catch(console.error);
