import type { QuickAccessItem } from '@/components/QuickAccess';
import type { LinkItem } from '@/components/LinksCard';

export interface ServiceCard {
  title: string;
  links: LinkItem[];
}

export interface ServiceArea {
  slug: string;
  label: string;
  quickAccess: QuickAccessItem;
  cards: ServiceCard[];
}
