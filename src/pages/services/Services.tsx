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
        { label: 'Contacts utiles', href: '#', external: true },
        { label: 'Documentations, notices, proc\u00e9dures', href: '#', highlight: true },
        { label: 'Demande de carte d\'identit\u00e9', href: '#' },
        { label: 'Catalogue / Charte informatique', href: '#', external: true },
      ],
    },
    {
      title: 'Davision',
      links: [
        { label: 'Contacts utiles', href: '#', external: true },
        { label: 'Manuel Notilus 2', href: '#', external: true },
        { label: 'Proc\u00e9dures de gestion de BO', href: '#', highlight: true },
        { label: 'Formulaire de demande', href: '#' },
      ],
    },
    {
      title: 'Nautilus',
      links: [
        { label: 'Contacts utiles', href: '#', external: true },
        { label: 'Documentation', href: '#', highlight: true },
        { label: 'Proc\u00e9dure de d\u00e9placement (OD 3)', href: '#', external: true },
        { label: 'Demande d\'acc\u00e8s', href: '#' },
      ],
    },
    {
      title: 'Mat\u00e9riel, R\u00e9seaux et Acc\u00e8s internet',
      links: [
        { label: 'Contacts utiles', href: '#', external: true },
        { label: 'Documentations, notices, proc\u00e9dures', href: '#', highlight: true },
        { label: 'Demande de mat\u00e9riel', href: '#', external: true },
        { label: 'Demande d\'intervention informatique', href: '#', highlight: true },
      ],
    },
    {
      title: 'Site internet et intranet',
      links: [
        { label: 'Contacts utiles', href: '#', external: true },
        { label: 'Documentations, notices, proc\u00e9dures', href: '#', highlight: true },
        { label: "Site internet - mentions obligatoires", href: '#', external: true },
        { label: 'Demande de modification intranet', href: '#', highlight: true },
      ],
    },
    {
      title: 'Mobilit\u00e9s',
      links: [
        { label: 'Contacts utiles', href: '#', external: true },
        { label: 'Documentations, notices, proc\u00e9dures', href: '#', highlight: true },
        { label: "Manuel d'utilisation de l'appli Push Non Stop", href: '#', external: true },
        { label: 'Proc\u00e9dure de d\u00e9placement sur mobile', href: '#', highlight: true },
      ],
    },
    {
      title: 'Bureautique',
      links: [
        { label: 'Outlook 365 (adresse mail)', href: '#', external: true },
        { label: 'OneDrive (espace partag\u00e9)', href: '#', external: true },
        { label: 'Office 365 - outils de partage', href: '#', highlight: true },
        { label: 'Notilus 2022 - proc\u00e9dure', href: '#', external: true },
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <QuickAccess items={quickLinks} active={active} />
            <div className="md:col-span-4">
              <h3 className="mb-4 font-semibold text-xl">{active}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

