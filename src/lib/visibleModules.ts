import { Module, UserPermission, VisibleModule } from "@/types/sidebar";

export type VisibilityMode = {
  denyList?: boolean;
  isSuperAdmin?: boolean;
};

export function computeVisibleModules(
  modules: Module[],
  permissions: UserPermission[],
  options: VisibilityMode = {}
): VisibleModule[] {
  const { denyList = true, isSuperAdmin = false } = options;

  const activeModules = modules.filter((module) => module.isActive);

  if (activeModules.length === 0) {
    return [];
  }

  if (isSuperAdmin) {
    return sortModules(activeModules);
  }

  const permissionMap = new Map<number, UserPermission>();
  for (const permission of permissions) {
    permissionMap.set(permission.moduleId, permission);
  }

  const visible = activeModules.filter((module) => {
    const permission = permissionMap.get(module.id);

    if (denyList) {
      if (permission && permission.canView === false) {
        return false;
      }

      return true;
    }

    if (!permission) {
      return false;
    }

    return permission.canView === true;
  });

  return sortModules(visible);
}

function sortModules(modules: Module[]): VisibleModule[] {
  return [...modules].sort((a, b) => {
    const orderA = a.order ?? 9999;
    const orderB = b.order ?? 9999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.name.localeCompare(b.name, "fr-FR", { sensitivity: "base" });
  });
}
