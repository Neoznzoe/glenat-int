import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SecureLink } from '@/components/routing/SecureLink';
import { EmployeeSearchBar } from '@/components/qui-fait-quoi/EmployeeSearchBar';
import { useCompanyByLieu, useAllQFQEmployees, useVisibleQFQGroups } from '@/hooks/usePlaces';
import type { LieuWithCompanies, CompanyInfo, QFQGroup } from '@/lib/placesApi';
import { Loader2, ChevronRight } from 'lucide-react';

const UNIVERS_COLORS = [
  'var(--glenat-manga)',
  'var(--glenat-jeunesse)',
  'var(--glenat-livre)',
];

interface Secteur {
  title: string;
  color: string;
  lieuId: number | null;
  companies: CompanyInfo[];
  groups?: QFQGroup[];
}

function buildSecteurs(lieuxWithCompanies: LieuWithCompanies[], groups: QFQGroup[]): Secteur[] {
  const groupes: Secteur = {
    title: 'Groupes',
    color: 'var(--glenat-bd)',
    lieuId: null,
    companies: [],
    groups,
  };

  const dynamicSecteurs: Secteur[] = lieuxWithCompanies.map((lieu, index) => ({
    title: lieu.lieuName,
    color: UNIVERS_COLORS[index % UNIVERS_COLORS.length],
    lieuId: lieu.lieuId,
    companies: lieu.companies,
  }));

  return [groupes, ...dynamicSecteurs];
}

export function QuiFaitQuoiHome() {
  const { data: lieuxWithCompanies, isLoading, error } = useCompanyByLieu();
  const { data: allEmployees } = useAllQFQEmployees();
  const { data: qfqGroups } = useVisibleQFQGroups();

  const secteurs = buildSecteurs(lieuxWithCompanies ?? [], qfqGroups ?? []);

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
            <BreadcrumbPage>Qui fait quoi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-[2.5rem] font-bold">Qui fait quoi</h1>
        <EmployeeSearchBar employees={allEmployees ?? []} />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </div>
      )}

      {error && (
        <div className="text-destructive text-sm">
          Erreur lors du chargement des données.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {secteurs.map((secteur) => (
          <Card key={secteur.title} className="rounded-xl border shadow overflow-hidden">
            <CardHeader
              className="py-3 px-4"
              style={{ backgroundColor: secteur.color }}
            >
              {secteur.lieuId ? (
                <SecureLink to={`/qui-fait-quoi/groupes?id=${secteur.lieuId}`}>
                  <CardTitle className="text-black text-lg font-normal hover:underline cursor-pointer">
                    {secteur.title}
                  </CardTitle>
                </SecureLink>
              ) : (
                <CardTitle className="text-black text-lg font-normal">
                  {secteur.title}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="p-4">
              {secteur.groups && secteur.groups.length > 0 ? (
                <ul className="space-y-0.5">
                  {secteur.groups.map((group) => (
                    <li key={group.ID}>
                      <SecureLink
                        to={`/qui-fait-quoi/groupes?groupId=${group.ID}`}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:underline hover:text-foreground"
                      >
                        <ChevronRight className="h-3 w-3 shrink-0" />
                        {group.groupName}
                      </SecureLink>
                    </li>
                  ))}
                </ul>
              ) : secteur.companies.length > 0 ? (
                <div className="space-y-4">
                  {secteur.companies.map((company) => (
                    <div key={company.companyId}>
                      {secteur.lieuId ? (
                        <SecureLink to={`/qui-fait-quoi/company?lieuId=${secteur.lieuId}&companyId=${company.companyId}`}>
                          <h3 className="font-bold text-sm hover:underline cursor-pointer">{company.companyName}</h3>
                        </SecureLink>
                      ) : (
                        <h3 className="font-bold text-sm">{company.companyName}</h3>
                      )}
                      {company.departments.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {company.departments.map((dept) => (
                            <li key={dept}>
                              {secteur.lieuId ? (
                                <SecureLink
                                  to={`/qui-fait-quoi/departement?lieuId=${secteur.lieuId}&companyId=${company.companyId}&department=${encodeURIComponent(dept)}`}
                                  className="flex items-center gap-1 text-sm text-muted-foreground hover:underline hover:text-foreground"
                                >
                                  <ChevronRight className="h-3 w-3 shrink-0" />
                                  {dept}
                                </SecureLink>
                              ) : (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <ChevronRight className="h-3 w-3 shrink-0" />
                                  {dept}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[200px]" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default QuiFaitQuoiHome;
