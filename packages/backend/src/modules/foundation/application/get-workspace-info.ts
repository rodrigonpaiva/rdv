import type { WorkspaceInfoDto } from '@agenda/contracts';
import { workspaceInfo } from '../domain/workspace-info.js';

/** Shared diagnostic use case. No scheduling or financial behavior is implemented here. */
export class GetWorkspaceInfo {
  execute(): WorkspaceInfoDto {
    return workspaceInfo();
  }
}
