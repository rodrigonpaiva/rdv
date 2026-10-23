import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { SERVER_RUNTIME } from '@agenda/config';
import type { ServerRuntime } from '@agenda/config';
import { GetWorkspaceInfo } from '@agenda/backend/application';

@Module({
  providers: [{ provide: GetWorkspaceInfo, useFactory: () => new GetWorkspaceInfo() }],
})
export class WorkerModule {
  static register(runtime: ServerRuntime): DynamicModule {
    return { module: WorkerModule, providers: [{ provide: SERVER_RUNTIME, useValue: runtime }], exports: [SERVER_RUNTIME] };
  }
}
