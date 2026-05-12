import { fetchWithOAuth } from './oauth';

const PLACES_BASE_URL = import.meta.env.DEV
  ? '/Api/v2.0/places'
  : `${import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com'}/Api/v2.0/places`;

export interface Place {
  ID: number;
  LIEU: string;
  sortOrder: number;
}

export interface CompanyInfo {
  companyId: number;
  companyName: string;
  departments: string[];
}

export interface LieuWithCompanies {
  lieuId: number;
  lieuName: string;
  companies: CompanyInfo[];
}

/**
 * Mapping des noms BDD vers les noms d'affichage complets.
 * Clé = nom en BDD (insensible à la casse), Valeur = nom affiché.
 */
const COMPANY_DISPLAY_NAMES: Record<string, string> = {
  'GED': 'Glénat Entreprises et Développement',
};

export function getCompanyDisplayName(dbName: string): string {
  return COMPANY_DISPLAY_NAMES[dbName.trim()] ?? dbName;
}

const PHOTO_BASE_URL = 'https://intranet.glenat.com/images/photos';

export function getEmployeePhotoUrl(photo: string | undefined | null): string | null {
  if (!photo || photo.trim() === '') return null;
  const name = photo.trim();
  const url = name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.gif')
    ? `${PHOTO_BASE_URL}/${name}`
    : `${PHOTO_BASE_URL}/${name}.jpg`;
  return url;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  result?: T | { result?: T };
}

function extractResult<T>(data: ApiResponse<T>): T | undefined {
  const result = data.result;
  if (result && typeof result === 'object' && 'result' in (result as Record<string, unknown>)) {
    return (result as { result: T }).result;
  }
  return result as T | undefined;
}

