import {
  BASE_PERMISSIONS,
  PERMISSION_DEFINITIONS,
  type GroupDefinition,
  type PermissionKey,
} from './access-control';

export type PermissionOverrideMode = 'allow' | 'deny';

export interface PermissionOverride {
  key: PermissionKey;
  mode: PermissionOverrideMode;
  note?: string;
}

export type PermissionEvaluationOrigin =
  | 'superadmin'
  | 'override-allow'
  | 'override-deny'
  | 'group'
  | 'base'
  | 'none';

export interface PermissionEvaluation {
  key: PermissionKey;
  effective: boolean;
  origin: PermissionEvaluationOrigin;
  inheritedFrom: string[];
  basePermission: boolean;
  overrideMode?: PermissionOverrideMode;
}

export interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  azureOid?: string | null;
  azureUpn?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  location?: string | null;
  phoneNumber?: string | null;
  status: 'active' | 'inactive';
  lastConnection?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  groups: string[];
  permissionOverrides: PermissionOverride[];
  isSuperAdmin?: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  actorId: string;
  actorName: string;
  message: string;
  timestamp: string;
  groupChanges?: {
    added: string[];
    removed: string[];
  };
  overrideChanges?: {
    added: PermissionOverride[];
    removed: PermissionOverride[];
    changed: Array<{
      key: PermissionKey;
      from: PermissionOverrideMode;
      to: PermissionOverrideMode;
    }>;
  };
}

export interface UpdateUserAccessPayload {
  userId: string;
  groups: string[];
  permissionOverrides: PermissionOverride[];
  actorId?: string;
}

export function evaluatePermission(
  user: UserAccount,
  groups: GroupDefinition[],
  key: PermissionKey,
): PermissionEvaluation {
  const inheritedFrom = groups
    .filter(
      (group) => user.groups.includes(group.id) && group.defaultPermissions.includes(key),
    )
    .map((group) => group.name);

  const basePermission = BASE_PERMISSIONS.includes(key);

  if (user.isSuperAdmin) {
    return {
      key,
      effective: true,
      origin: 'superadmin',
      inheritedFrom,
      basePermission,
    } satisfies PermissionEvaluation;
  }

  const override = user.permissionOverrides.find((candidate) => candidate.key === key);
  if (override) {
    const origin: PermissionEvaluationOrigin =
      override.mode === 'allow' ? 'override-allow' : 'override-deny';
    return {
      key,
      effective: override.mode === 'allow',
      origin,
      overrideMode: override.mode,
      inheritedFrom,
      basePermission,
    } satisfies PermissionEvaluation;
  }

  if (basePermission) {
    return {
      key,
      effective: true,
      origin: 'base',
      inheritedFrom,
      basePermission,
    } satisfies PermissionEvaluation;
  }

  if (inheritedFrom.length > 0) {
    return {
      key,
      effective: true,
      origin: 'group',
      inheritedFrom,
      basePermission,
    } satisfies PermissionEvaluation;
  }

  return {
    key,
    effective: false,
    origin: 'none',
    inheritedFrom,
    basePermission,
  } satisfies PermissionEvaluation;
}

export function computeEffectivePermissions(
  user: UserAccount,
  groups: GroupDefinition[],
): PermissionKey[] {
  if (user.isSuperAdmin) {
    return PERMISSION_DEFINITIONS.map((permission) => permission.key);
  }

  const effective: PermissionKey[] = [];
  for (const definition of PERMISSION_DEFINITIONS) {
    const evaluation = evaluatePermission(user, groups, definition.key);
    if (evaluation.effective) {
      effective.push(definition.key);
    }
  }

  return effective;
}
