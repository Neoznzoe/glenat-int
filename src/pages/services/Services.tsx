import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import QuickAccess, { type QuickAccessItem } from '@/components/QuickAccess';
import LinksCard from '@/components/LinksCard';
import { SecureLink } from '@/components/routing/SecureLink';
import {
  fetchServiceAreaBySlug,
  fetchServiceQuickAccess,
  type ServiceArea,
} from '@/api/services';

export function Services() {
  const [quickLinks, setQuickLinks] = useState<QuickAccessItem[]>([]);
  const [serviceArea, setServiceArea] = useState<ServiceArea | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetchServiceQuickAccess(),
      fetchServiceAreaBySlug('informatique'),
    ])
      .then(([quickAccess, area]) => {
        if (!active) {
          return;
        }
        setQuickLinks(quickAccess);
        setServiceArea(area);
      })
      .catch((error) => {
        console.error('Impossible de récupérer les données de services', error);
      });

    return () => {
      active = false;
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
              <SecureLink to="/services">Services</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Informatique</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="rounded-xl border text-card-foreground shadow bg-card">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
          <CardTitle className="text-[2.5rem]">Services</CardTitle>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xl font-semibold">Interventions en cours (0)</div>
            <Button>Nouvelle demande d'intervention</Button>
          </div>
          <Separator />
          <div className="pt-2 flex flex-col md:flex-row gap-6">
            <QuickAccess items={quickLinks} active="Informatique" />
            <div className="flex-1">
              <h3 className="mb-4 font-semibold text-xl">Informatique</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {serviceArea?.cards.map((card) => (
                  <LinksCard key={card.title} title={card.title} links={card.links} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Services;

