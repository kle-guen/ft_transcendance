import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://localhost:4200', // Autoriser uniquement cette origine (votre frontend)
    credentials: true,
    optionsSuccessStatus: 204, // Réponse pour les requêtes OPTIONS (préférence)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Autoriser uniquement ces méthodes HTTP
    allowedHeaders: 'Authorization,Content-Type, Accept',
  });
  await app.listen(3000);
}
bootstrap();
