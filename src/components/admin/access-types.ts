import type { PermissionOverride } from '@/lib/adminAccess';
import type { PermissionOverrideMode } from '@/lib/adminAccess';

export type PermissionSelectValue = 'inherit' | PermissionOverrideMode;

export interface DraftAccessState {
  groups: string[];
  permissionOverrides: PermissionOverride[];
}
