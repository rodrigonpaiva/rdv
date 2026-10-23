import { Module } from '@nestjs/common';
import { GetWorkspaceInfo } from '@agenda/backend/application';
import { HealthController } from './health.controller.js';

@Module({
  controllers: [HealthController],
  providers: [{ provide: GetWorkspaceInfo, useFactory: () => new GetWorkspaceInfo() }],
})
export class AppModule {}
