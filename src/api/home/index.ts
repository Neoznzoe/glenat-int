import AladinCover from '@/assets/images/aladin.webp';
import EclipseHumaineCover from '@/assets/images/eclipse_humaine.webp';
import JaimeLaModeCover from '@/assets/images/jaime_la_mode.webp';
import CombatDuneVieCover from '@/assets/images/le_combat_dune_vie.webp';
import LesLicorniersCover from '@/assets/images/les_licorniers.webp';
import MontagneEuropeCover from '@/assets/images/montagne_europe.webp';
import NayaPikaCover from '@/assets/images/naya_pika.webp';
import OdyseeCover from '@/assets/images/odyssee.webp';
import JulesMatratCover from '@/assets/images/jules_matrat.webp';
import OnePiece110Cover from '@/assets/images/onepiece_110.webp';
import type { LinkItem } from '@/components/LinksCard';

export interface HomeCarouselCover {
  src: string;
  href: string;
}

export interface HomePresenceEntry {
  name: string;
  email: string;
}

export interface HomeAbsentEntry extends HomePresenceEntry {
  retour: string;
}

export interface HomeVisitorEntry extends HomePresenceEntry {
  date: string;
}

export interface HomePresenceData {
  absents: HomeAbsentEntry[];
  telework: HomePresenceEntry[];
  visitors: HomeVisitorEntry[];
  traveling: HomePresenceEntry[];
  plannedTravel: HomeVisitorEntry[];
}

export type HomeLinkCollectionId = 'useful' | 'companyLife' | 'sharePoint';

export interface HomeLinkCollection {
  id: HomeLinkCollectionId;
  title: string;
  items: LinkItem[];
  /**
   * Number of links displayed before showing the "Voir plus" button.
   * Defaults to showing every link in the collection.
   */
  initialDisplayCount?: number;
}

export interface HomeNewsData {
  newArrivals: string[];
  saintNamesByWeekday: Record<string, string[]>;
}

export async function fetchHomeCarouselCovers(): Promise<HomeCarouselCover[]> {
  return [
    { src: AladinCover, href: '' },
    { src: EclipseHumaineCover, href: '' },
    { src: JaimeLaModeCover, href: '' },
    { src: CombatDuneVieCover, href: '' },
    { src: LesLicorniersCover, href: '' },
    { src: MontagneEuropeCover, href: '' },
    { src: NayaPikaCover, href: '' },
    { src: OdyseeCover, href: '' },
    { src: JulesMatratCover, href: '' },
    { src: OnePiece110Cover, href: '' },
  ];
}

