import { useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SecureLink } from '@/components/routing/SecureLink';
import { EmployeeSearchBar } from '@/components/qui-fait-quoi/EmployeeSearchBar';
import { useEmployeesByLieuAndCompany } from '@/hooks/usePlaces';
import type { Employee } from '@/lib/placesApi';
import { getEmployeePhotoUrl } from '@/lib/placesApi';
import { Loader2, User } from 'lucide-react';

function PresenceBadge({ presence }: { presence: string }) {
  if (!presence) return null;

  const lower = presence.toLowerCase();
  let color = 'bg-gray-100 text-gray-700';
  if (lower.includes('présent') || lower === 'present') {
    color = 'bg-green-100 text-green-700';
  } else if (lower.includes('télétravail')) {
    color = 'bg-blue-100 text-blue-700';
  } else if (lower.includes('absent') || lower.includes('congé')) {
    color = 'bg-orange-100 text-orange-700';
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${color}`}>
      {presence}
    </span>
  );
}

function EmployeeRow({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      <div className="shrink-0">
        {getEmployeePhotoUrl(employee.photo) ? (
          <img
            src={getEmployeePhotoUrl(employee.photo)!}
            alt={`${employee.firstName} ${employee.lastName}`}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <SecureLink to={`/qui-fait-quoi/employe?id=${employee.id}`} className="font-semibold text-sm hover:underline">
          {employee.firstName} {employee.lastName}
        </SecureLink>
        {employee.fonction && (
          <div className="text-xs text-muted-foreground truncate">{employee.fonction}</div>
        )}
      </div>

      <div className="shrink-0 w-72 text-left">
        <PresenceBadge presence={employee.presence} />
      </div>

      <div className="shrink-0 w-40 text-sm">
        {employee.tel && <div>{employee.tel}</div>}
        {employee.telp && <div className="text-muted-foreground">{employee.telp}</div>}
      </div>

      <div className="shrink-0 w-56 text-sm text-muted-foreground truncate">
        {employee.email}
      </div>
    </div>
  );
}

export function Company() {
  const [searchParams] = useSearchParams();
  const lieuId = parseInt(searchParams.get('lieuId') ?? '0', 10);
  const companyId = parseInt(searchParams.get('companyId') ?? '0', 10);

  const { data, isLoading, error } = useEmployeesByLieuAndCompany(lieuId, companyId);

  const lieu = data?.lieu;
  const companyName = data?.companyName ?? '';
  const departments = data?.departments ?? [];

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <SecureLink to="/">Accueil</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <SecureLink to="/qui-fait-quoi">Qui fait quoi</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <SecureLink to={`/qui-fait-quoi/groupes?id=${lieuId}`}>
                {lieu?.lieuName ?? '...'}
              </SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{companyName || 'Chargement...'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </div>
      )}

      {error && (
        <div className="text-destructive text-sm">
          Erreur lors du chargement des employés.
        </div>
      )}

      {lieu && (
        <Card className="rounded-xl border shadow overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b">
              <div>
                <h1 className="text-xl font-bold">{companyName}</h1>
                <div className="text-sm text-muted-foreground">
                  {lieu.lieuName} — {lieu.address} {lieu.code} {lieu.city}
                </div>
                {lieu.tel && (
                  <div className="text-sm text-muted-foreground">
                    Tel : {lieu.tel}
                  </div>
                )}
              </div>
              <EmployeeSearchBar departments={departments} />
            </div>

            {/* En-têtes colonnes */}
            <div className="flex items-center gap-4 py-2 px-4 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <div className="flex-1 min-w-0">Nom</div>
              <div className="shrink-0 w-72 text-left">Présence</div>
              <div className="shrink-0 w-40">Téléphone</div>
              <div className="shrink-0 w-56">Mail</div>
            </div>

            {/* Liste des départements et employés */}
            {departments.map((dept, deptIndex) => (
              <div key={dept.name}>
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <SecureLink
                    to={`/qui-fait-quoi/departement?lieuId=${lieuId}&companyId=${companyId}&department=${encodeURIComponent(dept.name)}`}
                    className="font-bold text-sm hover:underline"
                  >
                    {dept.name}
                  </SecureLink>
                </div>

                {dept.employees.map((employee, empIndex) => (
                  <div key={employee.id}>
                    <EmployeeRow employee={employee} />
                    {empIndex < dept.employees.length - 1 && <Separator />}
                  </div>
                ))}

                {deptIndex < departments.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Company;
