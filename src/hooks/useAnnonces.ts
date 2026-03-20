import { useQuery } from '@tanstack/react-query';
import {
  fetchAnnonces,
  fetchAnnoncesCount,
  fetchAnnonceEmetteur,
  ANNONCES_QUERY_KEY,
  ANNONCES_COUNT_QUERY_KEY,
  ANNONCES_EMETTEUR_QUERY_KEY,
  type Annonce,
  type AnnonceEmetteur,
} from '@/lib/annoncesApi';

// ─── Mock data (à supprimer une fois l'API fonctionnelle) ───
const USE_MOCK = true;

const MOCK_ANNONCES: Annonce[] = [
  {
    id: 254,
    createdAt: '2025-09-01T10:48:21.657',
    title: 'Appartement F2 à vendre — Tremblay-en-France',
    expiresAt: '2026-06-30T00:00:00.000',
    description:
      "Superbe F2 de 48m2, au RDC, à vendre à Tremblay-en-France. Proche commerces et transports, à 25 minutes de Paris.\n\nL'appartement se compose d'une entrée avec placards, WC indépendant, d'une cuisine aménagée et entièrement équipée, ouverte sur un séjour lumineux.\nLa partie nuit : une chambre et une salle d'eau moderne.\n\nLe bien est accompagné d'une terrasse de 12m2 et d'une place de parking boxable.\nAucuns travaux n'est à prévoir.\n\nIdéal pour personne seule, couple ou investisseurs souhaitant mettre en location.\nN'hésitez pas à me contacter pour plus d'information.",
    type: 'Offre',
    category: 'Immobilier',
    price: '167 000 €',
    validation: 'Oui',
    author: {
      lastName: 'Pecheux',
      firstName: 'Auxane',
      department: 'Commercial',
      company: 'Editions Glénat',
    },
    images: [
      {
        filename: '27-254-539-859-FB59oJK',
        large: 'https://picsum.photos/seed/appart1/800/600',
        thumb: 'https://picsum.photos/seed/appart1/200/200',
      },
    ],
    attachments: [],
  },
  {
    id: 251,
    createdAt: '2025-07-10T09:15:00.000',
    title: 'Recherche covoiturage Grenoble → Lyon',
    expiresAt: '2026-05-01T00:00:00.000',
    description:
      "Bonjour,\n\nJe recherche un covoiturage régulier Grenoble → Lyon, les mardis et jeudis matin (départ ~7h30).\nJe peux participer aux frais d'essence.\n\nRetour possible en fin de journée vers 18h.\nContactez-moi par mail ou Teams !",
    type: 'Demande',
    category: 'Véhicules',
    price: '',
    validation: 'Oui',
    author: {
      lastName: 'Martin',
      firstName: 'Julie',
      department: 'Éditorial',
      company: 'Editions Glénat',
    },
    images: [],
    attachments: [],
  },
  {
    id: 248,
    createdAt: '2025-06-20T14:30:00.000',
    title: 'Chaton gris à donner',
    expiresAt: '2026-04-15T00:00:00.000',
    description:
      "Bonjour, une amie donne un petit chaton gris. N'est-il pas trognon ?\nIl a un mois et aura sûrement besoin de boire au biberon.\n\nContactez-moi si intéressé(e) !",
    type: 'Actualité',
    category: 'Autre',
    price: '',
    validation: 'Oui',
    author: {
      lastName: 'Dufour',
      firstName: 'Mathias',
      department: 'Marketing',
      company: 'Editions Glénat',
    },
    images: [
      {
        filename: '27-0-539-1064-NX1SesQ',
        large: 'https://picsum.photos/seed/chaton1/800/600',
        thumb: 'https://picsum.photos/seed/chaton1/200/200',
      },
      {
        filename: '27-0-540-1064-AB2CdeF',
        large: 'https://picsum.photos/seed/chaton2/800/600',
        thumb: 'https://picsum.photos/seed/chaton2/200/200',
      },
    ],
    attachments: [
      {
        filename: 'adoption-infos.pdf',
        url: '#',
      },
    ],
  },
  {
    id: 245,
    createdAt: '2025-05-12T11:00:00.000',
    title: 'MacBook Pro 14" M3 — Excellent état',
    expiresAt: '2026-04-30T00:00:00.000',
    description:
      "Vends MacBook Pro 14 pouces, puce M3, 16 Go RAM, 512 Go SSD.\nAcheté en janvier 2025, sous garantie Apple jusqu'en janvier 2027.\nTrès peu utilisé, état quasi neuf, livré avec chargeur d'origine et housse de protection.\n\nPrix négociable, à récupérer sur Grenoble.",
    type: 'Offre',
    category: 'Multimédia',
    price: '1 450 €',
    validation: 'Oui',
    author: {
      lastName: 'Bernard',
      firstName: 'Thomas',
      department: 'Informatique',
      company: 'Editions Glénat',
    },
    images: [
      {
        filename: '27-245-539-900-XY4ZabC',
        large: 'https://picsum.photos/seed/macbook1/800/600',
        thumb: 'https://picsum.photos/seed/macbook1/200/200',
      },
    ],
    attachments: [],
  },
];
// ─── Fin mock data ──────────────────────────────────────────

export function useAnnonces() {
  return useQuery<Annonce[]>({
    queryKey: ANNONCES_QUERY_KEY,
    queryFn: USE_MOCK ? () => Promise.resolve(MOCK_ANNONCES) : fetchAnnonces,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useAnnoncesCount() {
  return useQuery<number>({
    queryKey: ANNONCES_COUNT_QUERY_KEY,
    queryFn: USE_MOCK ? () => Promise.resolve(MOCK_ANNONCES.length) : fetchAnnoncesCount,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useAnnonceEmetteur(email: string | undefined) {
  return useQuery<AnnonceEmetteur | null>({
    queryKey: ANNONCES_EMETTEUR_QUERY_KEY(email ?? ''),
    queryFn: () => fetchAnnonceEmetteur(email!),
    enabled: !!email,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export type { Annonce, AnnonceEmetteur } from '@/lib/annoncesApi';
