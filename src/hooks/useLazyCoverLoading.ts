import { useEffect, useState } from 'react';
import { fetchCatalogueCover, type CatalogueBook } from '@/lib/catalogue';

/**
 * Hook pour charger progressivement les couvertures des livres
 * @param books - Liste des livres dont on veut charger les couvertures
 * @returns Liste des livres avec leurs couvertures progressivement chargées
 */
export function useLazyCoverLoading(books: CatalogueBook[]): CatalogueBook[] {
  const [booksWithCovers, setBooksWithCovers] = useState<CatalogueBook[]>(books);

  useEffect(() => {
    // Réinitialiser l'état quand la liste de livres change
    console.log('[useLazyCoverLoading] Mise à jour avec', books.length, 'livres');
    setBooksWithCovers(books);

    if (books.length === 0) {
      return;
    }

    let cancelled = false;

    // Charger les couvertures progressivement
    const loadCovers = async () => {
      console.log('[useLazyCoverLoading] Début du chargement de', books.length, 'couvertures');
      for (let i = 0; i < books.length; i++) {
        if (cancelled) break;

        const book = books[i];
        if (!book || !book.ean) continue;

        try {
          const cover = await fetchCatalogueCover(book.ean);

          if (!cancelled && cover) {
            setBooksWithCovers(prevBooks => {
              // Créer une nouvelle copie du tableau avec la couverture mise à jour
              const newBooks = [...prevBooks];
              if (newBooks[i]) {
                newBooks[i] = { ...newBooks[i], cover };
              }
              return newBooks;
            });
          }
        } catch (error) {
          // Ignorer les erreurs silencieusement
          console.debug(`[useLazyCoverLoading] Impossible de charger la couverture pour ${book.ean}`);
        }

        // Petit délai pour éviter de surcharger le serveur
        if (!cancelled && i < books.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    };

    void loadCovers();

    return () => {
      cancelled = true;
    };
  }, [books]);

  return booksWithCovers;
}
