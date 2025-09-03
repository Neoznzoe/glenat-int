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

interface ProductionProps {
  onViewInformatique: () => void;
}

export function Production({ onViewInformatique }: ProductionProps) {
  const quickLinks: QuickAccessItem[] = [
    { label: 'Informatique', icon: Monitor, onClick: onViewInformatique },
    { label: 'Production', icon: Package },
  ];

  const cards: { title: string; links: LinkItem[] }[] = [
    {
      title: 'Achats',
      links: [
        { label: 'Contacts utiles', type: 'header' },
        { label: 'Isabelle Follier', href: '#', type: 'link' },
        { label: 'Nicolas Rouher', href: '#', type: 'link' },
        { label: 'Formulaires de demande', type: 'header' },
        { label: 'Demande de devis de fabrication', href: '#', type: 'link' },
      ],
    },
    {
      title: 'Atelier',
      links: [
        { label: 'Contacts utiles', type: 'header' },
        { label: 'Damien Bonis', href: '#', type: 'link' },
        { label: 'Sabine Gisolo', href: '#', type: 'link' },
        { label: 'Documentations, notices, procédures', type: 'header', separator: true },
        { label: 'Production / lexique', type: 'text' },
        { label: 'Lexique technique prépresse, imprimerie v1', href: '#', type: 'link' },
        { label: 'Lexique Fabrication Français-Anglais v1', href: '#', type: 'link' },
        { label: 'Cahier des charges Lettrage - GLP', href: '#', type: 'link', separator: true },
        { label: 'Cahier des charges Word - Maquette Livre', href: '#', type: 'link' },
        { label: 'Gestion des profils ICC_interne Glénat', href: '#', type: 'link' },
        {
          label: 'Réglages des profils ICC_Auteurs-Dessinateurs-Coloristes',
          href: '#',
          type: 'link',
        },
        { label: 'Cahier des charges Exterieur PDF - GLP', href: '#', type: 'link' },
        { label: 'Cahier des charges extérieur NATIFS 2020', href: '#', type: 'link' },
        { label: 'Fin de prise en charge des polices Postscript', href: '#', type: 'link' },
        { label: 'Formulaires de demande', type: 'header', separator: true },
        { label: 'Demande de PDF', href: '#', type: 'link' },
        { label: "Demande d'image", href: '#', type: 'link' },
        { label: 'Demande de Natif (Xpress/Indesign)', href: '#', type: 'link' },
        { label: 'Demande de flipbook', href: '#', type: 'link' },
      ],
    },
    {
      title: 'Mac',
      links: [
        { label: 'Contacts utiles', type: 'header' },
        { label: 'Damien Bonis', href: '#', type: 'link' },
        { label: 'Documentations, notices, procédures', type: 'header', separator: true },
        { label: 'Production / Mac', type: 'text' },
        {
          label: 'Centre de gestion des logiciels-utilisateurs Mac',
          href: '#',
          type: 'link',
        },
        { label: 'Formulaires de demande', type: 'header', separator: true },
        { label: "Demande d'interventions informatique", href: '#', type: 'link' },
      ],
    },
    {
      title: 'Knowbox',
      links: [
        { label: 'Contacts utiles', type: 'header' },
        { label: 'Aurélie Demard', href: '#', type: 'link' },
        { label: 'Sabine Gisolo', href: '#', type: 'link' },
        { label: 'Documentations, notices, procédures', type: 'header', separator: true },
        { label: 'Production/knowbox', type: 'text' },
        { label: 'Word formate preview', href: '#', type: 'link' },
        {
          label: 'Procédures des fiches argus - preview livre',
          href: '#',
          type: 'link',
        },
      ],
    },
    {
      title: 'Maestro',
      links: [
        { label: 'Contacts utiles', type: 'header' },
        { label: 'Julien Baleria', href: '#', type: 'link' },
        { label: 'Aurélie Demard', href: '#', type: 'link' },
        {
          label: 'Documentations, notices, procédures',
          type: 'header',
          separator: true,
        },
        { label: 'Production / maestro', type: 'text' },
        {
          label: 'Notice Maestro - Utilisateur consultation',
          href: '#',
          type: 'link',
        },
        { label: 'Notice Maestro - Actions utilisateurs', href: '#', type: 'link' },
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
            <BreadcrumbLink href="#" onClick={onViewInformatique}>
              Services
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Production</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="bg-background">
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
            <QuickAccess items={quickLinks} active="Production" />
            <div className="md:col-span-4">
              <h3 className="mb-4 font-semibold text-xl">Production</h3>
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

export default Production;

