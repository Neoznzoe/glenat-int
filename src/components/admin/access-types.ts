import type { PermissionOverride } from '@/lib/mockDb';
import type { PermissionOverrideMode } from '@/lib/mockDb';

export type PermissionSelectValue = 'inherit' | PermissionOverrideMode;

export interface DraftAccessState {
  groups: string[];
  permissionOverrides: PermissionOverride[];
}
