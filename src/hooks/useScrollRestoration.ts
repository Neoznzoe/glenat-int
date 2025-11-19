import { useEffect, useRef } from 'react';
import { useDecryptedLocation } from '@/lib/secureRouting';

/**
 * Hook pour sauvegarder et restaurer automatiquement la position de scroll
 * lorsqu'on navigue entre les pages.
 *
 * @param key - Clé unique pour identifier la page (par défaut: le pathname)
 */
export function useScrollRestoration(key?: string) {
  const location = useDecryptedLocation();
  const scrollKey = key || `${location.pathname}${location.search}`;
  const isRestoringRef = useRef(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    // Trouver l'élément scrollable (main avec overflow-auto)
    const scrollContainer = document.querySelector('main.overflow-auto');

    if (!scrollContainer) {
      console.warn('[useScrollRestoration] Container scrollable non trouvé');
      return;
    }

    // Restaurer la position de scroll au chargement de la page
    const savedPosition = sessionStorage.getItem(`scroll-${scrollKey}`);

    if (savedPosition && !restoredRef.current) {
      isRestoringRef.current = true;
      const position = parseInt(savedPosition, 10);

      // Attendre que le contenu soit chargé avant de restaurer le scroll
      const restoreScroll = () => {
        scrollContainer.scrollTop = position;
        isRestoringRef.current = false;
        restoredRef.current = true;
      };

      // Essayer plusieurs fois pour s'assurer que le contenu est chargé
      requestAnimationFrame(() => {
        setTimeout(() => {
          restoreScroll();
        }, 100);
      });
    }

    // Sauvegarder la position de scroll avant de quitter la page
    const handleScroll = () => {
      if (!isRestoringRef.current) {
        sessionStorage.setItem(`scroll-${scrollKey}`, scrollContainer.scrollTop.toString());
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      restoredRef.current = false;
    };
  }, [scrollKey]);
}
