import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';

  // In production the frontend and the API share one origin (nginx proxies /api),
  // so CORS and public Swagger are only needed for local development.
  if (!isProduction) {
    const documentBuilder = new DocumentBuilder()
      .setTitle('ApexRate API')
      .setDescription('Currency & Crypto Price Aggregator API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, documentBuilder);
    SwaggerModule.setup('api/docs', app, document);

    app.enableCors({ origin: true });
  }

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
