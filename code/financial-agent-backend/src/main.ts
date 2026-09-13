import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  // app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:5173', 
    credentials: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      
      forbidNonWhitelisted: true, 
      
      transform: true, 
    }),
  );
  await app.listen(3000);
  console.log('Servidor BackEnd do Financial Assist rodando');
}
bootstrap();
