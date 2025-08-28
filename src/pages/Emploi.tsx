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

export const jobOffers: JobOfferProps[] = [
    {
      title:
        'Le Groupe Glénat recherche pour son service éditorial livres, un·e chargé·e de développement commercial (F/H).',
      subtitle: 'Chargé·e de développement commercial (F/H)',
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
      title:
        'Le Groupe Glénat recherche pour son service éditorial BD, un·e éditeur.rice junior (F/H).',
      subtitle: 'Éditeur.rice junior (F/H)',
      jobInfo: [
        {
          icon: MapPin,
          text: 'Boulogne-Billancourt (92)',
          color: 'text-[#004072]',
        },
        {
          icon: Briefcase,
          text: 'CDD',
          sub: '03/11/2025–14/03/2026',
          color: 'text-[#00D27A]',
        },
        {
          icon: User,
          text: 'Contact',
          sub: 'Marine Mazet',
          color: 'text-primary',
        },
        {
          icon: CalendarDays,
          text: 'Annonce du :',
          sub: '31/07/2025',
          color: 'text-[#F5803E]',
        },
        {
          icon: Wallet,
          text: 'Rémunération',
          sub: 'À définir selon profil',
          color: 'text-[#27BCFD]',
        },
      ],
      resume:
        "Dans le cadre d’un remplacement de congé maternité, nous recherchons un·e éditeur.rice junior (F/H) pour le catalogue BD. Merci d'adresser votre candidature (CV + lettre de motivation) à Marine Mazet.",
      mission: [
        'Conception éditoriale de projets en adaptation et en création, sélection des manuscrits, suivi de réalisation des planches, des plannings, validation des couvertures ;',
        'Élaboration des plans d’ouvrages, suivi de la mise en page, relecture, corrections jusqu’au BAT ;',
        'Coordination des prestataires : studio, maquettistes, agences photo, photographes, correcteurs, packageurs, partenaires ;',
        'Suivi de fabrication : mise à jour du planning, vérification et corrections, suivi de la maquette ;',
        'Rédaction des introductions, quatrième de couvertures, argumentaires ;',
        'Suivi relationnel des auteurs ; demande de règlements auteurs dans le cadre du suivi budgétaire ;',
        "Collaboration avec l’ensemble des services internes concernés (commercial, marketing, digital, presse…) ;",
        'Présentation des ouvrages lors des réunions commerciales ;',
        'Participation aux salons du livre et divers évènements du Groupe Glénat.',
      ],
      profil: [
        'Formation métiers du livre/édition (minimum bac+4) avec une expérience de 3 ans requise dans le domaine de l’édition, idéalement de l’édition BD ;',
        'Bonne connaissance des codes typographiques et de l’ensemble de la chaîne du livre ;',
        'Maîtrise orthographique et syntaxe ;',
        'Adaptabilité, sens du contact, rigueur, capacité d’organisation, fiabilité, autonomie ;',
        'Maîtrise de l’outil informatique en particulier Word, Excel, Powerpoint.',
      ],
      avantages: [
        '13ᵉ mois, participation et intéressement, titre-restaurant, mutuelle.',
      ],
    },
  ];

export function Emploi() {
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
