import { useState, useMemo, useEffect } from 'react';
import { usePlanningLeaves, useLeaveReasons, usePlanningEmployees, usePlanningFilters } from '@/hooks/usePlanning';
import { useAnnonceEmetteur } from '@/hooks/useAnnonces';
import { useAuth } from '@/context/AuthContext';
import type { PlanningEmployee, PlanningLeave, LeaveReason, PlanningFilterType } from '@/hooks/usePlanning';
import { Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// ─── Helpers ───────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isWeekend(year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day);
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function formatDateStr(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseDateStr(dateStr: unknown): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  // Handle Date objects, PHP date objects, or strings
  let str: string;
  if (typeof dateStr === 'object' && dateStr !== null) {
    // PHP date object: { date: "2025-03-01 00:00:00.000", timezone_type: 3, timezone: "..." }
    const obj = dateStr as Record<string, unknown>;
    if (typeof obj.date === 'string') {
      str = obj.date;
    } else {
      str = String(dateStr);
    }
  } else {
    str = String(dateStr);
  }
  const parts = str.split('T')[0].split(' ')[0].split('-');
  if (parts.length < 3) return null;
  return { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1, day: parseInt(parts[2]) };
}

/** Determine the cell state for a given employee on a given day */
type CellState = {
  type: 'empty' | 'weekend' | 'conge' | 'teletravail' | 'absence';
  halfStart?: boolean; // only PM colored (left half empty)
  halfEnd?: boolean;   // only AM colored (right half empty)
  aValider?: boolean;
};

function getCellState(
  employeeId: number,
  year: number,
  month: number,
  day: number,
  leaves: PlanningLeave[],
  reasonsMap: Map<number, LeaveReason>,
): CellState {
  if (isWeekend(year, month, day)) {
    return { type: 'weekend' };
  }

  const dateStr = formatDateStr(year, month, day);

  for (const leave of leaves) {
    if (leave.employeeId !== employeeId) continue;

    const start = parseDateStr(leave.startDate);
    const end = parseDateStr(leave.endDate);
    if (!start || !end) continue;

    const startStr = formatDateStr(start.year, start.month, start.day);
    const endStr = formatDateStr(end.year, end.month, end.day);

    if (dateStr >= startStr && dateStr <= endStr) {
      const isAValider = leave.status === 'A valider' || String(leave.status) === '0';

      // Déterminer le type via leaveReason (reason est un ID int)
      const reasonId = typeof leave.reason === 'number' ? leave.reason : parseInt(String(leave.reason), 10);
      const reason = reasonsMap.get(reasonId);
      const isTeletravail = reason?.isTeletravail || leave.type === 'Télétravail';
      const isAbsence = reason?.isAbsence || leave.type === 'Absence';
      const cellType = isTeletravail ? 'teletravail' : isAbsence ? 'absence' : 'conge';

      const isStartDay = dateStr === startStr;
      const isEndDay = dateStr === endStr;

      return {
        type: cellType,
        halfStart: isStartDay && (leave.startPeriod === 'PM' || leave.startPeriod === 'soir' || leave.startPeriod === 'après-midi'),
        halfEnd: isEndDay && (leave.endPeriod === 'AM' || leave.endPeriod === 'matin'),
        aValider: isAValider,
      };
    }
  }

  return { type: 'empty' };
}

// ─── Cell Component ────────────────────────────────────────

function PlanningCell({ state }: { state: CellState }) {
  if (state.type === 'weekend') {
    return <td className="bg-gray-100 border border-gray-200 min-w-[24px] h-6" />;
  }

  if (state.type === 'empty') {
    return <td className="border border-gray-200 min-w-[24px] h-6" />;
  }

  const bgColor =
    state.type === 'teletravail'
      ? 'bg-green-200'
      : state.type === 'absence'
        ? 'bg-red-200'
        : 'bg-red-200';

  const dashedClass = state.aValider ? 'border-dashed border-2 border-gray-500' : '';

  // Half-day support
  if (state.halfStart || state.halfEnd) {
    return (
      <td className="border border-gray-200 min-w-[24px] h-6 p-0 relative">
        <div className="flex h-full w-full">
          <div className={`w-1/2 h-full ${state.halfStart ? '' : `${bgColor} ${dashedClass}`}`} />
          <div className={`w-1/2 h-full ${state.halfEnd ? '' : `${bgColor} ${dashedClass}`}`} />
        </div>
      </td>
    );
  }

  return <td className={`${bgColor} ${dashedClass} border border-gray-200 min-w-[24px] h-6`} />;
}

// ─── Grouped Data ──────────────────────────────────────────

interface DepartmentGroup {
  department: string;
  employees: PlanningEmployee[];
}

interface CompanyGroup {
  company: string;
  departments: DepartmentGroup[];
}

function groupEmployees(employees: PlanningEmployee[]): CompanyGroup[] {
  const companyMap = new Map<string, Map<string, PlanningEmployee[]>>();

  for (const emp of employees) {
    if (!companyMap.has(emp.company)) {
      companyMap.set(emp.company, new Map());
    }
    const deptMap = companyMap.get(emp.company)!;
    if (!deptMap.has(emp.department)) {
      deptMap.set(emp.department, []);
    }
    deptMap.get(emp.department)!.push(emp);
  }

  const groups: CompanyGroup[] = [];
  for (const [company, deptMap] of companyMap) {
    const departments: DepartmentGroup[] = [];
    for (const [department, emps] of deptMap) {
      departments.push({ department, employees: emps });
    }
    groups.push({ company, departments });
  }

  return groups;
}

// ─── Page Component ────────────────────────────────────────

// N-1 offset: on affiche les données de l'année précédente pour le dev
// Passer à 0 en production
const YEAR_OFFSET = -1;

export function Planning() {
  const { user } = useAuth();
  const userEmail = user?.mail ?? user?.userPrincipalName;
  const { data: emetteur } = useAnnonceEmetteur(userEmail);

  // Mois initial = mois courant avec offset N-1
  const now = new Date();
  const initialYear = now.getFullYear() + YEAR_OFFSET;
  const initialMonth = now.getMonth();
  const minYear = initialYear;
  const minMonth = initialMonth;

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  // ─── Filter state ──────────────────────────────────────────
  const [filterType, setFilterType] = useState<PlanningFilterType>('service');
  const [filterValue, setFilterValue] = useState<string>('');
  const [defaultSet, setDefaultSet] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Charger les options de filtres
  const { data: filters, isLoading: filtersLoading } = usePlanningFilters();

  // Définir la valeur par défaut dès que emetteur est disponible
  useEffect(() => {
    if (!defaultSet && emetteur?.department) {
      setFilterValue(emetteur.department);
      setDefaultSet(true);
    }
  }, [emetteur, defaultSet]);

  const daysInMonth = getDaysInMonth(year, month);
  const startDate = formatDateStr(year, month, 1);
  const nextMonth = month + 1 === 12 ? 0 : month + 1;
  const nextYear = month + 1 === 12 ? year + 1 : year;
  const endDateFull = formatDateStr(nextYear, nextMonth, 1);

  const { data: leaves, isLoading: leavesLoading, isError: leavesError } = usePlanningLeaves(
    startDate,
    endDateFull,
    filterValue ? filterType : undefined,
    filterValue || undefined,
  );
  const { data: employees, isLoading: employeesLoading, isError: employeesError } = usePlanningEmployees(filterType, filterValue);
  const { data: reasons, isLoading: reasonsLoading } = useLeaveReasons();

  const reasonsMap = useMemo(() => {
    const map = new Map<number, LeaveReason>();
    if (reasons) {
      for (const r of reasons) map.set(r.id, r);
    }
    return map;
  }, [reasons]);

  const isLoading = leavesLoading || employeesLoading || reasonsLoading || filtersLoading;
  const isError = leavesError || employeesError;

  const companyGroups = useMemo(() => {
    if (!employees) return [];
    let filtered = employees;
    if (employeeSearch.trim()) {
      const search = employeeSearch.toLowerCase();
      filtered = employees.filter((e) =>
        `${e.lastName} ${e.firstName}`.toLowerCase().includes(search) ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search)
      );
    }
    return groupEmployees(filtered);
  }, [employees, employeeSearch]);

  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Navigation: ne peut pas reculer avant le mois initial
  const canGoPrev = year > minYear || (year === minYear && month > minMonth);

  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goPrevMonth = () => {
    if (!canGoPrev) return;
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };


  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Planning</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Conteneur principal */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6">

      <h1 className="text-4xl font-extrabold tracking-tight">Planning des absences</h1>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Voir le planning des congés</p>
          <div className="grid grid-cols-3 gap-3">
            {/* Service */}
            <div className="space-y-1">
              <Label className={`text-xs font-semibold uppercase tracking-wide ${filterType === 'service' ? 'text-primary' : 'text-muted-foreground'}`}>
                Service
              </Label>
              <div className="border rounded-md h-36 overflow-y-auto text-sm">
                {filters?.departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => { setFilterType('service'); setFilterValue(dept); }}
                    className={`block w-full text-left px-2 py-1 truncate transition-colors ${
                      filterType === 'service' && filterValue === dept
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
            {/* Société */}
            <div className="space-y-1">
              <Label className={`text-xs font-semibold uppercase tracking-wide ${filterType === 'societe' ? 'text-primary' : 'text-muted-foreground'}`}>
                Société
              </Label>
              <div className="border rounded-md h-36 overflow-y-auto text-sm">
                {filters?.companies.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setFilterType('societe'); setFilterValue(String(c.id)); }}
                    className={`block w-full text-left px-2 py-1 truncate transition-colors ${
                      filterType === 'societe' && filterValue === String(c.id)
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Lieu */}
            <div className="space-y-1">
              <Label className={`text-xs font-semibold uppercase tracking-wide ${filterType === 'lieu' ? 'text-primary' : 'text-muted-foreground'}`}>
                Lieu
              </Label>
              <div className="border rounded-md h-36 overflow-y-auto text-sm">
                {filters?.places.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setFilterType('lieu'); setFilterValue(String(p.id)); }}
                    className={`block w-full text-left px-2 py-1 truncate transition-colors ${
                      filterType === 'lieu' && filterValue === String(p.id)
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month Navigation + Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goPrevMonth}
            disabled={!canGoPrev}
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold capitalize min-w-[200px] text-center">
            {formatMonthYear(year, month)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goNextMonth}
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un employé..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-[200px] w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Chargement du planning...</span>
        </div>
      ) : isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive-foreground">
          <p className="font-semibold">Impossible de charger le planning.</p>
          <p className="text-sm opacity-80">Une erreur est survenue lors du chargement des données.</p>
        </div>
      ) : !filterValue ? (
        <div className="rounded-md border border-muted bg-muted/30 p-6 text-center text-muted-foreground">
          <p>Veuillez sélectionner un filtre pour afficher le planning.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr className="bg-muted">
                <th className="sticky left-0 bg-muted z-10 text-left px-2 py-1 border border-gray-200 min-w-[180px] whitespace-nowrap">
                  Collaborateur
                </th>
                {dayNumbers.map((day) => {
                  const weekend = isWeekend(year, month, day);
                  return (
                    <th
                      key={day}
                      className={`text-center px-0 py-1 border border-gray-200 min-w-[24px] font-medium ${
                        weekend ? 'bg-gray-200 text-gray-500' : ''
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {companyGroups.map((group) => (
                <>
                  {/* Company header */}
                  <tr key={`company-${group.company}`} className="bg-gray-50">
                    <td
                      colSpan={daysInMonth + 1}
                      className="px-2 py-1 font-bold text-sm border border-gray-200"
                    >
                      {group.company}
                    </td>
                  </tr>

                  {group.departments.map((dept) => (
                    <>
                      {/* Department header */}
                      <tr key={`dept-${group.company}-${dept.department}`} className="bg-gray-50/50">
                        <td
                          colSpan={daysInMonth + 1}
                          className="px-4 py-0.5 italic text-xs text-muted-foreground border border-gray-200"
                        >
                          {dept.department}
                        </td>
                      </tr>

                      {/* Employee rows */}
                      {dept.employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-muted/30">
                          <td className="sticky left-0 bg-white z-10 px-2 py-0.5 border border-gray-200 whitespace-nowrap font-medium">
                            {emp.lastName} {emp.firstName}
                          </td>
                          {dayNumbers.map((day) => {
                            const state = getCellState(emp.id, year, month, day, leaves ?? [], reasonsMap);
                            return <PlanningCell key={day} state={state} />;
                          })}
                        </tr>
                      ))}
                    </>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm" />
          <span>Férié / Weekend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 bg-gray-400 border border-gray-500 rounded-sm" />
          <span>Fermeture</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 bg-red-200 border border-gray-300 rounded-sm" />
          <span>Absence / Congé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 bg-green-200 border border-gray-300 rounded-sm" />
          <span>Télétravail</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 bg-white border-2 border-dashed border-gray-500 rounded-sm" />
          <span>A valider</span>
        </div>
      </div>

      </div>{/* fin conteneur principal */}
    </div>
  );
}

export default Planning;
