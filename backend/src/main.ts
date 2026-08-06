import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet, { crossOriginResourcePolicy } from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('app.apiPrefix')!;
  const corsOrigin = configService.get<string>('app.corsOrigin')!;
  const port = configService.get<number>('app.port')!;
  const isProduction = configService.get<string>('app.nodeEnv') === 'production';

  // Security & request-handling middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Locally-stored product image uploads (see modules/products). Not routed
  // through Nest controllers, so it's unaffected by the /api prefix below.
  // helmet()'s default same-origin CORP would otherwise block the frontend
  // (a different origin/port in dev, and typically a different origin/CDN
  // in production) from loading these images in <img> tags.
  const uploadsDir = join(process.cwd(), 'uploads');
  mkdirSync(uploadsDir, { recursive: true });
  app.use(
    '/uploads',
    crossOriginResourcePolicy({ policy: 'cross-origin' }),
    express.static(uploadsDir),
  );

  // /health is excluded from the API prefix so infra probes (Docker/K8s/load
  // balancers) can hit a stable, unversioned path.
  app.setGlobalPrefix(apiPrefix, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger is only exposed outside production to avoid publishing the API
  // surface on a public deployment.
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Mini Marketplace API')
      .setDescription('API documentation for the Mini Marketplace backend')
      .setVersion('0.0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  // Let Nest close providers (Prisma, Redis, BullMQ) cleanly on SIGTERM/SIGINT.
  app.enableShutdownHooks();

  await app.listen(port);

  Logger.log(`Application listening on port ${port} (prefix: /${apiPrefix})`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  Logger.error(
    'Failed to start application',
    error instanceof Error ? error.stack : error,
    'Bootstrap',
  );
  process.exit(1);
});
