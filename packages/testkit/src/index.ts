import type { WorkspaceInfoDto } from '@agenda/contracts';

export function expectedWorkspaceInfo(): WorkspaceInfoDto {
  return { name: 'agenda-br', stage: 'foundation' };
}

export { ManualClock } from './clock.js';
