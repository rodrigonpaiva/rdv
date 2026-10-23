import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module.js';

export async function createWorker() {
  return NestFactory.createApplicationContext(WorkerModule, { logger: false });
}
