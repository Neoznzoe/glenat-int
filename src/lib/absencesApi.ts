import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

export interface KelioAbsence {
  absenceFileKey: string;
  absenceTypeAbbreviation: string;
  absenceTypeDescription: string;
  absenceTypeKey: string;
  comment: string;
  creationDate: string;
  durationInDays: string;
  durationInHours: string;
  durationInPercent: string | null;
  endDate: string;
  endingTheAfternoon: string;
  eventObservingDate: string | null;
  existRelatedDocument: string;
  firstEndTime: string | null;
  firstEndTimePosition: string | null;
  firstStartTime: string | null;
  firstStartTimePosition: string | null;
  fromClockings: string;
  initialNoticeCessationWorkDate: string | null;
  lastModificationDate: string;
  lastWorkingDayDate: string | null;
  limitedToAPeriod: string;
  noticeCessationWorkExtension: string | null;
  numberOfAbsenceDays: string | null;
  prescribedEndDate: string | null;
  repetitiveAbsencePeriod: string;
  resumptionWorkDate: string | null;
  resumptionWorkEarlyDate: string | null;
  secondEndTime: string | null;
  secondEndTimePosition: string | null;
  secondStartTime: string | null;
  secondStartTimePosition: string | null;
  splitHolidaysWaiver: string;
  startDate: string;
  startInTheMorning: string;
  totalInDays: string;
  totalInHours: string;
  archivedEmployee: string;
  employeeBadgeCode: string | null;
  employeeFirstName: string;
  employeeIdentificationCode: string | null;
  employeeIdentificationNumber: string;
  employeeKey: string;
  employeeSurname: string;
  errorMessage: string | null;
  technicalString: string | null;
}

export interface AbsencesResponse {
  success: boolean;
  code: number;
  message: string;
  population: string;
  start_offset: number;
  end_offset: number;
  count: number;
  absences: KelioAbsence[];
}

export interface AbsentPerson {
  name: string;
  email: string;
  retour: string;
  [key: string]: string;
}

export interface KelioRemoteWorking {
  comment: string;
  endingTheAfternoon: string;
  remoteWorkingFileKey: string;
  remoteWorkingTypeAbbreviation: string;
  remoteWorkingTypeDescription: string;
  remoteWorkingTypeKey: string;
  startDate: string;
  startInTheMorning: string;
  archivedEmployee: string;
  employeeBadgeCode: string | null;
  employeeFirstName: string;
  employeeIdentificationCode: string | null;
  employeeIdentificationNumber: string;
  employeeKey: string;
  employeeSurname: string;
  errorMessage: string | null;
  technicalString: string | null;
}

export interface RemoteWorkingResponse {
  success: boolean;
  code: number;
  message: string;
  population: string;
  start_date: string | null;
  end_date: string | null;
  count: number;
  remote_workings: KelioRemoteWorking[];
}

export interface RemoteWorkingPerson {
  name: string;
  email: string;
  [key: string]: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage || 'Une erreur est survenue');
  }
  return (await response.json()) as T;
}

/**
 * Récupère les absences depuis l'API Kelio
 */
export async function fetchAbsences(): Promise<KelioAbsence[]> {
  const url = `${API_BASE_URL}/Api/v2.0/Kelio/absences`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<AbsencesResponse>(response);

  return data.absences || [];
}

/**
 * Filtre les absences pour ne retourner que celles du jour actuel
 */
