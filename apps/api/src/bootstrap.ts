import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/** Local foundation server, not readiness of DB/queue/providers. */
export async function createApi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.enableShutdownHooks();
  return app;
}
