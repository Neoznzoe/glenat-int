import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, Loader2, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchWithOAuth } from '@/lib/oauth';
import { searchDocuments, getDocFileUrl, getExtensionColor, type DocSearchResult } from '@/lib/docsApi';

interface TopbarSearchInputProps {
  scope: 'qui-fait-quoi' | 'glenatdoc';
}

// ─── Types ────────────────────────────────────────────

interface EmployeeResult {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  company: string;
  email: string;
  photo?: string;
}

type SearchResult =
  | { type: 'employee'; data: EmployeeResult }
  | { type: 'document'; data: DocSearchResult };

// ─── Employee photo URL ───────────────────────────────

const PHOTO_BASE_URL = 'https://intranet.glenat.com/images/photos';

function getEmployeePhotoUrl(photo?: string): string | undefined {
  if (!photo || photo.trim() === '') return undefined;
  const name = photo.trim();
  return name.includes('.jpg') ? `${PHOTO_BASE_URL}/${name}` : `${PHOTO_BASE_URL}/${name}.jpg`;
}

// ─── Extension icon colors ────────────────────────────

function getExtIcon(ext: string): { label: string; color: string } {
  const e = (ext || '').toLowerCase().replace('.', '');
  return { label: e.toUpperCase() || 'DOC', color: getExtensionColor(ext) };
}

// ─── QFQ search ───────────────────────────────────────

const PLANNING_URL = import.meta.env.DEV
  ? '/Api/v2.0/planning'
  : 'https://api-dev.groupe-glenat.com/Api/v2.0/planning';

let employeeCache: EmployeeResult[] | null = null;

async function loadEmployees(): Promise<EmployeeResult[]> {
  if (employeeCache) return employeeCache;
  try {
    const response = await fetchWithOAuth(`${PLANNING_URL}/employees`);
    if (response.ok) {
      const data = (await response.json()) as { result?: EmployeeResult[] };
      employeeCache = data.result ?? [];
      return employeeCache;
    }
  } catch {
    // silent
  }
  return [];
}

function searchEmployees(employees: EmployeeResult[], query: string): EmployeeResult[] {
  const q = query.toLowerCase();
  return employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      `${e.lastName} ${e.firstName}`.toLowerCase().includes(q) ||
      (e.department && e.department.toLowerCase().includes(q)) ||
      (e.company && e.company.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)),
  );
}

// ─── Component ────────────────────────────────────────

export function TopbarSearchInput({ scope }: TopbarSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [employees, setEmployees] = useState<EmployeeResult[]>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Preload employees for QFQ
  useEffect(() => {
    if (scope === 'qui-fait-quoi') {
      void loadEmployees().then(setEmployees);
    }
  }, [scope]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search
  const doSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        if (scope === 'qui-fait-quoi') {
          const emps = employees.length > 0 ? employees : await loadEmployees();
          const matches = searchEmployees(emps, q);
          setResults(matches.map((data) => ({ type: 'employee' as const, data })));
          setShowResults(matches.length > 0);
        } else {
          const docs = await searchDocuments(q);
          setResults(docs.map((data) => ({ type: 'document' as const, data })));
          setShowResults(docs.length > 0);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
        setSelectedIndex(-1);
      }
    },
    [scope, employees],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => void doSearch(query), 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'employee') {
      navigate(`/qui-fait-quoi/employe?id=${result.data.id}`);
      setQuery('');
      setResults([]);
      setShowResults(false);
    } else {
      // Document: ouvrir le fichier
      const doc = result.data;
      const url = getDocFileUrl(doc.file, doc.extension, doc.rub1Name, doc.rub2Name, doc.version);
      if (url) {
        const ext = (doc.extension || '').toLowerCase().replace('.', '');
        if (ext === 'pdf') {
          // PDF: ouvrir dans un nouvel onglet
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          // Autres: télécharger
          const link = document.createElement('a');
          link.href = url;
          link.download = `${doc.title}.${ext}`;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      setQuery('');
      setResults([]);
      setShowResults(false);
    }
  };

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    try {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
      return (
        <>
          {parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <strong key={i} className="font-semibold text-foreground">{part}</strong>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </>
      );
    } catch {
      return text;
    }
  };

  const placeholder =
    scope === 'qui-fait-quoi'
      ? 'Rechercher dans Qui fait quoi'
      : "Rechercher dans Glénat'doc";

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-9 pr-9 bg-muted border-input focus:bg-background rounded-r-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full min-w-[360px] rounded-md border bg-popover shadow-lg">
          <div className="max-h-[350px] overflow-y-auto p-1">
            {results.map((result, index) => (
              <button
                key={result.type === 'employee' ? `e-${result.data.id}` : `d-${result.data.id}`}
                onClick={() => handleSelect(result)}
                className={`w-full text-left px-3 py-2 rounded-sm transition-colors ${
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {result.type === 'employee' ? (
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={getEmployeePhotoUrl(result.data.photo)} alt={`${result.data.firstName} ${result.data.lastName}`} />
                      <AvatarFallback className="text-[10px] bg-muted">
                        {result.data.firstName.charAt(0)}{result.data.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">
                        {highlightMatch(`${result.data.firstName} ${result.data.lastName}`)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {[result.data.department, result.data.company].filter(Boolean).join(' • ')}
                        {result.data.email && ` • ${result.data.email}`}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    {/* Extension badge */}
                    <div
                      className="h-8 w-8 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${getExtIcon(result.data.extension).color}15` }}
                    >
                      <FileText className="h-4 w-4" style={{ color: getExtIcon(result.data.extension).color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {highlightMatch(result.data.title)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        <span
                          className="font-mono font-semibold mr-1"
                          style={{ color: getExtIcon(result.data.extension).color }}
                        >
                          {getExtIcon(result.data.extension).label}
                        </span>
                        {[result.data.rub1Name, result.data.rub2Name].filter(Boolean).join(' / ')}
                      </div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg p-3">
          <p className="text-sm text-muted-foreground text-center">Aucun résultat pour « {query} »</p>
        </div>
      )}
    </div>
  );
}
