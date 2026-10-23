import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { SERVER_RUNTIME } from '@agenda/config';
import type { ServerRuntime } from '@agenda/config';
import { GetWorkspaceInfo } from '@agenda/backend/application';
import { HealthController } from './health.controller.js';

@Module({
  controllers: [HealthController],
  providers: [{ provide: GetWorkspaceInfo, useFactory: () => new GetWorkspaceInfo() }],
})
export class AppModule {
  static register(runtime: ServerRuntime): DynamicModule {
    return { module: AppModule, providers: [{ provide: SERVER_RUNTIME, useValue: runtime }], exports: [SERVER_RUNTIME] };
  }
}
