import { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { SecureLink } from '@/components/routing/SecureLink';
import { Search, User } from 'lucide-react';
import type { Employee, DepartmentGroup } from '@/lib/placesApi';
import { getEmployeePhotoUrl } from '@/lib/placesApi';

interface EmployeeSearchBarProps {
  departments?: DepartmentGroup[];
  employees?: Employee[];
}

function searchEmployees(allEmployees: Employee[], query: string): Employee[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return allEmployees.filter((emp) => {
    const first = (emp.firstName ?? '').toLowerCase();
    const last = (emp.lastName ?? '').toLowerCase();
    const dept = (emp.department ?? '').toLowerCase();
    const fonc = (emp.fonction ?? '').toLowerCase();
    return (
      first.includes(lower) ||
      last.includes(lower) ||
      `${first} ${last}`.includes(lower) ||
      `${last} ${first}`.includes(lower) ||
      dept.includes(lower) ||
      fonc.includes(lower)
    );
  });
}

export function EmployeeSearchBar({ departments, employees }: EmployeeSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allEmployees = useMemo(() => {
    if (employees) return employees;
    if (!departments) return [];
    return departments.flatMap((dept) => dept.employees);
  }, [departments, employees]);

  const searchResults = useMemo(
    () => searchEmployees(allEmployees, searchQuery),
    [allEmployees, searchQuery],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-72">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un employé..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(e.target.value.trim().length > 0);
          }}
          onFocus={() => {
            if (searchQuery.trim().length > 0) setShowResults(true);
          }}
        />
      </div>
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {searchResults.map((emp) => (
            <SecureLink
              key={emp.id}
              to={`/qui-fait-quoi/employe?id=${emp.id}`}
              className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 hover:bg-muted/50"
              onClick={() => setShowResults(false)}
            >
              <div className="shrink-0">
                {getEmployeePhotoUrl(emp.photo) ? (
                  <img
                    src={getEmployeePhotoUrl(emp.photo)!}
                    alt={`${emp.firstName} ${emp.lastName}`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm">{emp.firstName} {emp.lastName}</div>
                {emp.tel && (
                  <div className="text-xs text-muted-foreground">{emp.tel}</div>
                )}
                {emp.email && (
                  <div className="text-xs text-muted-foreground">{emp.email}</div>
                )}
              </div>
            </SecureLink>
          ))}
        </div>
      )}
      {showResults && searchQuery.trim().length > 0 && searchResults.length === 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card border rounded-lg shadow-lg p-3 text-sm text-muted-foreground">
          Aucun résultat
        </div>
      )}
    </div>
  );
}
