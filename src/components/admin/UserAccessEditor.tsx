import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { PermissionDefinition, GroupDefinition, PermissionKey } from '@/lib/access-control';
import type { PermissionEvaluation, UserAccount } from '@/lib/mockDb';
import type { DraftAccessState, PermissionSelectValue } from './access-types';

const PERMISSION_SELECT_OPTIONS: Array<{
  value: PermissionSelectValue;
  label: string;
  description: string;
}> = [
  {
    value: 'inherit',
    label: 'Hérité',
    description: 'Conserver la règle fournie par les groupes ou la base.',
  },
  { value: 'allow', label: 'Autoriser', description: 'Accès accordé explicitement.' },
  { value: 'deny', label: 'Refuser', description: 'Bloquer même si un groupe autorise.' },
];

const STATUS_STYLES: Record<'active' | 'inactive', string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200',
  inactive: 'bg-amber-500/10 text-amber-600 border border-amber-200',
};

export interface PermissionEvaluationRow {
  definition: PermissionDefinition;
  evaluation: PermissionEvaluation;
}

interface UserAccessEditorProps {
  user: UserAccount | null;
  draft: DraftAccessState;
  groups: GroupDefinition[];
  permissionEvaluations: PermissionEvaluationRow[];
  effectivePermissionSet: Set<PermissionKey>;
  isDirty: boolean;
  isSaving: boolean;
  isSuperAdmin: boolean;
  isLoading?: boolean;
  onToggleGroup: (groupId: string, checked: boolean) => void;
  onPermissionChange: (definition: PermissionDefinition, value: PermissionSelectValue) => void;
  onReset: () => void;
  onSave: () => void;
}

function describePermissionOrigin(
  origin: PermissionEvaluation['origin'],
  inheritedFrom: string[],
  basePermission: boolean,
): string | null {
  switch (origin) {
    case 'superadmin':
      return 'Super administrateur – accès permanent';
    case 'override-allow':
      return 'Autorisation directe définie pour cet utilisateur';
    case 'override-deny':
      return 'Refus direct défini pour cet utilisateur';
    case 'group':
      return `Hérité des groupes : ${inheritedFrom.join(', ')}`;
    case 'base':
      return basePermission
        ? "Accès de base fourni à tous les utilisateurs"
        : 'Hérité des règles par défaut';
    case 'none':
    default:
      return inheritedFrom.length ? 'Refusé (les groupes n’autorisent pas l’accès)' : null;
  }
}

function getPermissionSelectValue(overrides: DraftAccessState['permissionOverrides'], key: PermissionKey) {
  const override = overrides.find((candidate) => candidate.key === key);
  return override ? override.mode : 'inherit';
}