export async function fetchVisibleQFQPlaces(): Promise<Place[]> {
  const response = await fetchWithOAuth(`${PLACES_BASE_URL}/qui-fait-quoi`);

  if (!response.ok) {
    throw new Error(
      `La récupération des lieux a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<Place[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des lieux a échoué.');
  }

  return extractResult(data) ?? [];
}

export async function fetchCompanyByLieu(): Promise<LieuWithCompanies[]> {
  const response = await fetchWithOAuth(`${PLACES_BASE_URL}/qui-fait-quoi/companies`);

  if (!response.ok) {
    throw new Error(
      `La récupération des companies par lieu a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<LieuWithCompanies[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des companies par lieu a échoué.');
  }

  const lieux = extractResult(data) ?? [];

  // Appliquer le mapping des noms d'affichage
  for (const lieu of lieux) {
    for (const company of lieu.companies) {
      company.companyName = getCompanyDisplayName(company.companyName);
    }
  }

  return lieux;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  fonction: string;
  tel: string;
  telp: string;
  email: string;
  presence: string;
  horaire: string;
  photo: string;
}

export interface QFQGroup {
  ID: number;
  groupName: string;
  CODE: string;
  sortOrder: number;
}

export interface LieuDepartments {
  lieuName: string;
  lieuAddress: string;
  lieuCode: string;
  lieuCity: string;
  lieuTel: string;
  departments: DepartmentGroup[];
}

export interface GroupEmployeesResponse {
  lieux: LieuDepartments[];
}

export interface EmployeeDetail extends Employee {
  description: string;
  sup: string;
  remplacant: string;
  remplacant2: string;
  fax: string;
  teams: string;
  lieuId: number;
  lieuName: string;
  lieuAddress: string;
  lieuCode: string;
  lieuCity: string;
  companyId: number;
  companyName: string;
}

export interface DepartmentGroup {
  name: string;
  employees: Employee[];
}

export interface LieuInfo {
  lieuId: number;
  lieuName: string;
  address: string;
  code: string;
  city: string;
  tel: string;
  fax: string;
}

export interface LieuEmployeesResponse {
  lieu: LieuInfo | null;
  departments: DepartmentGroup[];
}

export interface CompanyEmployeesResponse {
  lieu: LieuInfo | null;
  companyName: string;
  departments: DepartmentGroup[];
}

export interface DeptEmployeesResponse {
  lieu: LieuInfo | null;
  companyName: string;
  department: string;
  employees: Employee[];
}

export async function fetchEmployeesByLieuAndCompany(lieuId: number, companyId: number): Promise<CompanyEmployeesResponse> {
  const response = await fetchWithOAuth(`${PLACES_BASE_URL}/qui-fait-quoi/${lieuId}/company/${companyId}/employees`);

  if (!response.ok) {
    throw new Error(
      `La récupération des employés a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<CompanyEmployeesResponse>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des employés a échoué.');
  }

  const result = extractResult(data) ?? { lieu: null, companyName: '', departments: [] };
  result.companyName = getCompanyDisplayName(result.companyName);
  return result;
}

export async function fetchEmployeesByLieuCompanyDept(lieuId: number, companyId: number, department: string): Promise<DeptEmployeesResponse> {
  const params = new URLSearchParams({ department });
  const response = await fetchWithOAuth(`${PLACES_BASE_URL}/qui-fait-quoi/${lieuId}/company/${companyId}/department?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `La récupération des employés a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<DeptEmployeesResponse>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des employés a échoué.');
  }

  const result = extractResult(data) ?? { lieu: null, companyName: '', department: '', employees: [] };
  result.companyName = getCompanyDisplayName(result.companyName);
  return result;
}

export async function fetchEmployeesByLieu(lieuId: number): Promise<LieuEmployeesResponse> {
  const response = await fetchWithOAuth(`${PLACES_BASE_URL}/qui-fait-quoi/${lieuId}/employees`);

  if (!response.ok) {
    throw new Error(
      `La récupération des employés a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<LieuEmployeesResponse>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des employés a échoué.');
  }

  return extractResult(data) ?? { lieu: null, departments: [] };
}

export async function fetchAllQFQEmployees(): Promise<Employee[]> {
  const response = await fetchWithOAuth(`${PLACES_BASE_URL}/qui-fait-quoi/employees`);

  if (!response.ok) {
    throw new Error(
      `La récupération des employés a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<Employee[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des employés a échoué.');
  }

  return extractResult(data) ?? [];
}

export async function fetchVisibleQFQGroups(): Promise<QFQGroup[]> {
  const response = await fetchWithOAuth(`${PLACES_BASE_URL}/qui-fait-quoi/groups`);

  if (!response.ok) {
    throw new Error(
      `La récupération des groupes a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<QFQGroup[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des groupes a échoué.');
  }

  return extractResult(data) ?? [];
}

export async function fetchEmployeesByGroup(groupId: number): Promise<GroupEmployeesResponse> {
  const response = await fetchWithOAuth(`${PLACES_BASE_URL}/qui-fait-quoi/groups/${groupId}/employees`);

  if (!response.ok) {
    throw new Error(
      `La récupération des employés du groupe a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<GroupEmployeesResponse>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des employés du groupe a échoué.');
  }

  return extractResult(data) ?? { lieux: [] };
}

export async function fetchEmployeeById(employeeId: number): Promise<EmployeeDetail> {
  const response = await fetchWithOAuth(`${PLACES_BASE_URL}/qui-fait-quoi/employee/${employeeId}`);

  if (!response.ok) {
    throw new Error(
      `La récupération de l'employé a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<EmployeeDetail>;
  if (data.success === false) {
    throw new Error(data.message || "La récupération de l'employé a échoué.");
  }

  const result = extractResult(data);
  if (!result) throw new Error('Employé introuvable.');
  result.companyName = getCompanyDisplayName(result.companyName);
  return result;
}

export const PLACES_EMPLOYEE_QUERY_KEY = (id: number) => ['places', 'qui-fait-quoi', 'employee', id] as const;
export const PLACES_GROUPS_QUERY_KEY = ['places', 'qui-fait-quoi', 'groups'] as const;
export const PLACES_GROUP_EMPLOYEES_QUERY_KEY = (groupId: number) => ['places', 'qui-fait-quoi', 'groups', groupId, 'employees'] as const;
export const PLACES_QFQ_QUERY_KEY = ['places', 'qui-fait-quoi'] as const;
export const PLACES_COMPANIES_QUERY_KEY = ['places', 'qui-fait-quoi', 'companies'] as const;
export const PLACES_EMPLOYEES_QUERY_KEY = (lieuId: number) => ['places', 'qui-fait-quoi', lieuId, 'employees'] as const;
export const PLACES_ALL_EMPLOYEES_QUERY_KEY = ['places', 'qui-fait-quoi', 'all-employees'] as const;
export const PLACES_COMPANY_EMPLOYEES_QUERY_KEY = (lieuId: number, companyId: number) => ['places', 'qui-fait-quoi', lieuId, 'company', companyId, 'employees'] as const;
export const PLACES_DEPT_EMPLOYEES_QUERY_KEY = (lieuId: number, companyId: number, dept: string) => ['places', 'qui-fait-quoi', lieuId, 'company', companyId, 'dept', dept] as const;
