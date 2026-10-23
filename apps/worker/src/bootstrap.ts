import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { prepareServerRuntime } from '@agenda/config';
import type { EnvironmentInput, SecretResolver } from '@agenda/config';
import { WorkerModule } from './worker.module.js';

export async function createWorker(environment: EnvironmentInput = process.env, resolver?: SecretResolver) {
  const runtime = await prepareServerRuntime(environment, resolver);
  return NestFactory.createApplicationContext(WorkerModule.register(runtime), { logger: false });
}
