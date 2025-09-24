import type { QuickAccessItem } from '@/components/QuickAccess';
import type { LinkItem } from '@/components/LinksCard';
import { SERVICE_AREAS } from './mockData';
import type { ServiceArea, ServiceCard } from './types';

function cloneLink(link: LinkItem): LinkItem {
  return { ...link };
}

function cloneQuickAccess(item: QuickAccessItem): QuickAccessItem {
  return { ...item };
}

function cloneCard(card: ServiceCard): ServiceCard {
  return {
    title: card.title,
    links: card.links.map(cloneLink),
  };
}

function cloneArea(area: ServiceArea): ServiceArea {
  return {
    ...area,
    quickAccess: cloneQuickAccess(area.quickAccess),
    cards: area.cards.map(cloneCard),
  };
}

export async function fetchServiceAreas(): Promise<ServiceArea[]> {
  return Promise.resolve(SERVICE_AREAS.map(cloneArea));
}

export async function fetchServiceAreaBySlug(slug: string): Promise<ServiceArea | null> {
  const area = SERVICE_AREAS.find((candidate) => candidate.slug === slug);
  return Promise.resolve(area ? cloneArea(area) : null);
}

export async function fetchServiceQuickAccess(): Promise<QuickAccessItem[]> {
  return Promise.resolve(SERVICE_AREAS.map((area) => cloneQuickAccess(area.quickAccess)));
}

export type { ServiceArea, ServiceCard };
