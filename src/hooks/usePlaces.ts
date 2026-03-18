import { useQuery } from '@tanstack/react-query';
import {
  fetchVisibleQFQPlaces,
  fetchCompanyByLieu,
  fetchEmployeesByLieu,
  fetchEmployeesByLieuAndCompany,
  fetchEmployeesByLieuCompanyDept,
  fetchEmployeeById,
  fetchAllQFQEmployees,
  fetchVisibleQFQGroups,
  fetchEmployeesByGroup,
  PLACES_QFQ_QUERY_KEY,
  PLACES_COMPANIES_QUERY_KEY,
  PLACES_EMPLOYEES_QUERY_KEY,
  PLACES_COMPANY_EMPLOYEES_QUERY_KEY,
  PLACES_DEPT_EMPLOYEES_QUERY_KEY,
  PLACES_EMPLOYEE_QUERY_KEY,
  PLACES_ALL_EMPLOYEES_QUERY_KEY,
  PLACES_GROUPS_QUERY_KEY,
  PLACES_GROUP_EMPLOYEES_QUERY_KEY,
  type Place,
  type LieuWithCompanies,
  type LieuEmployeesResponse,
  type CompanyEmployeesResponse,
  type DeptEmployeesResponse,
  type EmployeeDetail,
  type Employee,
  type QFQGroup,
  type GroupEmployeesResponse,
} from '@/lib/placesApi';

export function useVisibleQFQPlaces() {
  return useQuery<Place[]>({
    queryKey: PLACES_QFQ_QUERY_KEY,
    queryFn: fetchVisibleQFQPlaces,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCompanyByLieu() {
  return useQuery<LieuWithCompanies[]>({
    queryKey: PLACES_COMPANIES_QUERY_KEY,
    queryFn: fetchCompanyByLieu,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useEmployeesByLieu(lieuId: number) {
  return useQuery<LieuEmployeesResponse>({
    queryKey: PLACES_EMPLOYEES_QUERY_KEY(lieuId),
    queryFn: () => fetchEmployeesByLieu(lieuId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: lieuId > 0,
  });
}

export function useEmployeesByLieuAndCompany(lieuId: number, companyId: number) {
  return useQuery<CompanyEmployeesResponse>({
    queryKey: PLACES_COMPANY_EMPLOYEES_QUERY_KEY(lieuId, companyId),
    queryFn: () => fetchEmployeesByLieuAndCompany(lieuId, companyId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: lieuId > 0 && companyId > 0,
  });
}

export function useEmployeesByLieuCompanyDept(lieuId: number, companyId: number, department: string) {
  return useQuery<DeptEmployeesResponse>({
    queryKey: PLACES_DEPT_EMPLOYEES_QUERY_KEY(lieuId, companyId, department),
    queryFn: () => fetchEmployeesByLieuCompanyDept(lieuId, companyId, department),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: lieuId > 0 && companyId > 0 && department !== '',
  });
}

export function useEmployeeById(employeeId: number) {
  return useQuery<EmployeeDetail>({
    queryKey: PLACES_EMPLOYEE_QUERY_KEY(employeeId),
    queryFn: () => fetchEmployeeById(employeeId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: employeeId > 0,
  });
}

export function useAllQFQEmployees() {
  return useQuery<Employee[]>({
    queryKey: PLACES_ALL_EMPLOYEES_QUERY_KEY,
    queryFn: fetchAllQFQEmployees,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useVisibleQFQGroups() {
  return useQuery<QFQGroup[]>({
    queryKey: [...PLACES_GROUPS_QUERY_KEY],
    queryFn: fetchVisibleQFQGroups,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useEmployeesByGroup(groupId: number) {
  return useQuery<GroupEmployeesResponse>({
    queryKey: [...PLACES_GROUP_EMPLOYEES_QUERY_KEY(groupId)],
    queryFn: () => fetchEmployeesByGroup(groupId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: groupId > 0,
  });
}

export type { Place, LieuWithCompanies, LieuEmployeesResponse, Employee, QFQGroup, GroupEmployeesResponse } from '@/lib/placesApi';
