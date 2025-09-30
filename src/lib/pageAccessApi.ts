import { requestJson } from './adminApi';
import { type PageDefinition } from './mockDb';

export async function fetchAccessiblePages(): Promise<PageDefinition[]> {
  return requestJson<PageDefinition[]>('/api/access/pages');
}

export type { PageDefinition };