export async function fetchHomePresence(): Promise<HomePresenceData> {
  return {
    absents: [
      { name: 'David Bernard', email: 'david@example.com', retour: '12/09/2024' },
      { name: 'Emma Boucher', email: 'emma@example.com', retour: '15/09/2024' },
      { name: 'Julien Moreau', email: 'julien@example.com', retour: '16/09/2024' },
      { name: 'Sophie Lambert', email: 'sophie@example.com', retour: '18/09/2024' },
      { name: 'Thomas Leroy', email: 'thomas@example.com', retour: '19/09/2024' },
      { name: 'Camille Dupuis', email: 'camille@example.com', retour: '20/09/2024' },
      { name: 'Hugo Richard', email: 'hugo@example.com', retour: '21/09/2024' },
      { name: 'Laura Lefevre', email: 'laura@example.com', retour: '22/09/2024' },
      { name: 'Nicolas Caron', email: 'nicolas@example.com', retour: '23/09/2024' },
      { name: 'Manon Roux', email: 'manon@example.com', retour: '24/09/2024' },
      { name: 'Alexandre Garnier', email: 'alexandre@example.com', retour: '25/09/2024' },
      { name: 'Chloé Marchand', email: 'chloe@example.com', retour: '26/09/2024' },
      { name: 'Pierre Fontaine', email: 'pierre@example.com', retour: '27/09/2024' },
      { name: 'Claire Perrot', email: 'claire@example.com', retour: '28/09/2024' },
      { name: 'Lucas Pelletier', email: 'lucas@example.com', retour: '29/09/2024' },
    ],
    telework: [
      { name: 'Alice Martin', email: 'alice@example.com' },
      { name: 'Bob Dupont', email: 'bob@example.com' },
      { name: 'Paul Girard', email: 'paul@example.com' },
      { name: 'Julie Robin', email: 'julie@example.com' },
      { name: 'Hélène Faure', email: 'helene@example.com' },
      { name: 'Antoine Picard', email: 'antoine@example.com' },
      { name: 'Marion Noël', email: 'marion@example.com' },
      { name: 'François Tessier', email: 'francois@example.com' },
      { name: 'Isabelle Moulin', email: 'isabelle@example.com' },
      { name: 'Romain Barre', email: 'romain@example.com' },
      { name: 'Céline Robert', email: 'celine@example.com' },
      { name: 'Vincent Colin', email: 'vincent@example.com' },
      { name: 'Aurélie Lucas', email: 'aurelie@example.com' },
      { name: 'Mathieu Roger', email: 'mathieu@example.com' },
      { name: 'Elodie Masson', email: 'elodie@example.com' },
      { name: 'Damien Millet', email: 'damien@example.com' },
      { name: 'Charlotte Paris', email: 'charlotte@example.com' },
    ],
    visitors: [
      { name: 'Manon Roux', email: 'manon@example.com', date: '24/09/2024' },
      { name: 'Alexandre Garnier', email: 'alexandre@example.com', date: '25/09/2024' },
      { name: 'Chloé Marchand', email: 'chloe@example.com', date: '26/09/2024' },
      { name: 'Pierre Fontaine', email: 'pierre@example.com', date: '27/09/2024' },
      { name: 'Claire Perrot', email: 'claire@example.com', date: '28/09/2024' },
      { name: 'Lucas Pelletier', email: 'lucas@example.com', date: '29/09/2024' },
    ],
    traveling: [
      { name: 'Marc Petit', email: 'marc@example.com' },
      { name: 'Sébastien Robert', email: 'sebastien@example.com' },
      { name: 'Caroline André', email: 'caroline@example.com' },
      { name: 'Philippe Blanc', email: 'philippe@example.com' },
      { name: 'Sandrine Roche', email: 'sandrine@example.com' },
    ],
    plannedTravel: [
      { name: 'Anne Grand', email: 'anne@example.com', date: '25/09/2024' },
      { name: 'Louis Renard', email: 'louis@example.com', date: '26/09/2024' },
      { name: 'Mélanie Vincent', email: 'melanie@example.com', date: '27/09/2024' },
    ],
  };
}

