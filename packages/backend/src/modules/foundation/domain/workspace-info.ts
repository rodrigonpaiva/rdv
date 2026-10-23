export interface WorkspaceInfo {
  readonly name: string;
  readonly stage: 'foundation';
}

export function workspaceInfo(): WorkspaceInfo {
  return { name: 'agenda-br', stage: 'foundation' };
}
