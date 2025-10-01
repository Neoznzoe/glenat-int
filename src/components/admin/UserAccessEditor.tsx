import { useMemo, useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PermissionDefinition, GroupDefinition, PermissionKey } from '@/lib/access-control';
import type { PermissionEvaluation, UserAccount } from '@/lib/mockDb';
import type { DraftAccessState, PermissionSelectValue } from './access-types';
import { useCreateGroup } from '@/hooks/useAdminData';
import { toast } from 'sonner';

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
  onPermissionChange: (key: PermissionKey, value: PermissionSelectValue) => void;
  onReset: () => void;
  onSave: () => void;
}

function describePermissionOrigin(
  origin: PermissionEvaluation['origin'],
  inheritedFrom: string[],
  basePermission: boolean,
) {
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
      return inheritedFrom.length
        ? 'Refusé (les groupes n’autorisent pas l’accès)'
        : 'Aucun groupe ne fournit cet accès';
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
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const createGroupMutation = useCreateGroup();
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

  const handleCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      toast.error('Le nom du groupe est requis.');
      return;
    }
    try {
      await createGroupMutation.mutateAsync(trimmed);
      toast.success('Groupe ajouté', { description: `${trimmed} a été créé avec succès.` });
      setIsCreateGroupOpen(false);
      setNewGroupName('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error("Impossible de créer le groupe", { description: message });
    }
  };

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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">Groupes métiers</h3>
                  <p className="text-sm text-muted-foreground">
                    Les groupes déterminent les accès partagés. Vous pouvez ajouter ou retirer un
                    utilisateur d’un groupe pour modifier ses droits.
                  </p>
                </div>
                <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" disabled={isLoading}>
                      Nouveau groupe
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form className="space-y-6" onSubmit={handleCreateGroup}>
                      <DialogHeader>
                        <DialogTitle>Nouveau groupe</DialogTitle>
                        <DialogDescription>
                          Renseignez un nom de groupe. Il sera immédiatement disponible pour
                          l’ensemble des utilisateurs.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="new-group-name">Nom du groupe</Label>
                        <Input
                          id="new-group-name"
                          value={newGroupName}
                          onChange={(event) => setNewGroupName(event.target.value)}
                          placeholder="Ex. Équipe Marketing"
                          autoFocus
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateGroupOpen(false)}
                          disabled={createGroupMutation.isPending}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          disabled={createGroupMutation.isPending || !newGroupName.trim()}
                        >
                          {createGroupMutation.isPending ? 'Création…' : 'Créer'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-3">
                {groups.map((group) => {
                  const checked = draft.groups.includes(group.id);
                  return (
                    <label
                      key={group.id}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          onToggleGroup(group.id, value === true || value === 'indeterminate')
                        }
                        disabled={isSuperAdmin || isLoading}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{group.name}</span>
                          <Badge variant="outline" className={cn('text-xs border', group.accentColor)}>
                            {group.defaultPermissions.length} accès
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      </div>
                    </label>
                  );
                })}
                {!groups.length && (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Aucun groupe n’est défini pour le moment. Créez un groupe pour commencer à
                    organiser les accès.
                  </div>
                )}
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
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission</TableHead>
                      <TableHead>Origine</TableHead>
                      <TableHead className="w-40">Décision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissionEvaluations.map(({ definition, evaluation }) => {
                      const selectValue = getPermissionSelectValue(draft.permissionOverrides, definition.key);
                      const effective = effectivePermissionSet.has(definition.key);
                      const tone = effective ? 'text-emerald-600' : 'text-muted-foreground';
                      const inheritedFrom = evaluation.inheritedFrom
                        .map((groupId) => groupMap.get(groupId)?.name ?? groupId)
                        .filter(Boolean);

                      return (
                        <TableRow key={definition.key}>
                          <TableCell>
                            <div className="font-medium">{definition.label}</div>
                            <div className="text-xs text-muted-foreground">{definition.description}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">
                              {describePermissionOrigin(
                                evaluation.origin,
                                inheritedFrom,
                                evaluation.basePermission,
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={selectValue}
                              onValueChange={(value: PermissionSelectValue) =>
                                onPermissionChange(definition.key, value)
                              }
                              disabled={isSuperAdmin || isLoading}
                            >
                              <SelectTrigger
                                className={cn('capitalize', selectValue !== 'inherit' && tone)}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
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
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