export async function fetchHomeLinkCollections(): Promise<HomeLinkCollection[]> {
  const usefulLinks: LinkItem[] = [
    { label: 'CSE Glénat', href: '#' },
    { label: 'Assistance informatique', href: '#' },
    { label: 'Support informatique Android', href: '#' },
    { label: 'Notilus - Notes de frais', href: '#', badge: 'New' },
    { label: 'Plateforme de formation', href: '#' },
    { label: 'Pages jaunes', href: '#' },
    { label: 'SNCF', href: '#' },
    { label: 'Horaires TGV', href: '#' },
    { label: 'Base marques - Site INPI', href: '#' },
    { label: 'Site Electre', href: '#' },
    { label: 'Glénat', href: '#' },
    { label: 'Le couvent Sainte-Cécile', href: '#' },
  ];

  const companyLifeLinks: LinkItem[] = [
    {
      label: "opérations informatiques en cours",
      href: '#',
      badge: '74',
      badgeColor: 'bg-primary',
      highlight: true,
      badgePosition: 'left',
    },
    { label: "Glénat'Matin", href: '#' },
    { label: 'Film institutionnel', href: '#' },
    { label: 'Sainte-Cécile', href: '#' },
    { label: 'La boite à idée', href: '#' },
    { label: 'Audience internet par mois', href: '#' },
    { label: 'Audience internet par jour', href: '#' },
    { label: 'Audience internet par historique', href: '#' },
    { label: 'Abonnement aux newsletter', href: '#' },
  ];

  const sharePointLinks: LinkItem[] = [
    { label: 'Accueil office 365', href: '#' },
    { label: 'ACHAT Equipe', href: '#' },
    { label: 'ADV Equipe', href: '#' },
    { label: 'CESSIONS-DE-DROITS Equipe', href: '#' },
    { label: 'COMITE-DIRECTION', href: '#' },
    { label: 'COMMERCIAL Titeuf', href: '#' },
    { label: 'COMMERCIALE Equipe', href: '#' },
    { label: 'COMPTABILITE Equipe', href: '#' },
    { label: 'CONTRÔLE-GESTION Equipe', href: '#' },
    { label: 'DIRECTION-GENERALE', href: '#' },
    { label: 'DROITS-AUTEUR Equipe', href: '#' },
    { label: 'EDITO-BD Equipe', href: '#' },
    { label: 'EDITO-JEUNESSE Equipe', href: '#' },
    { label: 'EDITO-LIVRES Equipe', href: '#' },
    { label: 'EDITO-LIVRES-SOUS-LICENCES Equipe', href: '#' },
    { label: 'EDITO-MANGA Equipe', href: '#' },
    { label: 'EDITO-MANGA Interne', href: '#' },
    { label: 'EDITO-MANGAS Partenaires', href: '#' },
    { label: 'EVENEMENTIEL Equipe', href: '#' },
    { label: 'FABRICANTS Equipe', href: '#' },
    { label: 'GALERIE Equipe', href: '#' },
    { label: 'INFORMATIQUE Equipe', href: '#' },
    { label: 'JEUX Equipe', href: '#' },
    { label: 'LECTURES Equipe', href: '#' },
    { label: 'LICENCES Equipe', href: '#' },
    { label: 'MARKETING Equipe', href: '#' },
    { label: 'MARKETING-DIGITAL Equipe', href: '#' },
    { label: 'MCDE Equipe', href: '#' },
    { label: 'PARTENARIATS Equipe', href: '#' },
    { label: 'PEDAGOGIE Equipe', href: '#' },
    { label: 'PROJET Chemin-Fer', href: '#' },
    { label: 'PROJET Compta', href: '#' },
    { label: 'PROJET Navision-DA', href: '#' },
    { label: 'PROJET Navision-ED', href: '#' },
    { label: 'PROJET Navision-EDI', href: '#' },
    { label: 'PROJET Navision-Fournisseurs', href: '#' },
    { label: 'PROJET Signature Mail', href: '#' },
    { label: 'PROJET TRAVAIL Colle', href: '#' },
    { label: 'RESSOURCES-HUMAINES Equipe', href: '#' },
    { label: 'RSE Equipe', href: '#' },
    { label: 'SUPPORT Bureautique', href: '#' },
    { label: 'Support IT', href: '#' },
    { label: 'Support RH', href: '#' },
    { label: 'SUPPORT TECHNIQUE', href: '#' },
    { label: 'SUPPORT Template', href: '#' },
    { label: 'Support Signalétique', href: '#' },
    { label: 'TECHNIQUE Equipe', href: '#' },
    { label: 'VENTES Equipe', href: '#' },
    { label: 'VENTES-DEVELOPPEMENT Equipe', href: '#' },
  ];

  return [
    {
      id: 'useful',
      title: 'Sites utiles',
      items: usefulLinks,
      initialDisplayCount: usefulLinks.length,
    },
    {
      id: 'companyLife',
      title: "Vie de l'entreprise",
      items: companyLifeLinks,
      initialDisplayCount: companyLifeLinks.length,
    },
    {
      id: 'sharePoint',
      title: 'Sites Share Point',
      items: sharePointLinks,
      initialDisplayCount: sharePointLinks.length,
    },
  ];
}

export async function fetchHomeNews(): Promise<HomeNewsData> {
  return {
    newArrivals: ['Alice Martin', 'Bob Dupont', 'Charles Durand'],
    saintNamesByWeekday: {
      lundi: ['Gabin', 'Agathe'],
      mardi: ['Bernard', 'Brigitte'],
      mercredi: ['Camille', 'Céline'],
      jeudi: ['Denis', 'Diane'],
      vendredi: ['Eric', 'Emma'],
      samedi: ['Fanny', 'Florian'],
      dimanche: ['Gabriel', 'Gaëlle'],
    },
  };
}
