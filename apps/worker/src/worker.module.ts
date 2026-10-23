import { Module } from '@nestjs/common';
import { GetWorkspaceInfo } from '@agenda/backend/application';

@Module({
  providers: [{ provide: GetWorkspaceInfo, useFactory: () => new GetWorkspaceInfo() }],
})
export class WorkerModule {}
