export type Module = {
  id: number;
  name: string;
  path: string;
  icon?: string | null;
  order?: number | null;
  section?: string | null;
  isActive: boolean;
};

export type UserPermission = {
  userId: number;
  moduleId: number;
  canView: boolean;
};

export type CurrentUser = {
  id: number;
  displayName?: string;
  isSuperAdmin: boolean;
};

export type VisibleModule = Module;