function filterTodayAbsences(absences: KelioAbsence[]): KelioAbsence[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('Filtering absences for today:', today.toLocaleDateString('fr-FR'));
  console.log('Total absences received:', absences.length);

  const filtered = absences.filter(absence => {
    const startDate = new Date(absence.startDate);
    const endDate = new Date(absence.endDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const isToday = today >= startDate && today <= endDate;

    if (isToday) {
      console.log('Absence today:', {
        employee: `${absence.employeeFirstName} ${absence.employeeSurname}`,
        startDate: startDate.toLocaleDateString('fr-FR'),
        endDate: endDate.toLocaleDateString('fr-FR')
      });
    }

    return isToday;
  });

  console.log('Filtered absences for today:', filtered.length);
  return filtered;
}

/**
 * Calcule la date de retour prévue (le jour après la fin de l'absence)
 */
function calculateReturnDate(absence: KelioAbsence): string {
  // Si resumptionWorkDate est disponible, on l'utilise
  if (absence.resumptionWorkDate) {
    const returnDate = new Date(absence.resumptionWorkDate);
    return returnDate.toLocaleDateString('fr-FR');
  }

  // Sinon, on prend le jour après endDate
  const endDate = new Date(absence.endDate);
  const returnDate = new Date(endDate);
  returnDate.setDate(returnDate.getDate() + 1);

  return returnDate.toLocaleDateString('fr-FR');
}

/**
 * Transforme une absence Kelio en objet AbsentPerson pour l'affichage
 */
function transformAbsenceToAbsentPerson(absence: KelioAbsence): AbsentPerson {
  const name = `${absence.employeeFirstName} ${absence.employeeSurname}`;
  const retour = calculateReturnDate(absence);

  return {
    name,
    email: 'Pas d\'information',
    retour,
  };
}

/**
 * Récupère les absences du jour et les transforme pour l'affichage
 */
export async function fetchTodayAbsences(): Promise<AbsentPerson[]> {
  console.log('=== fetchTodayAbsences START ===');
  const allAbsences = await fetchAbsences();
  console.log('All absences fetched:', allAbsences.length);

  const todayAbsences = filterTodayAbsences(allAbsences);
  console.log('Today absences after filter:', todayAbsences.length);

  const transformed = todayAbsences.map(transformAbsenceToAbsentPerson);
  console.log('Transformed absences:', transformed);
  console.log('=== fetchTodayAbsences END ===');

  return transformed;
}

// ============================================================================
// REMOTE WORKING (TÉLÉTRAVAIL)
// ============================================================================

/**
 * Récupère les télétravaux depuis l'API Kelio
 */
export async function fetchRemoteWorking(): Promise<KelioRemoteWorking[]> {
  const url = `${API_BASE_URL}/Api/v2.0/Kelio/remoteWorking`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await handleResponse<RemoteWorkingResponse>(response);

  return data.remote_workings || [];
}

/**
 * Filtre les télétravaux pour ne retourner que ceux du jour actuel
 */
function filterTodayRemoteWorking(remoteWorkings: KelioRemoteWorking[]): KelioRemoteWorking[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('Filtering remote working for today:', today.toLocaleDateString('fr-FR'));
  console.log('Total remote working received:', remoteWorkings.length);

  const filtered = remoteWorkings.filter(rw => {
    const startDate = new Date(rw.startDate);
    startDate.setHours(0, 0, 0, 0);

    const isToday = startDate.getTime() === today.getTime();

    if (isToday) {
      console.log('Remote working today:', {
        employee: `${rw.employeeFirstName} ${rw.employeeSurname}`,
        startDate: startDate.toLocaleDateString('fr-FR')
      });
    }

    return isToday;
  });

  console.log('Filtered remote working for today:', filtered.length);
  return filtered;
}

/**
 * Transforme un télétravail Kelio en objet RemoteWorkingPerson pour l'affichage
 */
function transformRemoteWorkingToPerson(rw: KelioRemoteWorking): RemoteWorkingPerson {
  const name = `${rw.employeeFirstName} ${rw.employeeSurname}`;

  return {
    name,
    email: 'Pas d\'information',
  };
}

/**
 * Récupère les télétravaux du jour et les transforme pour l'affichage
 */
export async function fetchTodayRemoteWorking(): Promise<RemoteWorkingPerson[]> {
  console.log('=== fetchTodayRemoteWorking START ===');
  const allRemoteWorking = await fetchRemoteWorking();
  console.log('All remote working fetched:', allRemoteWorking.length);

  const todayRemoteWorking = filterTodayRemoteWorking(allRemoteWorking);
  console.log('Today remote working after filter:', todayRemoteWorking.length);

  const transformed = todayRemoteWorking.map(transformRemoteWorkingToPerson);
  console.log('Transformed remote working:', transformed);
  console.log('=== fetchTodayRemoteWorking END ===');

  return transformed;
}
