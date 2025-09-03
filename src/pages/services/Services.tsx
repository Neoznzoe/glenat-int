import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import QuickAccess, { QuickAccessItem } from '@/components/QuickAccess';
import LinksCard, { LinkItem } from '@/components/LinksCard';
import { Monitor, Package } from 'lucide-react';
import { useState } from 'react';

export function Services() {
  const [active, setActive] = useState('Informatique');

  const quickLinks: QuickAccessItem[] = [
    { label: 'Informatique', icon: Monitor, onClick: () => setActive('Informatique') },
    { label: 'Production', icon: Package, onClick: () => setActive('Production') },
  ];

  const cards: { title: string; links: LinkItem[] }[] = [
    {
      title: 'G\u00e9n\u00e9ral',
      links: [
        { label: 'Documentation, notices, proc\u00e9dures', href: '#' },
        { label: 'Formulaire de demande', href: '#' },
        { label: 'Informations', href: '#' },
      ],
    },
    {
      title: 'Division',
      links: [
        { label: 'Documentation, notices, proc\u00e9dures', href: '#' },
        { label: 'Formulaire de demande', href: '#' },
        { label: 'Informations', href: '#' },
      ],
    },
    {
      title: 'Nautilus',
      links: [
        { label: 'Documentation, notices, proc\u00e9dures', href: '#' },
        { label: 'Formulaire de demande', href: '#' },
        { label: 'Demande d\'acc\u00e8s', href: '#' },
      ],
    },
    {
      title: 'Mat\u00e9riel, R\u00e9seaux et Acc\u00e8s Internet',
      links: [
        { label: 'Documentation, notices, proc\u00e9dures', href: '#' },
        { label: 'Formulaire de demande', href: '#' },
        { label: 'Documents', href: '#' },
      ],
    },
    {
      title: 'Site Internet et Intranet',
      links: [
        { label: 'Documentation, notices, proc\u00e9dures', href: '#' },
        { label: 'Formulaire de demande', href: '#' },
        { label: 'Informations', href: '#' },
      ],
    },
    {
      title: 'Mobilit\u00e9s',
      links: [
        { label: 'Documentation, notices, proc\u00e9dures', href: '#' },
        { label: 'Formulaire de demande', href: '#' },
        { label: 'Demande de d\u00e9placement', href: '#' },
      ],
    },
    {
      title: 'Bureautique',
      links: [
        { label: 'Documentation, notices, proc\u00e9dures', href: '#' },
        { label: 'Formulaire de demande', href: '#' },
        { label: 'Documents', href: '#' },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={() => setActive('Informatique')}>
              Services
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{active}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Services</CardTitle>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xl font-semibold">Interventions en cours (0)</div>
            <Button>Nouvelle demande d'intervention</Button>
          </div>
          <Separator />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <QuickAccess items={quickLinks} active={active} />
            <div className="lg:col-span-3">
              <h3 className="mb-4 font-semibold text-xl">{active}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
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

