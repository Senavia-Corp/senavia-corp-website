import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'zx255dw6',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  token: import.meta.env.SANITY_API_TOKEN,
});

export async function fetchSanity<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  return sanity.fetch<T>(query, params);
}