export function UserAccessEditor({
  user,
  draft,
  groups,
  permissionEvaluations,
  effectivePermissionSet,
  isDirty,
  isSaving,
  isSuperAdmin,
  isLoading,
  onToggleGroup,
  onPermissionChange,
  onReset,
  onSave,
}: UserAccessEditorProps) {
  const groupMap = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups]);
  const headerDescription = useMemo(() => {
    if (!user) {
      return 'Choisissez une personne dans la liste pour afficher ses droits.';
    }
    const parts = [user.jobTitle, user.department]
      .map((value) => (value ? value.trim() : ''))
      .filter((value) => Boolean(value));
      if (!parts.length && user.username) {
        parts.push(`Identifiant : ${user.username}`);
      }
      if (!parts.length && user.preferredLanguage) {
        parts.push(`Langue : ${user.preferredLanguage}`);
    }
    if (!parts.length && user.email) {
      parts.push(user.email);
    }
    return parts.length ? parts.join(' — ') : 'Aucune information complémentaire disponible';
  }, [user]);

  const permissionSections = useMemo(
    () => {
      const modules: PermissionEvaluationRow[] = [];
      const pagesByParent = new Map<PermissionKey | undefined, PermissionEvaluationRow[]>();

      for (const row of permissionEvaluations) {
        const isPage = row.definition.type === 'page' || Boolean(row.definition.parentKey);
        if (isPage) {
          const parentKey = row.definition.parentKey ?? undefined;
          if (!pagesByParent.has(parentKey)) {
            pagesByParent.set(parentKey, []);
          }
          pagesByParent.get(parentKey)!.push(row);
          continue;
        }
        modules.push(row);
      }

      const sections = modules.map((moduleRow) => {
        const pageRows = pagesByParent.get(moduleRow.definition.key) ?? [];
        pagesByParent.delete(moduleRow.definition.key);
        const sortedPages = [...pageRows].sort((left, right) =>
          left.definition.label.localeCompare(right.definition.label, 'fr', { sensitivity: 'base' }),
        );
        return { module: moduleRow, pages: sortedPages };
      });

      const remainingPages = Array.from(pagesByParent.values()).flat();
      for (const pageRow of remainingPages) {
        sections.push({ module: pageRow, pages: [] });
      }

      return sections;
    },
    [permissionEvaluations],
  );

  const isDecisionDisabled = isSuperAdmin || isLoading;

  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{user ? user.displayName : 'Sélectionnez un utilisateur'}</CardTitle>
            <CardDescription>{headerDescription}</CardDescription>
          </div>
          {user && (
            <div className="flex flex-wrap gap-2">
              <Badge className={cn('border text-xs', STATUS_STYLES[user.status])}>
                {user.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
              {user.isSuperAdmin && (
                <Badge className="border bg-primary/10 text-primary border-primary/40 text-xs">
                  Super administrateur
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!user && (
          <div className="text-sm text-muted-foreground">
            Sélectionnez un collaborateur pour modifier ses groupes et exceptions d’accès.
          </div>
        )}

        {user && (
          <div className="space-y-8">
            <section className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">Groupes métiers</h3>
                <p className="text-sm text-muted-foreground">
                  Les groupes déterminent les accès partagés. Vous pouvez ajouter ou retirer un
                  utilisateur d’un groupe pour modifier ses droits.
                </p>
              </div>
              <div className="grid gap-3">
                {groups.map((group) => {
                  const checked = draft.groups.includes(group.id);
                  return (
                    <label
                      key={group.id}
                      className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <div className="flex items-center gap-3 sm:flex-1">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            onToggleGroup(group.id, value === true || value === 'indeterminate')
                          }
                          disabled={isSuperAdmin || isLoading}
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{group.name}</span>
                            <Badge variant="outline" className={cn('text-xs border', group.accentColor)}>
                              {group.defaultPermissions.length} accès
                            </Badge>
                          </div>
                          {group.description && (
                            <p className="text-sm text-muted-foreground">{group.description}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">Exceptions individuelles</h3>
                <p className="text-sm text-muted-foreground">
                  Choisissez les permissions à accorder ou retirer explicitement pour cette personne.
                  Laisser « Hérité » applique la règle des groupes.
                </p>
                <div className="text-xs text-muted-foreground">
                  {effectivePermissionSet.size} accès actifs pour ce profil
                </div>
              </div>
              <div className="space-y-3">
                {permissionSections.length === 0 && (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Aucune permission disponible pour cette personne.
                  </div>
                )}
                {permissionSections.map(({ module, pages }) => {
                  const { definition, evaluation } = module;
                  const selectValue = getPermissionSelectValue(
                    draft.permissionOverrides,
                    definition.key,
                  );
                  const effective = effectivePermissionSet.has(definition.key);
                  const tone = effective ? 'text-emerald-600' : 'text-muted-foreground';
                  const inheritedFrom = evaluation.inheritedFrom
                    .map((groupId) => groupMap.get(groupId)?.name ?? groupId)
                    .filter(Boolean);
                  const hasPages = pages.length > 0 && definition.type !== 'page';
                  const moduleOrigin = describePermissionOrigin(
                    evaluation.origin,
                    inheritedFrom,
                    evaluation.basePermission,
                  );
                  const showModuleOrigin = Boolean(moduleOrigin);
                  const pageCountLabel =
                    pages.length > 0 ? `${pages.length} page${pages.length > 1 ? 's' : ''}` : '';

                  return (
                    <Collapsible
                      key={definition.key}
                      className="group overflow-hidden rounded-lg border bg-background"
                    >
                      <div className="flex flex-col">
                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 space-y-3">
                            {hasPages ? (
                              <div className="space-y-2">
                                <CollapsibleTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-md border border-transparent bg-transparent p-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted/60"
                                  >
                                    <span className={cn('font-medium', tone)}>{definition.label}</span>
                                    <span className="text-xs font-medium text-muted-foreground transition-colors data-[state=open]:text-primary">
                                      {pageCountLabel}
                                    </span>
                                  </button>
                                </CollapsibleTrigger>
                                {showModuleOrigin && (
                                  <div className="text-xs text-muted-foreground">{moduleOrigin}</div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2 rounded-md p-2">
                                <div className={cn('font-medium', tone)}>{definition.label}</div>
                                {showModuleOrigin && (
                                  <div className="text-xs text-muted-foreground">{moduleOrigin}</div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-left sm:w-auto sm:justify-end sm:text-right">
                            <Select
                              value={selectValue}
                              onValueChange={(value: PermissionSelectValue) =>
                                onPermissionChange(definition, value)
                              }
                              disabled={isDecisionDisabled}
                            >
                              <SelectTrigger
                                className={cn('capitalize', selectValue !== 'inherit' && tone)}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent align="end">
                                {PERMISSION_SELECT_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="text-sm"
                                  >
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {option.description}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {hasPages && (
                          <CollapsibleContent>
                            <div className="space-y-3 border-t bg-muted/40 px-4 py-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Pages
                              </div>
                              {pages.map(({ definition: pageDefinition, evaluation: pageEvaluation }) => {
                                const pageSelectValue = getPermissionSelectValue(
                                  draft.permissionOverrides,
                                  pageDefinition.key,
                                );
                                const pageEffective = effectivePermissionSet.has(pageDefinition.key);
                                const pageTone = pageEffective
                                  ? 'text-emerald-600'
                                  : 'text-muted-foreground';
                                const pageInheritedFrom = pageEvaluation.inheritedFrom
                                  .map((groupId) => groupMap.get(groupId)?.name ?? groupId)
                                  .filter(Boolean);
                                const pageOrigin = describePermissionOrigin(
                                  pageEvaluation.origin,
                                  pageInheritedFrom,
                                  pageEvaluation.basePermission,
                                );
                                const showPageOrigin = Boolean(pageOrigin);

                                return (
                                  <div
                                    key={pageDefinition.key}
                                    className="rounded-md border bg-background/80 p-3 shadow-sm"
                                  >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="space-y-1">
                                        <div className={cn('text-sm font-medium', pageTone)}>
                                          {pageDefinition.label}
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                        <Select
                                          value={pageSelectValue}
                                          onValueChange={(value: PermissionSelectValue) =>
                                            onPermissionChange(pageDefinition, value)
                                          }
                                          disabled={isDecisionDisabled}
                                        >
                                          <SelectTrigger
                                            className={cn(
                                              'w-full capitalize sm:w-36',
                                              pageSelectValue !== 'inherit' && pageTone,
                                            )}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent align="end">
                                            {PERMISSION_SELECT_OPTIONS.map((option) => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="text-sm"
                                              >
                                                <div className="font-medium">{option.label}</div>
                                                <div className="text-xs text-muted-foreground">
                                                  {option.description}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    {showPageOrigin && (
                                      <div className="text-xs text-muted-foreground">{pageOrigin}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        )}
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onReset}
                disabled={!isDirty || isSaving || isLoading}
              >
                Réinitialiser
              </Button>
              <Button
                type="button"
                onClick={onSave}
                disabled={isSuperAdmin || !isDirty || isSaving || isLoading}
              >
                {isSaving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
