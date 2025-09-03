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
      title: 'Général',
      links: [
        { label: 'Documentations, notices, procédures', type: 'header' },
        { label: 'Informatique / charte informatique', type: 'text', separator: false },
        { label: 'Charte informatique', href: '#', type: 'link', separator: true },
      ],
    },
    {
      title: 'Matériel, réseaux et accès internet',
      links: [
        { label: 'Formulaire de demande', type: 'header' },
        { label: 'Informatique / charte informatique', type: 'text', separator: true },
        { label: 'Demande investissement', href: '#', type: 'link', separator: false },
        { label: 'Demande interventions', href: '#', type: 'link', separator: false },
      ],
    },
    {
      title: 'Site internet et intranet',
      links: [
        { label: 'Contact utile', type: 'header' },
        { label: 'Matthieu Nicolas', type: 'text', separator: false },
        { label: 'Documentations, notices, procédures', type: 'header', separator: true },
        { label: 'Informatique/internet', type: 'text', separator: false },
        { label: 'Site internet - mentions obligatoires', href: '#', type: 'link', separator: false },
        { label: 'Mailnblack - connexion compte Office 365', href: '#', type: 'link', separator: false },
        { label: 'Formulaire de demande', type: 'header', separator: true },
        { label: "Demande d'interventions informatique", href: '#', type: 'link', separator: false },
      ],
    },
    {
      title: 'Nautilus',
      links: [
        { label: 'Contact utiles', type: 'header' },
        { label: 'Catherine Jullin', type: 'text', separator: false },
        { label: 'Documentations, notices, procédures', type: 'header', separator: true },
        { label: 'Procédures internes / note de frais', type: 'text', separator: false },
        { label: 'Procédure de commandes voyages', href: '#', type: 'link', separator: false },
        { label: 'Horaires TGV 2025', href: '#', type: 'link', separator: false },
        { label: 'Manuel utilisateurs Notilus', href: '#', type: 'link', separator: false },
        { label: 'Place de déplacement multimodal', href: '#', type: 'link', separator: false },
        { label: 'Note de demande déplacement professionnel', href: '#', type: 'link', separator: false },
        { label: 'Notilus 2022 - Manuel utilisateurs', href: '#', type: 'link', separator: false },
        { label: 'Notilus 2022 - procédures simplifiée', href: '#', type: 'link', separator: false },
      ],
    },
    {
      title: 'Mobilités',
      links: [
        { label: 'Documentations, notices, procédures', type: 'header' },
        { label: 'Informatique / mobilités', type: 'text', separator: false },
        {
          label: 'Comment désactiver le mode push de son iPhone',
          href: '#',
          type: 'link',
          separator: true,
        },
        {
          label: 'Les sites internets glénat sur mobile',
          href: '#',
          type: 'link',
          separator: false,
        },
        {
          label: "Recevoir une alerte glénat'matin sur son iPhone",
          href: '#',
          type: 'link',
          separator: false,
        },
        { label: 'Formulaire de demande', type: 'header', separator: true },
        { label: "Demande d'interventions informatique", href: '#', type: 'link', separator: false },
      ],
    },
    {
      title: 'Bureautique',
      links: [
        { label: 'Documentations, notices, procédures', type: 'header' },
        { label: 'Informatique / Charte informatique', type: 'text', separator: false },
        {
          label: 'Se connecter aux calendriers partagés',
          href: '#',
          type: 'link',
          separator: true,
        },
        { label: "Documentation Glénat'Fée", href: '#', type: 'link', separator: false },
        {
          label: 'Réservation salle de reunion',
          href: '#',
          type: 'link',
          separator: false,
        },
        { label: 'Gestion absence via OWA', href: '#', type: 'link', separator: false },
        { label: 'Publipostage', href: '#', type: 'link', separator: false },
        {
          label: 'Outlook 2011 mac Calendrier  partagé',
          href: '#',
          type: 'link',
          separator: false,
        },
        {
          label: 'Office 365 OWA Calendrier partagé',
          href: '#',
          type: 'link',
          separator: false,
        },
        { label: 'Présentation de intranet', href: '#', type: 'link', separator: false },
        { label: 'Présentation du réseau Informatique', href: '#', type: 'link', separator: false },
        {
          label: 'Howto - Visio - Réservation d’une salle',
          href: '#',
          type: 'link',
          separator: false,
        },
        {
          label: 'Demande de disponibilité dans outlook',
          href: '#',
          type: 'link',
          separator: false,
        },
        { label: 'Procédures internes / note de frais', type: 'header', separator: true },
        { label: 'Manuel utilisateurs Notilus', href: '#', type: 'link', separator: false },
        {
          label: 'Plan de déplacements multimodal',
          href: '#',
          type: 'link',
          separator: false,
        },
        { label: 'Note demande de déplacement', href: '#', type: 'link', separator: false },
        { label: 'Conditions relatives aux frais', href: '#', type: 'link', separator: false },
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
          <div className="pt-2 grid grid-cols-1 md:grid-cols-5 gap-6">
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

