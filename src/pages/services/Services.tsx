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
        {
          label: 'Documentations, notices, proc\u00e9dures',
          type: 'header',
        },
        { label: 'informatique / charte informatique', type: 'text', separator: false },
        { label: 'charte informatique', href: '#', type: 'link', separator: true },
      ],
    },
    {
      title: 'Mat\u00e9riel, r\u00e9seaux et acc\u00e8s internet',
      links: [
        { label: 'Formulaire de demande', type: 'header' },
        {
          label: 'informatique / charte informatique',
          type: 'text',
          separator: true,
        },
        { label: 'demande investissement', href: '#', type: 'link', separator: false },
        { label: 'demande interventions', href: '#', type: 'link', separator: false },
      ],
    },
    {
      title: 'Site internet et intranet',
      links: [
        { label: 'contact utile', type: 'header' },
        { label: 'Matthieu Nicolas', type: 'text', separator: false },
        {
          label: 'documentations, notices, proc\u00e9dures',
          type: 'header',
          separator: true,
        },
        { label: 'informatique/internet', type: 'text', separator: false },
        {
          label: 'site internet - mentions obligatoires',
          href: '#',
          type: 'link',
          separator: false,
        },
        {
          label: 'mailnblack - connexion compte office 365',
          href: '#',
          type: 'link',
          separator: false,
        },
        { label: 'formulaire de demande', type: 'header', separator: true },
        {
          label: "demande d'interventions informatique",
          href: '#',
          type: 'link',
          separator: false,
        },
      ],
    },
    {
      title: 'Nautilus',
      links: [
        { label: 'contact utiles', type: 'header' },
        { label: 'catherine jullin', type: 'text', separator: false },
        {
          label: 'documentations, notices, proc\u00e9dures',
          type: 'header',
          separator: true,
        },
        { label: 'proc\u00e9dures internes / note de frais', type: 'text', separator: false },
        {
          label: 'proc\u00e9dure de commandes voyages',
          href: '#',
          type: 'link',
          separator: false,
        },
        { label: 'horaires tgv 2025', href: '#', type: 'link', separator: false },
        { label: 'manuel utilisateurs notilus', href: '#', type: 'link', separator: false },
        { label: 'place de d\u00e9placement multimodal', href: '#', type: 'link', separator: false },
        {
          label: 'note de demande d\u00e9placement professionnel',
          href: '#',
          type: 'link',
          separator: false,
        },
        {
          label: 'Notilus 2022 - Manuel utilisateurs',
          href: '#',
          type: 'link',
          separator: false,
        },
        {
          label: 'Notilus 2022 - proc\u00e9dures simplifi\u00e9e',
          href: '#',
          type: 'link',
          separator: false,
        },
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

