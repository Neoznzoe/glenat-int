import JobOffer, { JobOfferProps } from '@/components/JobOffer';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MapPin, Briefcase, Wallet, User, CalendarDays } from 'lucide-react';

export function Emploi() {
  const jobOffers: JobOfferProps[] = [
    {
      title:
        'Le Groupe Glénat recherche pour son service éditorial livres, un·e chargé·e de développement commercial (F/H).',
      subtitle: 'Chargé·e de développement du couvent Sainte Cécile (F/H)',
      jobInfo: [
        { icon: MapPin, text: 'Grenoble', color: 'text-[#004072]' },
        { icon: Briefcase, text: 'CDI', sub: 'dès que possible', color: 'text-[#00D27A]' },
        { icon: User, text: 'Contact', sub: 'Anais Grillet', color: 'text-primary' },
        { icon: CalendarDays, text: 'Annonce du :', sub: '25/07/2025', color: 'text-[#F5803E]' },
        { icon: Wallet, text: 'Rémunération', sub: 'A définir selon le profil.', color: 'text-[#27BCFD]' },
      ],
      resume:
        'Depuis 2009, le couvent Saint Cécile, édifice du XVIIe siècle installé au cœur du quartier historique de Grenoble est le siège social du groupe Glénat. Il abrite également les activités d’intérêt général du Fonds Glénat pour le patrimoine et la création de la Fondation d’entreprise.',
      mission: [
        "Assurer la régie publicitaire de L’Alpe, Ski Français, des ouvrages pratiques et de tout nouveau titre ou guide ;",
        "Animer et développer le portefeuille d’abonnés de la revue L’Alpe ;",
        "Développer les partenariats et coordonner les projets d’édition déléguée (magazines stations, territoires, guides, livres, BD, etc.) ;",
        'Concourir à tous les projets permettant de développer le CA de la branche d’activités.',
      ],
      profil: [
        'De formation supérieure (bac+5) dans le domaine commercial ou marketing, vous justifiez d’une première expérience professionnelle réussie dans les secteurs de l’édition ou du tourisme.',
        'Vous bénéficiez d’une bonne connaissance des entreprises locales, du secteur de la montagne et avez envie de développer une activité et un chiffre d’affaires.',
        'Reconnu·e pour votre aisance relationnelle et votre excellente présentation, vous savez faire preuve de rigueur et d’autonomie.',
      ],
      avantages: [
        "13ème mois, participation et intéressement, mutuelle, titre-restaurant, télétravail partiel possible à partir de 6 mois d'ancienneté.",
      ],
    },
    {
      title: 'Le Groupe Glénat recherche un·e assistant·e marketing (F/H).',
      subtitle: 'Assistant·e marketing (F/H)',
      jobInfo: [
        { icon: MapPin, text: 'Paris', color: 'text-[#004072]' },
        { icon: Briefcase, text: 'CDD', sub: '6 mois', color: 'text-[#00D27A]' },
        { icon: User, text: 'Contact', sub: 'Jean Dupont', color: 'text-primary' },
        { icon: CalendarDays, text: 'Annonce du :', sub: '01/08/2025', color: 'text-[#F5803E]' },
        { icon: Wallet, text: 'Rémunération', sub: 'Selon expérience', color: 'text-[#27BCFD]' },
      ],
      resume:
        'Nous recherchons un·e assistant·e marketing pour renforcer notre équipe parisienne.',
      mission: [
        'Participer à la mise en place des campagnes marketing.',
        'Analyser les retombées des actions menées.',
        'Assurer une veille concurrentielle.',
      ],
      profil: [
        'Vous possédez un bac+3 en marketing ou communication.',
        'Organisé·e et curieux·se, vous maîtrisez les outils digitaux.',
      ],
      avantages: [
        'Tickets restaurant, remboursement à 50% du titre de transport.',
        'Accès à une bibliothèque interne et événements culturels.',
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
            <BreadcrumbPage>Emploi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {jobOffers.map((offer, index) => (
        <JobOffer key={index} {...offer} />
      ))}
    </div>
  );
}

export default Emploi;
