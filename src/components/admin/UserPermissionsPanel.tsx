import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserGroups, useUserRights, useUpdateViewRights, useGroupsFromApi, useUpdateUserGroups } from '@/hooks/useAdminData';
import { fetchAllModulesFromCms, fetchAllPagesFromCms, fetchAllBlocsFromCms, fetchAllElementsFromCms } from '@/lib/adminApi';
import { toast } from 'sonner';
import type { ViewRightUpdate, CmsModuleRecord, CmsPageRecord, CmsBlocRecord, CmsElementRecord, UserRightPermission, UserAccount, ApiGroupRecord } from '@/lib/adminApi';

interface PermissionState {
  modules: Map<number, { canView: boolean; inherited: boolean }>;
  pages: Map<number, { canView: boolean; inherited: boolean }>;
  blocs: Map<number, { canView: boolean; inherited: boolean }>;
  elements: Map<number, { canView: boolean; inherited: boolean }>;
}

interface HierarchyNode {
  id: number;
  name: string;
  code: string;
  type: 'module' | 'page' | 'bloc' | 'element';
  parentId?: number;
  canView: boolean;
  inherited: boolean;
  children?: HierarchyNode[];
}

interface UserPermissionsPanelProps {
  user: UserAccount | null;
}

export function UserPermissionsPanel({ user }: UserPermissionsPanelProps) {
  const userId = user?.username; // Use username (email) instead of numeric ID
  const userRecordId = user?.id; // Numeric ID for groups endpoint

  const [permissions, setPermissions] = useState<PermissionState>({
    modules: new Map(),
    pages: new Map(),
    blocs: new Map(),
    elements: new Map(),
  });
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [allModules, setAllModules] = useState<CmsModuleRecord[]>([]);
  const [allPages, setAllPages] = useState<CmsPageRecord[]>([]);
  const [allBlocs, setAllBlocs] = useState<CmsBlocRecord[]>([]);
  const [allElements, setAllElements] = useState<CmsElementRecord[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedBlocs, setExpandedBlocs] = useState<Set<number>>(new Set());

  // State for group management
  const [userGroupIds, setUserGroupIds] = useState<Set<number>>(new Set());

  const updateViewRightsMutation = useUpdateViewRights();
  const updateUserGroupsMutation = useUpdateUserGroups();

  // Fetch all available groups
  const { data: allGroups = [], isLoading: loadingAllGroups } = useGroupsFromApi();

  // Fetch user groups (uses numeric userRecordId)
  const { data: userGroups = [], isLoading: loadingUserGroups } = useUserGroups(userRecordId);

  // Fetch user rights (uses username/email userId)
  const { data: userRights, isLoading: loadingRights, refetch: refetchRights } = useUserRights(userId);

  // Update userGroupIds when userGroups change
  useEffect(() => {
    const groupIds = new Set(userGroups.map((g: ApiGroupRecord) => g.UserGroupId));
    setUserGroupIds(groupIds);
  }, [userGroups]);

  // Load all CMS data
  useEffect(() => {
    if (!userId) return; // Need userId to fetch rights

    const loadAllData = async () => {
      setIsLoadingAll(true);
      try {
        const [modules, pages, blocs, elements] = await Promise.all([ fetchAllModulesFromCms(), fetchAllPagesFromCms(), fetchAllBlocsFromCms(), fetchAllElementsFromCms() ]);
        setAllModules(modules);
        setAllPages(pages);
        setAllBlocs(blocs);
        setAllElements(elements);
      } catch {
        toast.error('Erreur lors du chargement des données CMS');
      } finally {
        setIsLoadingAll(false);
      }
    };

    loadAllData();
  }, [userId]);

  // Update permissions when user rights change
  useEffect(() => {
    if (!userRights) {
      // If no rights defined, show all with inherited=false
      const newPermissions: PermissionState = {
        modules: new Map(),
        pages: new Map(),
        blocs: new Map(),
        elements: new Map(),
      };

      allModules.forEach((module) => {
        newPermissions.modules.set(module.moduleId, { canView: false, inherited: false });
      });
      allPages.forEach((page) => {
        newPermissions.pages.set(page.pageId, { canView: false, inherited: false });
      });
      allBlocs.forEach((bloc) => {
        newPermissions.blocs.set(bloc.blocId, { canView: false, inherited: false });
      });
      allElements.forEach((element) => {
        newPermissions.elements.set(element.elementId, { canView: false, inherited: false });
      });

      setPermissions(newPermissions);
      return;
    }

    // Build permission state from user rights
    const newPermissions: PermissionState = {
      modules: new Map(),
      pages: new Map(),
      blocs: new Map(),
      elements: new Map(),
    };

    // Process MODULE rights
    (userRights.MODULE || []).forEach((perm: UserRightPermission) => {
      newPermissions.modules.set(perm.target, {
        canView: perm.canView,
        inherited: perm.inherited,
      });
    });

    // Process PAGE rights
    (userRights.PAGE || []).forEach((perm: UserRightPermission) => {
      newPermissions.pages.set(perm.target, {
        canView: perm.canView,
        inherited: perm.inherited,
      });
    });

    // Process BLOC rights
    (userRights.BLOC || []).forEach((perm: UserRightPermission) => {
      newPermissions.blocs.set(perm.target, {
        canView: perm.canView,
        inherited: perm.inherited,
      });
    });

    // Process ELEMENT rights
    (userRights.ELEMENT || []).forEach((perm: UserRightPermission) => {
      newPermissions.elements.set(perm.target, {
        canView: perm.canView,
        inherited: perm.inherited,
      });
    });

    // Fill in missing items with inherited=false
    allModules.forEach((module) => {
      if (!newPermissions.modules.has(module.moduleId)) {
        newPermissions.modules.set(module.moduleId, { canView: false, inherited: false });
      }
    });
    allPages.forEach((page) => {
      if (!newPermissions.pages.has(page.pageId)) {
        newPermissions.pages.set(page.pageId, { canView: false, inherited: false });
      }
    });
    allBlocs.forEach((bloc) => {
      if (!newPermissions.blocs.has(bloc.blocId)) {
        newPermissions.blocs.set(bloc.blocId, { canView: false, inherited: false });
      }
    });
    allElements.forEach((element) => {
      if (!newPermissions.elements.has(element.elementId)) {
        newPermissions.elements.set(element.elementId, { canView: false, inherited: false });
      }
    });

    setPermissions(newPermissions);
  }, [userRights, allModules, allPages, allBlocs, allElements]);

  // Build hierarchy tree
  const hierarchyTree = useMemo(() => {
    const tree: HierarchyNode[] = [];

    allModules.forEach((module: CmsModuleRecord) => {
      const modulePerm = permissions.modules.get(module.moduleId) || {
        canView: false,
        inherited: false,
      };
      const moduleNode: HierarchyNode = {
        id: module.moduleId,
        name: module.moduleName || module.moduleCode || `Module ${module.moduleId}`,
        code: module.moduleCode,
        type: 'module',
        canView: modulePerm.canView,
        inherited: modulePerm.inherited,
        children: [],
      };

      // Only pages belonging to THIS module
      const modulePagesData = allPages.filter((p: CmsPageRecord) => p.moduleId === module.moduleId);
      modulePagesData.forEach((page: CmsPageRecord) => {
        const pagePerm = permissions.pages.get(page.pageId) || { canView: false, inherited: false };
        const pageNode: HierarchyNode = {
          id: page.pageId,
          name: page.pageName || page.pageCode || `Page ${page.pageId}`,
          code: page.pageCode,
          type: 'page',
          parentId: module.moduleId,
          canView: pagePerm.canView,
          inherited: pagePerm.inherited,
          children: [],
        };

        // Only blocs belonging to THIS page
        const pageBlocs = allBlocs.filter((b: CmsBlocRecord) => b.pageId === page.pageId);
        pageBlocs.forEach((bloc: CmsBlocRecord) => {
          const blocPerm = permissions.blocs.get(bloc.blocId) || {
            canView: false,
            inherited: false,
          };
          const blocNode: HierarchyNode = {
            id: bloc.blocId,
            name: bloc.blocName || bloc.blocCode || `Bloc ${bloc.blocId}`,
            code: bloc.blocCode,
            type: 'bloc',
            parentId: page.pageId,
            canView: blocPerm.canView,
            inherited: blocPerm.inherited,
            children: [],
          };

          // Only elements belonging to THIS bloc
          const blocElements = allElements.filter((e: CmsElementRecord) => e.blocId === bloc.blocId);
          blocElements.forEach((element: CmsElementRecord) => {
            const elementPerm = permissions.elements.get(element.elementId) || {
              canView: false,
              inherited: false,
            };
            const elementNode: HierarchyNode = {
              id: element.elementId,
              name: element.elementName || element.elementCode || `Élément ${element.elementId}`,
              code: element.elementCode,
              type: 'element',
              parentId: bloc.blocId,
              canView: elementPerm.canView,
              inherited: elementPerm.inherited,
            };
            blocNode.children!.push(elementNode);
          });

          pageNode.children!.push(blocNode);
        });

        moduleNode.children!.push(pageNode);
      });

      tree.push(moduleNode);
    });

    return tree;
  }, [allModules, allPages, allBlocs, allElements, permissions]);

  const handlePermissionChange = (
    type: 'modules' | 'pages' | 'blocs' | 'elements',
    id: number,
    canView: boolean,
    node?: HierarchyNode
  ) => {
    setPermissions((prev) => {
      const next = { ...prev };
      next[type] = new Map(prev[type]);
      next[type].set(id, { canView, inherited: false }); // Mark as explicit user override

      // Cascade to children
      if (!canView && node && node.children) {
        const denyChildren = (children: HierarchyNode[]) => {
          children.forEach((child) => {
            if (child.type === 'page') {
              next.pages.set(child.id, { canView: false, inherited: false });
            } else if (child.type === 'bloc') {
              next.blocs.set(child.id, { canView: false, inherited: false });
            } else if (child.type === 'element') {
              next.elements.set(child.id, { canView: false, inherited: false });
            }
            if (child.children) {
              denyChildren(child.children);
            }
          });
        };
        denyChildren(node.children);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!userId) return;

    const rights: ViewRightUpdate[] = [];

    // Collect all explicit permissions (not inherited)
    permissions.modules.forEach((perm, id) => {
      if (!perm.inherited) {
        rights.push({
          ViewRightTypeCode: 'MODULE',
          TargetObjectId: id,
          CanView: perm.canView,
        });
      }
    });

    permissions.pages.forEach((perm, id) => {
      if (!perm.inherited) {
        rights.push({
          ViewRightTypeCode: 'PAGE',
          TargetObjectId: id,
          CanView: perm.canView,
        });
      }
    });

    permissions.blocs.forEach((perm, id) => {
      if (!perm.inherited) {
        rights.push({
          ViewRightTypeCode: 'BLOC',
          TargetObjectId: id,
          CanView: perm.canView,
        });
      }
    });

    permissions.elements.forEach((perm, id) => {
      if (!perm.inherited) {
        rights.push({
          ViewRightTypeCode: 'ELEMENT',
          TargetObjectId: id,
          CanView: perm.canView,
        });
      }
    });

    try {
      await updateViewRightsMutation.mutateAsync({ userId, rights });
      toast.success('Permissions enregistrées', {
        description: 'Les permissions CMS ont été mises à jour avec succès.',
      });
      refetchRights();
    } catch {
      toast.error('Erreur lors de l\'enregistrement des permissions');
    }
  };

  const toggleExpanded = (type: 'module' | 'page' | 'bloc', id: number) => {
    if (type === 'module') {
      setExpandedModules((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else if (type === 'page') {
      setExpandedPages((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else if (type === 'bloc') {
      setExpandedBlocs((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
  };

  const handleGroupToggle = (groupId: number, checked: boolean) => {
    setUserGroupIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(groupId);
      } else {
        next.delete(groupId);
      }
      return next;
    });
  };

  const handleSaveGroups = async () => {
    if (!userId) {
      toast.error('Erreur', {
        description: 'Aucun utilisateur sélectionné.',
      });
      return;
    }

    try {
      await updateUserGroupsMutation.mutateAsync({
        userId,
        groupIds: Array.from(userGroupIds),
      });
      toast.success('Groupes enregistrés', {
        description: 'Les groupes de l\'utilisateur ont été mis à jour avec succès.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error('Erreur lors de l\'enregistrement des groupes', {
        description: errorMessage,
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Sélectionnez un utilisateur pour gérer ses permissions.</p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = loadingUserGroups || loadingRights || isLoadingAll;

  return (
    <div className="space-y-6">
      {/* Groupes métiers */}
      <Card>
        <CardHeader>
          <CardTitle>Groupes métiers</CardTitle>
          <CardDescription>Les groupes permettent de partager rapidement des droits.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAllGroups || loadingUserGroups ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement des groupes...</span>
            </div>
          ) : allGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun groupe disponible.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allGroups.map((group: ApiGroupRecord) => {
                  const isChecked = userGroupIds.has(group.UserGroupId);
                  return (
                    <div key={group.UserGroupId} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group.UserGroupId}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleGroupToggle(group.UserGroupId, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`group-${group.UserGroupId}`}
                        className="cursor-pointer flex-1 text-sm font-normal"
                      >
                        {group.GroupName}
                        {group.Description && (
                          <span className="block text-xs text-muted-foreground">
                            {group.Description}
                          </span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveGroups} size="sm" variant="outline">
                  Enregistrer les groupes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Droits CMS */}
      <Card>
        <CardHeader>
          <CardTitle>Droits CMS (Module → Page → Bloc → Élément)</CardTitle>
          <CardDescription>
            Gérez les droits fins sur les modules, pages, blocs et éléments du CMS. Les permissions refusées à un niveau supérieur bloquent tous les niveaux inférieurs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement des permissions...</span>
            </div>
          ) : hierarchyTree.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun module CMS disponible.</p>
          ) : (
            <div className="space-y-2">
              {hierarchyTree.map((moduleNode) => (
                <ModuleRow
                  key={moduleNode.id}
                  node={moduleNode}
                  expanded={expandedModules.has(moduleNode.id)}
                  onToggle={() => toggleExpanded('module', moduleNode.id)}
                  onPermissionChange={handlePermissionChange}
                  expandedPages={expandedPages}
                  expandedBlocs={expandedBlocs}
                  onTogglePage={(id) => toggleExpanded('page', id)}
                  onToggleBloc={(id) => toggleExpanded('bloc', id)}
                />
              ))}

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => refetchRights()}>
                  Réinitialiser
                </Button>
                <Button onClick={handleSave} disabled={updateViewRightsMutation.isPending}>
                  {updateViewRightsMutation.isPending ? 'Enregistrement...' : 'Enregistrer les permissions CMS'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ModuleRowProps {
  node: HierarchyNode;
  expanded: boolean;
  onToggle: () => void;
  onPermissionChange: (
    type: 'modules' | 'pages' | 'blocs' | 'elements',
    id: number,
    canView: boolean,
    node?: HierarchyNode
  ) => void;
  expandedPages: Set<number>;
  expandedBlocs: Set<number>;
  onTogglePage: (id: number) => void;
  onToggleBloc: (id: number) => void;
}

function ModuleRow({
  node,
  expanded,
  onToggle,
  onPermissionChange,
  expandedPages,
  expandedBlocs,
  onTogglePage,
  onToggleBloc,
}: ModuleRowProps) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="border rounded-md p-3">
      <div className="flex items-center gap-2">
        {hasChildren && (
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
        <div className="flex items-center gap-2 flex-1">
          <Checkbox
            id={`module-${node.id}`}
            checked={node.canView}
            onCheckedChange={(checked) =>
              onPermissionChange('modules', node.id, checked as boolean, node)
            }
          />
          <Label htmlFor={`module-${node.id}`} className="cursor-pointer font-semibold">
            {node.name}
          </Label>
          {node.inherited && <Badge variant="outline" className="text-xs">Hérité</Badge>}
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="ml-6 mt-2 space-y-2">
          {node.children!.map((pageNode) => (
            <PageRow
              key={pageNode.id}
              node={pageNode}
              expanded={expandedPages.has(pageNode.id)}
              onToggle={() => onTogglePage(pageNode.id)}
              onPermissionChange={onPermissionChange}
              expandedBlocs={expandedBlocs}
              onToggleBloc={onToggleBloc}
              parentDenied={!node.canView}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PageRowProps {
  node: HierarchyNode;
  expanded: boolean;
  onToggle: () => void;
  onPermissionChange: (
    type: 'modules' | 'pages' | 'blocs' | 'elements',
    id: number,
    canView: boolean,
    node?: HierarchyNode
  ) => void;
  expandedBlocs: Set<number>;
  onToggleBloc: (id: number) => void;
  parentDenied: boolean;
}

function PageRow({
  node,
  expanded,
  onToggle,
  onPermissionChange,
  expandedBlocs,
  onToggleBloc,
  parentDenied,
}: PageRowProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isDisabled = parentDenied;

  return (
    <div className="border rounded-md p-2 bg-muted/30">
      <div className="flex items-center gap-2">
        {hasChildren && (
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground" disabled={isDisabled}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
        <div className="flex items-center gap-2 flex-1">
          <Checkbox
            id={`page-${node.id}`}
            checked={node.canView}
            disabled={isDisabled}
            onCheckedChange={(checked) =>
              onPermissionChange('pages', node.id, checked as boolean, node)
            }
          />
          <Label
            htmlFor={`page-${node.id}`}
            className={`cursor-pointer ${isDisabled ? 'text-muted-foreground' : ''}`}
          >
            {node.name}
          </Label>
          {node.inherited && <Badge variant="outline" className="text-xs">Hérité</Badge>}
          {isDisabled && <Badge variant="destructive" className="text-xs">Bloqué par parent</Badge>}
        </div>
      </div>

      {expanded && hasChildren && !isDisabled && (
        <div className="ml-6 mt-2 space-y-2">
          {node.children!.map((blocNode) => (
            <BlocRow
              key={blocNode.id}
              node={blocNode}
              expanded={expandedBlocs.has(blocNode.id)}
              onToggle={() => onToggleBloc(blocNode.id)}
              onPermissionChange={onPermissionChange}
              parentDenied={isDisabled || !node.canView}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BlocRowProps {
  node: HierarchyNode;
  expanded: boolean;
  onToggle: () => void;
  onPermissionChange: (
    type: 'modules' | 'pages' | 'blocs' | 'elements',
    id: number,
    canView: boolean,
    node?: HierarchyNode
  ) => void;
  parentDenied: boolean;
}

function BlocRow({
  node,
  expanded,
  onToggle,
  onPermissionChange,
  parentDenied,
}: BlocRowProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isDisabled = parentDenied;

  return (
    <div className="border rounded-md p-2 bg-muted/50">
      <div className="flex items-center gap-2">
        {hasChildren && (
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground" disabled={isDisabled}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
        <div className="flex items-center gap-2 flex-1">
          <Checkbox
            id={`bloc-${node.id}`}
            checked={node.canView}
            disabled={isDisabled}
            onCheckedChange={(checked) =>
              onPermissionChange('blocs', node.id, checked as boolean, node)
            }
          />
          <Label
            htmlFor={`bloc-${node.id}`}
            className={`cursor-pointer text-sm ${isDisabled ? 'text-muted-foreground' : ''}`}
          >
            {node.name}
          </Label>
          {node.inherited && <Badge variant="outline" className="text-xs">Hérité</Badge>}
          {isDisabled && <Badge variant="destructive" className="text-xs">Bloqué par parent</Badge>}
        </div>
      </div>

      {expanded && hasChildren && !isDisabled && (
        <div className="ml-6 mt-2 space-y-1">
          {node.children!.map((elementNode) => (
            <ElementRow
              key={elementNode.id}
              node={elementNode}
              onPermissionChange={onPermissionChange}
              parentDenied={isDisabled || !node.canView}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ElementRowProps {
  node: HierarchyNode;
  onPermissionChange: (
    type: 'modules' | 'pages' | 'blocs' | 'elements',
    id: number,
    canView: boolean,
    node?: HierarchyNode
  ) => void;
  parentDenied: boolean;
}

function ElementRow({ node, onPermissionChange, parentDenied }: ElementRowProps) {
  const isDisabled = parentDenied;

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/70 rounded">
      <Checkbox
        id={`element-${node.id}`}
        checked={node.canView}
        disabled={isDisabled}
        onCheckedChange={(checked) =>
          onPermissionChange('elements', node.id, checked as boolean)
        }
      />
      <Label
        htmlFor={`element-${node.id}`}
        className={`cursor-pointer text-sm ${isDisabled ? 'text-muted-foreground' : ''}`}
      >
        {node.name}
      </Label>
      {node.inherited && <Badge variant="outline" className="text-xs">Hérité</Badge>}
      {isDisabled && <Badge variant="destructive" className="text-xs">Bloqué par parent</Badge>}
    </div>
  );
}
