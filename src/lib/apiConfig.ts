// Source de vérité UNIQUE pour la base de l'API.
//
function resolveApiBaseUrl(): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  // Environnements déployés : on déduit l'API du hostname du front.
  if (host.includes('-recette')) return 'https://api-recette.groupe-glenat.com';
  if (host.includes('-dev')) return 'https://api-dev.groupe-glenat.com';
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    // Tout autre hostname réel = production (ex. intranet.groupe-glenat.com).
    return 'https://api.groupe-glenat.com';
  }

  // Développement local (vite) : possibilité de surcharger la cible via
  // VITE_API_BASE_URL (.env.developpement), sinon API de dev par défaut.
  return import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';
}

/** Base de l'API, ex. `https://api-recette.groupe-glenat.com` (sans slash final). */
export const API_BASE_URL = resolveApiBaseUrl().replace(/\/$/, '');
