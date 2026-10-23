import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { prepareServerRuntime } from '@agenda/config';
import type { EnvironmentInput, SecretResolver } from '@agenda/config';
import { AppModule } from './app.module.js';

/** Local foundation server, not readiness of DB/queue/providers. */
export async function createApi(environment: EnvironmentInput = process.env, resolver?: SecretResolver) {
  const runtime = await prepareServerRuntime(environment, resolver);
  const app = await NestFactory.create(AppModule.register(runtime), { logger: false });
  app.enableShutdownHooks();
  return app;
}
