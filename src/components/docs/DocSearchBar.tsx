import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { DocFileIcon } from '@/components/docs/DocFileIcon';
import { useSearchDocuments } from '@/hooks/useDocs';
import { getDocFileUrl } from '@/lib/docsApi';

interface DocSearchBarProps {
  rub1Id?: number;
}

export function DocSearchBar({ rub1Id }: DocSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery.trim(), 300);
  const { data: results, isLoading } = useSearchDocuments(debouncedQuery, rub1Id);

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
    <div ref={searchRef} className="relative w-96">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un document..."
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

      {showResults && debouncedQuery.length >= 2 && (
        <div className="absolute z-50 top-full mt-1 w-96 right-0 bg-card border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Recherche...
            </div>
          )}

          {!isLoading && results && results.length > 0 && results.map((doc) => {
            const fileUrl = getDocFileUrl(doc.file, doc.extension, doc.rub1Name, doc.rub2Name, doc.version);
            return (
              <a
                key={doc.id}
                href={fileUrl ?? '#'}
                target={fileUrl ? '_blank' : undefined}
                rel={fileUrl ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 hover:bg-muted/50"
                onClick={() => setShowResults(false)}
              >
                <div className="shrink-0">
                  <DocFileIcon extension={doc.extension} size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{doc.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {doc.rub1Name}{doc.rub2Name ? ` / ${doc.rub2Name}` : ''}
                  </div>
                </div>
              </a>
            );
          })}

          {!isLoading && results && results.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              Aucun résultat
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
