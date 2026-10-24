import { Controller, Get, Query, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { GetWorkspaceInfo } from '@agenda/backend/application';
import type { WorkspaceInfoDto } from '@agenda/contracts';
import { SchemaValidationPipe } from './http/validation.js';

@Controller('health')
export class HealthController {
  constructor(private readonly getWorkspaceInfo: GetWorkspaceInfo) {}

  // Existing liveness alias is explicitly neutral; future routes default to v1.
  @Version(['1', VERSION_NEUTRAL])
  @Get()
  get(@Query(new SchemaValidationPipe('EmptyQuery', 'query')) _query: unknown): WorkspaceInfoDto {
    return this.getWorkspaceInfo.execute();
  }
}
