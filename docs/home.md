# Home.tsx

Page d'accueil composée de plusieurs blocs :

- carrousel de couvertures via `<InfiniteCarousel>`;
- calendrier des événements et cartes d'actualités;
- listes de présence (`PresenceList`) : absents, télétravail, visites et déplacements. Chaque liste peut afficher plus d'entrées grâce à un état local ;
- trois cartes de liens utiles avec `<LinksCard>`.

Les données sont définies en dur et l'état local gère l'affichage étendu ou réduit des listes.
