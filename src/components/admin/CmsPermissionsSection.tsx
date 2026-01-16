import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  useCmsModules,
  useCmsPages,
  useCmsBlocs,
  useCmsElements,
  useUserGroups,
  useUpdateViewRights,
} from '@/hooks/useAdminData';
import { fetchUserViewMatrix } from '@/lib/adminApi';
import { toast } from 'sonner';
import type { ViewRightUpdate, CmsModuleRecord, CmsPageRecord, CmsBlocRecord, CmsElementRecord } from '@/lib/adminApi';

interface PermissionState {
  modules: Map<number, boolean>;
  pages: Map<number, boolean>;
  blocs: Map<number, boolean>;
  elements: Map<number, boolean>;
}

interface HierarchyNode {
  id: number;
  name: string;
  code: string;
  type: 'module' | 'page' | 'bloc' | 'element';
  parentId?: number;
  canView: boolean;
  children?: HierarchyNode[];
}

interface CmsPermissionsSectionProps {
  userId: string | null;
}

export function CmsPermissionsSection({ userId }: CmsPermissionsSectionProps) {
  const [permissions, setPermissions] = useState<PermissionState>({
    modules: new Map(),
    pages: new Map(),
    blocs: new Map(),
    elements: new Map(),
  });
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedBlocs, setExpandedBlocs] = useState<Set<number>>(new Set());

  const updateViewRightsMutation = useUpdateViewRights();

  // Fetch all items (without user filter to see everything)
  const { data: allModules = [] } = useCmsModules(undefined);
  const { data: allPages = [] } = useCmsPages(undefined);
  const { data: allBlocs = [] } = useCmsBlocs(undefined);
  const { data: allElements = [] } = useCmsElements(undefined);

  // Fetch user groups
  const { data: userGroups = [], isLoading: loadingGroups } = useUserGroups(userId || undefined);

  // Build hierarchy tree
  const hierarchyTree = useMemo(() => {
    const tree: HierarchyNode[] = [];

    allModules.forEach((module: CmsModuleRecord) => {
      const moduleNode: HierarchyNode = {
        id: module.moduleId,
        name: module.moduleName,
        code: module.moduleCode,
        type: 'module',
        canView: permissions.modules.get(module.moduleId) || false,
        children: [],
      };

      const modulePagesData = allPages.filter((p: CmsPageRecord) => p.moduleId === module.moduleId);
      modulePagesData.forEach((page: CmsPageRecord) => {
        const pageNode: HierarchyNode = {
          id: page.pageId,
          name: page.pageName,
          code: page.pageCode,
          type: 'page',
          parentId: module.moduleId,
          canView: permissions.pages.get(page.pageId) || false,
          children: [],
        };

        const pageBlocs = allBlocs.filter((b: CmsBlocRecord) => b.pageId === page.pageId);
        pageBlocs.forEach((bloc: CmsBlocRecord) => {
          const blocNode: HierarchyNode = {
            id: bloc.blocId,
            name: bloc.blocName,
            code: bloc.blocCode,
            type: 'bloc',
            parentId: page.pageId,
            canView: permissions.blocs.get(bloc.blocId) || false,
            children: [],
          };

          const blocElements = allElements.filter((e: CmsElementRecord) => e.blocId === bloc.blocId);
          blocElements.forEach((element: CmsElementRecord) => {
            const elementNode: HierarchyNode = {
              id: element.elementId,
              name: element.elementName,
              code: element.elementCode,
              type: 'element',
              parentId: bloc.blocId,
              canView: permissions.elements.get(element.elementId) || false,
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

  // Load user permissions when userId changes
  useEffect(() => {
    if (!userId) {
      setPermissions({
        modules: new Map(),
        pages: new Map(),
        blocs: new Map(),
        elements: new Map(),
      });
      return;
    }

    const loadPermissions = async () => {
      setIsLoadingPermissions(true);
      try {
        const viewMatrix = await fetchUserViewMatrix(userId);

        const newPermissions: PermissionState = {
          modules: new Map(),
          pages: new Map(),
          blocs: new Map(),
          elements: new Map(),
        };

        (viewMatrix.MODULE || []).forEach((perm) => {
          newPermissions.modules.set(perm.target, perm.canView);
        });

        (viewMatrix.PAGE || []).forEach((perm) => {
          newPermissions.pages.set(perm.target, perm.canView);
        });

        (viewMatrix.BLOC || []).forEach((perm) => {
          newPermissions.blocs.set(perm.target, perm.canView);
        });

        (viewMatrix.ELEMENT || []).forEach((perm) => {
          newPermissions.elements.set(perm.target, perm.canView);
        });

        setPermissions(newPermissions);
      } catch (error) {
        console.error('Error loading CMS permissions:', error);
        setPermissions({
          modules: new Map(),
          pages: new Map(),
          blocs: new Map(),
          elements: new Map(),
        });
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [userId]);

  const handlePermissionChange = (
    type: 'modules' | 'pages' | 'blocs' | 'elements',
    id: number,
    canView: boolean,
    node?: HierarchyNode
  ) => {
    setPermissions((prev) => {
      const next = { ...prev };
      next[type] = new Map(prev[type]);
      next[type].set(id, canView);

      // Implement cascade: if denying (canView=false), deny all children
      if (!canView && node && node.children) {
        const denyChildren = (children: HierarchyNode[]) => {
          children.forEach((child) => {
            if (child.type === 'page') {
              next.pages.set(child.id, false);
            } else if (child.type === 'bloc') {
              next.blocs.set(child.id, false);
            } else if (child.type === 'element') {
              next.elements.set(child.id, false);
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
    if (!userId) {
      toast.error('Erreur', {
        description: 'Aucun utilisateur sélectionné.',
      });
      return;
    }

    try {
      const rights: ViewRightUpdate[] = [];

      allModules.forEach((module: CmsModuleRecord) => {
        rights.push({
          ViewRightTypeCode: 'MODULE',
          TargetObjectId: module.moduleId,
          CanView: permissions.modules.get(module.moduleId) || false,
        });
      });

      allPages.forEach((page: CmsPageRecord) => {
        rights.push({
          ViewRightTypeCode: 'PAGE',
          TargetObjectId: page.pageId,
          CanView: permissions.pages.get(page.pageId) || false,
        });
      });

      allBlocs.forEach((bloc: CmsBlocRecord) => {
        rights.push({
          ViewRightTypeCode: 'BLOC',
          TargetObjectId: bloc.blocId,
          CanView: permissions.blocs.get(bloc.blocId) || false,
        });
      });

      allElements.forEach((element: CmsElementRecord) => {
        rights.push({
          ViewRightTypeCode: 'ELEMENT',
          TargetObjectId: element.elementId,
          CanView: permissions.elements.get(element.elementId) || false,
        });
      });

      await updateViewRightsMutation.mutateAsync({
        userId,
        rights,
      });

      toast.success('Permissions CMS sauvegardées', {
        description: 'Les permissions CMS ont été mises à jour avec succès.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error('Erreur', {
        description: `Impossible de sauvegarder les permissions: ${message}`,
      });
    }
  };

  const toggleExpand = (type: 'module' | 'page' | 'bloc', id: number) => {
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

  const renderElement = (element: HierarchyNode, isAncestorDenied: boolean) => {
    const isDenied = isAncestorDenied || !element.canView;
    return (
      <div
        key={`element-${element.id}`}
        className="flex items-center space-x-2 p-2 pl-20 rounded border bg-background/50"
      >
        <Checkbox
          id={`element-${element.id}`}
          checked={element.canView}
          disabled={isAncestorDenied}
          onCheckedChange={(checked) =>
            handlePermissionChange('elements', element.id, checked === true)
          }
        />
        <Label
          htmlFor={`element-${element.id}`}
          className={`flex-1 cursor-pointer ${isDenied ? 'text-muted-foreground' : ''}`}
        >
          <div className="text-sm">{element.name}</div>
          <div className="text-xs text-muted-foreground">{element.code}</div>
        </Label>
        {isAncestorDenied && (
          <Badge variant="secondary" className="text-xs">
            Hérité
          </Badge>
        )}
      </div>
    );
  };

  const renderBloc = (bloc: HierarchyNode, isAncestorDenied: boolean) => {
    const isDenied = isAncestorDenied || !bloc.canView;
    const isExpanded = expandedBlocs.has(bloc.id);
    const hasChildren = bloc.children && bloc.children.length > 0;

    return (
      <div key={`bloc-${bloc.id}`} className="space-y-2">
        <div className="flex items-center space-x-2 p-2 pl-12 rounded border bg-background">
          {hasChildren && (
            <button
              onClick={() => toggleExpand('bloc', bloc.id)}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <Checkbox
            id={`bloc-${bloc.id}`}
            checked={bloc.canView}
            disabled={isAncestorDenied}
            onCheckedChange={(checked) =>
              handlePermissionChange('blocs', bloc.id, checked === true, bloc)
            }
          />
          <Label
            htmlFor={`bloc-${bloc.id}`}
            className={`flex-1 cursor-pointer ${isDenied ? 'text-muted-foreground' : ''}`}
          >
            <div className="font-medium text-sm">{bloc.name}</div>
            <div className="text-xs text-muted-foreground">{bloc.code}</div>
          </Label>
          {isAncestorDenied && (
            <Badge variant="secondary" className="text-xs">
              Hérité
            </Badge>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {bloc.children!.map((element) => renderElement(element, isDenied))}
          </div>
        )}
      </div>
    );
  };

  const renderPage = (page: HierarchyNode, isAncestorDenied: boolean) => {
    const isDenied = isAncestorDenied || !page.canView;
    const isExpanded = expandedPages.has(page.id);
    const hasChildren = page.children && page.children.length > 0;

    return (
      <div key={`page-${page.id}`} className="space-y-2">
        <div className="flex items-center space-x-2 p-3 pl-8 rounded-lg border bg-background">
          {hasChildren && (
            <button
              onClick={() => toggleExpand('page', page.id)}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <Checkbox
            id={`page-${page.id}`}
            checked={page.canView}
            disabled={isAncestorDenied}
            onCheckedChange={(checked) =>
              handlePermissionChange('pages', page.id, checked === true, page)
            }
          />
          <Label
            htmlFor={`page-${page.id}`}
            className={`flex-1 cursor-pointer ${isDenied ? 'text-muted-foreground' : ''}`}
          >
            <div className="font-medium">{page.name}</div>
            <div className="text-xs text-muted-foreground">{page.code}</div>
          </Label>
          {hasChildren && (
            <Badge variant="outline" className="text-xs">
              {page.children!.length} {page.children!.length === 1 ? 'bloc' : 'blocs'}
            </Badge>
          )}
          {isAncestorDenied && (
            <Badge variant="secondary" className="text-xs">
              Hérité
            </Badge>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="space-y-2">
            {page.children!.map((bloc) => renderBloc(bloc, isDenied))}
          </div>
        )}
      </div>
    );
  };

  const renderModule = (module: HierarchyNode) => {
    const isExpanded = expandedModules.has(module.id);
    const hasChildren = module.children && module.children.length > 0;
    const isDenied = !module.canView;

    return (
      <div key={`module-${module.id}`} className="space-y-2">
        <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-primary/20 bg-primary/5">
          {hasChildren && (
            <button
              onClick={() => toggleExpand('module', module.id)}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          )}
          {!hasChildren && <div className="w-7" />}
          <Checkbox
            id={`module-${module.id}`}
            checked={module.canView}
            onCheckedChange={(checked) =>
              handlePermissionChange('modules', module.id, checked === true, module)
            }
          />
          <Label
            htmlFor={`module-${module.id}`}
            className={`flex-1 cursor-pointer ${isDenied ? 'text-muted-foreground' : ''}`}
          >
            <div className="font-semibold">{module.name}</div>
            <div className="text-sm text-muted-foreground">{module.code}</div>
          </Label>
          {hasChildren && (
            <Badge variant="default" className="text-xs">
              {module.children!.length} {module.children!.length === 1 ? 'page' : 'pages'}
            </Badge>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="space-y-2 ml-4">
            {module.children!.map((page) => renderPage(page, isDenied))}
          </div>
        )}
      </div>
    );
  };

  if (!userId) {
    return null;
  }

  const isLoading = isLoadingPermissions || updateViewRightsMutation.isPending;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold">Droits fins CMS (Module → Page → Bloc → Élément)</h3>
        <p className="text-sm text-muted-foreground">
          Gérez finement les accès aux modules, pages, blocs et éléments du CMS.
          Les permissions refusées à un niveau supérieur bloquent automatiquement tous les niveaux inférieurs.
        </p>
      </div>

      {!loadingGroups && userGroups.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border">
          <span className="text-sm font-medium text-muted-foreground">Groupes:</span>
          {userGroups.map((group) => (
            <Badge key={group.UserGroupId} variant="secondary" className="px-2 py-1">
              {group.GroupName}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>{isLoadingPermissions ? 'Chargement des permissions...' : 'Enregistrement...'}</span>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-[600px] overflow-y-auto border rounded-lg p-4">
            {hierarchyTree.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun module CMS disponible
              </div>
            ) : (
              hierarchyTree.map((module) => renderModule(module))
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer les permissions CMS'}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
