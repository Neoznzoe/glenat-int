import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CatalogueLayout from './CatalogueLayout';
import BookFilters from '@/components/BookFilters';
import BookCard from '@/components/BookCard';
import { useEffect, useState } from 'react';
import { SecureLink } from '@/components/routing/SecureLink';
import { fetchCatalogueBooks, type CatalogueBook } from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

export function CatalogueAll() {
  useScrollRestoration();
  const filters = [
    'Toutes',
    'BD',
    'Manga',
    'Jeunesse',
    'Découverte',
    'Livres',
    'Voyage',
    'Montagne',
  ];

  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [books, setBooks] = useState<CatalogueBook[] | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchCatalogueBooks()
      .then(data => {
        if (isActive) {
          setBooks(data);
        }
      })
      .catch(error => {
        console.error('Impossible de récupérer le catalogue', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

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
              <SecureLink to="/catalogue">Catalogue</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tout le catalogue</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardHeader>
        <div className="px-6 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            {filters.map(filter => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="whitespace-nowrap"
              >
                {filter}
              </Button>
            ))}
            <BookFilters />
          </div>
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout active="Tout le catalogue">
            <h3 className="mb-4 font-semibold text-xl">Tout le catalogue</h3>
            {books && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {books.map(book => (
                  <BookCard key={book.ean} {...book} />
                ))}
              </div>
            )}
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default CatalogueAll;
