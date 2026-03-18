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
import { SecureLink } from '@/components/routing/SecureLink';
import { useEmployeeById } from '@/hooks/usePlaces';
import { getEmployeePhotoUrl } from '@/lib/placesApi';
import { Loader2, User } from 'lucide-react';

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="py-2 pr-6 font-semibold text-sm text-muted-foreground whitespace-nowrap align-top w-48">
        {label}
      </td>
      <td className="py-2 text-sm">
        {value || <span className="text-muted-foreground/50">—</span>}
      </td>
    </tr>
  );
}

function PlaceholderRow({ label }: { label: string }) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="py-2 pr-6 font-semibold text-sm text-muted-foreground whitespace-nowrap align-top w-48">
        {label}
      </td>
      <td className="py-2 text-sm text-muted-foreground/50">—</td>
    </tr>
  );
}

export function EmployeeFiche() {
  const [searchParams] = useSearchParams();
  const employeeId = parseInt(searchParams.get('id') ?? '0', 10);

  const { data: employee, isLoading, error } = useEmployeeById(employeeId);

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
          {employee && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <SecureLink to={`/qui-fait-quoi/groupes?id=${employee.lieuId}`}>
                    {employee.lieuName}
                  </SecureLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {employee ? `${employee.firstName} ${employee.lastName}` : 'Chargement...'}
            </BreadcrumbPage>
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
          Erreur lors du chargement de la fiche employé.
        </div>
      )}

      {employee && (
        <Card className="rounded-xl border shadow overflow-hidden">
          <CardContent className="p-6">
            {/* Header : photo + nom + département + fonction */}
            <div className="flex gap-6 mb-6">
              <div className="shrink-0">
                {getEmployeePhotoUrl(employee.photo) ? (
                  <img
                    src={getEmployeePhotoUrl(employee.photo)!}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {employee.firstName} {employee.lastName}
                </h1>
                {employee.department && (
                  <div className="mt-1">
                    <SecureLink
                      to={`/qui-fait-quoi/departement?lieuId=${employee.lieuId}&companyId=${employee.companyId}&department=${encodeURIComponent(employee.department)}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {employee.department}
                    </SecureLink>
                  </div>
                )}
                {employee.fonction && (
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {employee.fonction}
                  </div>
                )}
                {employee.description && (
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {employee.description}
                  </div>
                )}
              </div>
            </div>

            {/* Tableau d'informations */}
            <table className="w-full border-collapse">
              <tbody>
                <InfoRow
                  label="Société"
                  value={employee.companyName}
                />
                <InfoRow
                  label="Lieu"
                  value={employee.lieuName}
                />
                <InfoRow label="Etage" />
                <InfoRow label="Emplacement" />
                <InfoRow label="Tel" value={employee.tel} />
                <InfoRow label="Tel Portable" value={employee.telp} />
                {employee.fax && <InfoRow label="Fax" value={employee.fax} />}
                <InfoRow label="Mail" value={employee.email} />
                {employee.teams && <InfoRow label="Teams" value={employee.teams} />}
                <InfoRow label="Horaire" value={employee.horaire} />
              </tbody>
            </table>

            {/* Section statut / planning */}
            <table className="w-full border-collapse mt-4 border-t">
              <tbody>
                <InfoRow label="Présence" value={employee.presence} />
                <PlaceholderRow label="En cas d'absence contacter" />
                <PlaceholderRow label="Absence" />
                <PlaceholderRow label="Formation" />
                <PlaceholderRow label="Télétravail" />
                <PlaceholderRow label="Déplacement" />
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EmployeeFiche;
