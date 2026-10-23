import { Controller, Get } from '@nestjs/common';
import { GetWorkspaceInfo } from '@agenda/backend/application';
import type { WorkspaceInfoDto } from '@agenda/contracts';

@Controller('health')
export class HealthController {
  constructor(private readonly getWorkspaceInfo: GetWorkspaceInfo) {}

  @Get()
  get(): WorkspaceInfoDto {
    return this.getWorkspaceInfo.execute();
  }
}
