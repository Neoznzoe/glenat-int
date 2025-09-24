# Cartographie des éléments d'interface

Cette cartographie liste chaque élément interactif ou visible que l'on peut vouloir piloter par les droits d'accès. Les identifiants suivent la convention `contexte.sous-contexte.element` et peuvent servir de clé unique en base. Lorsqu'un composant est réutilisable, la section « Composants » décrit sa structure générique et les sections « Pages » indiquent comment il est instancié avec des identifiants concrets.

## Structure du fichier JSON

Le fichier `docs/cartographie-elements.json` expose trois blocs :

- `layout` : le squelette commun (sidebar, topbar, notifications).
- `components` : les structures génériques des composants réutilisables avec leurs slots.
- `pages` : un dictionnaire clé/valeur où chaque page (`home`, `catalogueAll`, `administration`, …) possède :
  - `id`, `title`, `url` pour tracer la ressource en base,
  - `elements` : une liste ordonnée décrivant chaque section/component instancié.

Chaque entrée de `elements` porte un identifiant unique (`page.<slug>.<chemin>`), un libellé métier, un type (`section`, `component`, `collection`, `tabs`, …) et, suivant le cas :

- `componentRef` pour indiquer quel composant réutilisable est instancié.
- `children` pour décrire des sous-blocs hiérarchiques.
- `items` / `groups` pour la granularité fine : chaque bouton, lien, badge, ligne de tableau ou carte possède son propre identifiant (ex. `page.home.links.sharepoint.support-it`).

Les tableaux de données repris des fixtures (absents, offres d’emploi, livres du catalogue, etc.) sont entièrement listés dans le JSON pour garantir que chaque entrée puisse être liée à une règle de visibilité.

## Layout global

### Structure racine (`src/App.tsx`)
- `layout.shell` : conteneur flex qui juxtapose la barre latérale, le contenu principal et le toaster global.
- `layout.main` : zone centrale qui empile la Topbar (`layout.topbar`) et le `<main>` faisant défiler les pages.
- `layout.notifications.toaster` : composant `<Toaster>` (bibliothèque sonner) responsable des notifications toast.

### Barre latérale (`src/components/Sidebar.tsx`)
- `layout.sidebar.container` : panneau principal (largeur réduite ou étendue suivant l’état).
- `layout.sidebar.header.logo` : affichage du logo complet ou de l’icône « G » selon l’état étendu.
- `layout.sidebar.header.pin-toggle` : bouton d’épinglage/désépinglage (icônes `Pin` / `PinOff`).
- `layout.sidebar.menu.<itemId>` : lien de navigation sécurisé (`SecureNavLink`) pour chaque entrée (ex. `layout.sidebar.menu.home`, `layout.sidebar.menu.catalogue`, …) incluant icône, libellé et éventuellement badge numérique (emploi).
- `layout.sidebar.menu-admin.administration` : entrée dédiée au module Administration, isolée dans son propre bloc.
- `layout.sidebar.footer.version` : mention « Version 1.0.0 » en pied de sidebar.

Chaque entrée de menu est conditionnée par une permission (`PermissionKey`) calculée via `computeEffectivePermissions`. Les identifiants ci-dessus peuvent être reliés directement aux clés permissions existantes (`home`, `catalogue`, `services`, `administration`, …).

### Barre supérieure (`src/components/Topbar.tsx`)
- `layout.topbar.search.input` : champ de recherche avec icône `Search`.
- `layout.topbar.search.scope` : sélecteur (`Select`) de périmètre (`qui-fait-quoi`, `catalogue`, `glenatdoc`).
- `layout.topbar.theme-toggle` : bouton `ThemeToggle` (icônes Soleil/Lune) pour alterner clair/sombre.
- `layout.topbar.notifications.button` : bouton cloche avec badge de total et carte de survol `NotificationList`.
- `layout.topbar.cart.button` : bouton panier avec badge de quantité.
- `layout.topbar.cart.hovercard` : panneau `CartSummary` affiché au survol (voir structure dans la section Composants).
- `layout.topbar.user.dropdown` : déclencheur affichant avatar, nom, sous-titre et icône `ChevronDown`.
- `layout.topbar.user.menu.profile` : entrée « Mon profil ».
- `layout.topbar.user.menu.settings` : entrée « Paramètres ».
- `layout.topbar.user.menu.password` : entrée « Contrôle mot de passe ».
- `layout.topbar.user.menu.logout` : entrée « Déconnexion » (déclenche `logout`).

## Composants réutilisables

### `NotificationList` (`src/components/NotificationList.tsx`)
- `component.notification-list.header` : titre « Notifications ».
- `component.notification-list.items` : liste de liens avec compteur (`count`) et libellé.
- `component.notification-list.empty` : message affiché quand aucune notification n’est fournie.

### `CartSummary` (`src/components/CartSummary.tsx`)
- `component.cart-summary.header` : titre « Votre panier ».
- `component.cart-summary.empty` : état vide.
- `component.cart-summary.items` : liste d’articles avec miniature, titre, auteurs, prix total.
- `component.cart-summary.quantity-select` : sélecteur de quantité (`Select`) par article.
- `component.cart-summary.remove` : bouton `Trash2` pour supprimer un article.
- `component.cart-summary.total` : ligne total HT.
- `component.cart-summary.actions.view-cart` : bouton principal « Voir mon panier ».

### `InfiniteCarousel` (`src/components/InfiniteCarousel.tsx`)
- `component.carousel.track` : rail d’images en défilement continu.
- `component.carousel.item` : lien vers la ressource associée à chaque couverture.

### `ActualitesCard` (`src/components/ActualitesCard.tsx`)
- `component.actualites.card` : carte principale (en-tête colorée).
- `component.actualites.search.<module>` : champs de recherche « Glénat'Fée », « Commande », « Contrats ».
- `component.actualites.newcomers` : liste « Nouveaux arrivants ».
- `component.actualites.saint-day` : bloc « Bonnes fêtes aux ».

### `EventsCalendar` (`src/components/EventsCalendar.tsx`)
- `component.calendar.today-button` : bouton « Aujourd’hui ».
- `component.calendar.month-grid` : vue calendrier (DayPicker) avec jours, styles événementiels.
- `component.calendar.legend` : légende listant « Jours fériés », « Institutions… », « Autres évènements ».

### `PresenceList` (`src/components/PresenceList.tsx`)
- `component.presence.header` : titre + compteur.
- `component.presence.controls.search` : champ de recherche optionnel.
- `component.presence.controls.sort` : sélecteur de tri optionnel.
- `component.presence.table` : tableau (`Table`) des lignes.
- `component.presence.empty` : message vide.
- `component.presence.footer` : bouton « Voir plus » / « Voir moins » selon le cas.

### `LinksCard` (`src/components/LinksCard.tsx`)
- `component.links-card.header` : titre + icône d’aide.
- `component.links-card.list` : liste d’entrées (lien, en-tête ou texte) avec gestion de badges.
- `component.links-card.footer` : bouton « Voir plus / Voir moins » si le nombre d’éléments dépasse `limit`.

### `QuickAccess` (`src/components/QuickAccess.tsx`)
- `component.quick-access.title` : libellé « Accès rapide ».
- `component.quick-access.item.<label>` : carte cliquable avec icône et intitulé (ex. Informatique, Production).

### `BookFilters` (`src/components/BookFilters.tsx`)
- `component.book-filters.trigger` : bouton `Filtres` avec icône `ListFilter` et compteur actif.
- `component.book-filters.author` : champ `TagInput` pour auteurs.
- `component.book-filters.format` : liste de cases à cocher (formats).
- `component.book-filters.edition` : liste de cases à cocher (maisons d’édition).
- `component.book-filters.collections` : filtres « Collections spéciales ».
- `component.book-filters.age` : filtres « Âge cible ».
- `component.book-filters.themes` : filtres « Thèmes ».
- `component.book-filters.publication` : cases « Nouveauté », « À paraître ».
- `component.book-filters.availability` : filtres « Disponibilité ».

### `BookCard` (`src/components/BookCard.tsx`)
- `component.book-card.cover` : visuel de couverture avec ruban optionnel.
- `component.book-card.actions.open` : lien vers la fiche produit (`SecureLink`).
- `component.book-card.body` : bloc texte titre, EAN, auteurs, éditeur, date, info extra.
- `component.book-card.footer.read` : bouton texte « Lire dans le kiosque ».
- `component.book-card.footer.add-to-cart` : bouton principal « Ajouter à mon panier ».

### `EditionCard` (`src/components/EditionCard.tsx`)
- `component.edition-card.header` : bandeau coloré avec logo/titre.
- `component.edition-card.links.collections` : lien « Voir les collections ».
- `component.edition-card.links.catalogue` : lien « Parcourir le catalogue ».

### `QuickAccess` dans Catalogue (`src/pages/catalogue/CatalogueLayout.tsx`)
- `component.catalogue.quick-access.prochaines-offices`
- `component.catalogue.quick-access.dernières-nouveautes`
- `component.catalogue.quick-access.editions`
- `component.catalogue.quick-access.auteurs`
- `component.catalogue.quick-access.catalogue`
- `component.catalogue.quick-access.telecharger`
- `component.catalogue.quick-access.top-commandes`
- `component.catalogue.quick-access.couverture`
- `component.catalogue.quick-access.information`
- `component.catalogue.quick-access.stock`

### `UserListPanel` (`src/components/admin/UserListPanel.tsx`)
- `component.user-list.header.title` : en-tête « Collaborateurs ».
- `component.user-list.controls.search` : champ de recherche.
- `component.user-list.controls.toggle-inactive` : bouton « Afficher les utilisateurs inactifs ».
- `component.user-list.table` : tableau principal (colonnes Utilisateur, Groupes, Dernière connexion).
- `component.user-list.row.badges` : badges de groupes par utilisateur.
- `component.user-list.row.connection` : indication de dernière connexion + total accès.
- `component.user-list.empty` : message aucun résultat.
- `component.user-list.loading` : message chargement.

### `UserAccessEditor` (`src/components/admin/UserAccessEditor.tsx`)
- `component.user-access.header.identity` : titre + description utilisateur + badges statut/super admin.
- `component.user-access.section.groups` : liste de cases à cocher pour chaque groupe métier.
- `component.user-access.section.overrides` : tableau des permissions avec origine et sélecteur de décision.
- `component.user-access.actions.reset` : bouton « Réinitialiser ».
- `component.user-access.actions.save` : bouton « Enregistrer ».

## Pages

### Accueil (`/`, `src/pages/Home.tsx`)
- `home.header.card` : carte générale avec date du jour et salutation.
  - `home.header.date.weekday` : libellé du jour (format long).
  - `home.header.date.full` : date complète.
  - `home.header.greeting` : messages « Bonjour {user} » et « Bonne journée ! ».
  - `home.header.next-office` : texte « Prochaine office 255001… ».
  - `home.header.carousel` : composant `component.carousel.track`.
- `home.actualites.card` : `ActualitesCard` (voir composants) avec trois champs de recherche, nouveaux arrivants, fêtes.
- `home.calendar.card` : carte entourant `EventsCalendar` (inclut bouton « Aujourd’hui », légende).
- `home.presence.absents` : `PresenceList` (colonnes Nom / Email / Retour prévu) avec recherche, tri, voir plus/moins.
- `home.presence.telework` : `PresenceList` (Nom / Email) avec recherche, tri, pagination.
- `home.presence.visiting` : `PresenceList` variant `embedded` (Nom / Email / Date) avec surlignage conditionnel.
- `home.presence.traveling` : `PresenceList` variant `embedded` (Nom / Email) avec recherche, tri restreint.
- `home.presence.planned-travel` : `PresenceList` variant `embedded` (Nom / Email / Date).
- `home.links.useful` : carte `LinksCard` « Sites utiles ».
- `home.links.company-life` : carte `LinksCard` « Vie de l'entreprise ».
- `home.links.sharepoint` : carte `LinksCard` « Sites Share Point ».

### Emploi (`/emploi`, `src/pages/Emploi.tsx`)
- `emploi.breadcrumb` : fil d’Ariane Accueil > Emploi.
- `emploi.job-offer.<index>` : composant `JobOffer` pour chaque entrée `jobOffers`.
  - `emploi.job-offer.<index>.header.title` : titre d’offre.
  - `emploi.job-offer.<index>.header.subtitle` : sous-titre (localisation / contrat).
  - `emploi.job-offer.<index>.summary` : liste d’informations clés (icônes, texte, sous-ligne).
  - `emploi.job-offer.<index>.tabs.resume` : onglet Résumé.
  - `emploi.job-offer.<index>.tabs.mission` : onglet Mission (liste puces).
  - `emploi.job-offer.<index>.tabs.profil` : onglet Profil (liste puces).
  - `emploi.job-offer.<index>.tabs.avantages` : onglet Avantages (liste puces).

### Services — Informatique (`/services`, `src/pages/services/Services.tsx`)
- `services.breadcrumb` : Accueil > Services > Informatique.
- `services.card.header` : titre principal + champ de recherche.
- `services.card.stats.open-interventions` : texte « Interventions en cours (0) ».
- `services.card.actions.new-request` : bouton « Nouvelle demande d'intervention ».
- `services.quick-access` : `QuickAccess` avec éléments « Informatique » (actif) et « Production ».
- `services.grid.section.<title>` : pour chaque objet `cards` (Général, Matériel…, etc.), carte `LinksCard` correspondante (voir structure générique).

### Services — Production (`/services/production`, `src/pages/services/Production.tsx`)
Structure identique à la page Informatique, avec :
- `services-production.quick-access` (`QuickAccess` actif sur « Production `).
- `services-production.grid.section.<title>` pour chaque catégorie (Achats, Atelier, Mac, Knowbox, Maestro…).

### Catalogue — Accueil / Éditions (`/catalogue`, `src/pages/catalogue/Editions.tsx`)
- `catalogue.breadcrumb` : Accueil > Catalogue > Accueil.
- `catalogue.card.header` : titre + recherche.
- `catalogue.layout.quick-access` : menu `component.catalogue.quick-access.*`.
- `catalogue.editions.grid` : grille d’`EditionCard` (chaque carte possède `component.edition-card.*`).

### Catalogue — Tout le catalogue (`/catalogue/all`, `src/pages/catalogue/CatalogueAll.tsx`)
- `catalogue-all.breadcrumb` : Accueil > Catalogue > Tout le catalogue.
- `catalogue-all.card.header` : titre + recherche.
- `catalogue-all.filters.buttons` : barre de boutons pour les filtres rapides (Toutes, BD, Manga…).
- `catalogue-all.filters.advanced` : déclencheur `component.book-filters.trigger` et contenu associé.
- `catalogue-all.grid` : grille de `BookCard`.

### Catalogue — Kiosque (`/catalogue/kiosque`, `src/pages/catalogue/Kiosque.tsx`)
- `catalogue-kiosque.breadcrumb` : Accueil > Catalogue > Kiosque.
- `catalogue-kiosque.card.header` : titre + recherche.
- `catalogue-kiosque.filters.sort-field` : menu déroulant « Trier par… ».
- `catalogue-kiosque.filters.sort-direction` : bouton sens (Décroissant/Croissant).
- `catalogue-kiosque.filters.publishers` : popover de cases éditeurs.
- `catalogue-kiosque.sections.group-header` : cartes entêtes affichant la valeur triée actuelle.
- `catalogue-kiosque.grid` : cartes `BookCard` avec champ informatif supplémentaire (`infoLabel`, `infoValue`).

### Catalogue — Prochaines offices (`/catalogue/offices`, `src/pages/catalogue/Offices.tsx`)
- `catalogue-offices.breadcrumb` : Accueil > Catalogue > Prochaines offices.
- `catalogue-offices.filters.sort-direction` : bouton « Trier par date » (asc/desc).
- `catalogue-offices.filters.publishers` : popover éditeurs.
- `catalogue-offices.section.office-header` : carte entête « Office {code} : {date} » + info expédition.
- `catalogue-offices.grid` : `BookCard` par ouvrage prévu.

### Catalogue — Dernières nouveautés (`/catalogue/nouveautes`, `src/pages/catalogue/Nouveautes.tsx`)
- `catalogue-nouveautes.filters.sort-order` : bouton « Trier par date » (asc/desc).
- `catalogue-nouveautes.filters.publishers` : popover éditeurs.
- `catalogue-nouveautes.section.release-header` : carte entête « Date de sortie : … ».
- `catalogue-nouveautes.grid` : `BookCard` par nouveauté.

### Catalogue — Couverture à paraître (`/catalogue/couverture-a-paraitre`, `src/pages/catalogue/CouvertureAParaitre.tsx`)
- `catalogue-covers.breadcrumb` : Accueil > Catalogue > Couverture à paraître.
- `catalogue-covers.card.header` : titre + recherche.
- `catalogue-covers.grid` : cartes `CouvertureCard` (EAN, visuel/squelette, message de statut) pour chaque EAN suivi.

### Catalogue — Fiche livre (`/catalogue/book`, `src/pages/catalogue/BookDetails.tsx`)
- `catalogue-book.breadcrumb` : Accueil > Catalogue > {Titre/EAN}.
- `catalogue-book.content` : rendu conditionnel (`loader`, `introuvable`, fiche complète).
- `catalogue-book.hero.cover-card` : carte visuelle couverture + disponibilités + prix + bouton « Ajouter au panier » + indicateurs (EAN, date, stock).
- `catalogue-book.hero.info-card` : bloc titre, contributeurs, badge tranche d’âge, catégories, dropdown « Impression » (imprimer / télécharger / partager).
- `catalogue-book.hero.metadata` : grilles d’attributs issus de `details.metadata` et `details.specifications`.
- `catalogue-book.tabs.resume` : onglet Résumé (texte multi-paragraphes).
- `catalogue-book.tabs.author` : onglet Auteur (biographie).
- `catalogue-book.tabs.read` : onglet Lire (placeholder).
- `catalogue-book.tabs.internet` : onglet Internet (placeholder).
- `catalogue-book.recommendations` : bloc « Vous aimerez aussi » avec onglets (`deja-paru`, `a-paraitre`, `meme-collection`, etc.) et cartes liées.

### Administration (`/administration`, `src/pages/administration/Administration.tsx`)
- `admin.header.title` : titre principal et description introductive.
- `admin.stats.users` : carte « Utilisateurs » (total, actifs/inactifs).
- `admin.stats.groups` : carte « Groupes métiers ».
- `admin.stats.admin-access` : carte « Accès administration ».
- `admin.stats.last-update` : carte « Dernière mise à jour » (date relative + message).
- `admin.layout.user-list` : panneau gauche `component.user-list.*`.
- `admin.layout.access-editor` : panneau droit `component.user-access.*`.
- `admin.audit.header` : en-tête « Activité récente ».
- `admin.audit.entry` : chaque entrée d’audit (acteur, cible, timestamp, message).
  - `admin.audit.entry.group-add` : liste groupes ajoutés.
  - `admin.audit.entry.group-remove` : liste groupes retirés.
  - `admin.audit.entry.override-add/remove/change` : détails des exceptions de permission.
- `admin.audit.empty` : message absence d’activité.

## Liens entre permissions et éléments

Les permissions globales (`src/lib/access-control.ts`) pilotent déjà l’accès aux routes et entrées de sidebar. Pour une gestion plus fine :
- Associer chaque `layout.sidebar.menu.<permission>` directement à la clé `PermissionKey` correspondante.
- L’accès aux pages (`/catalogue/*`, `/services/*`, `/administration`, etc.) peut être contrôlé via les mêmes clés en bloquant le rendu des sections décrites ci-dessus.
- Les sous-sections d’une même page (ex. cartes `LinksCard`, onglets de `BookDetails`) peuvent être reliées à des clés supplémentaires si besoin ; la convention d’identifiants permet d’étendre facilement la matrice de droits.

Cette cartographie peut être importée telle quelle dans une base orientée graphe (noeuds = identifiants, arêtes = appartenance parent/enfant) pour modéliser l’héritage de visibilité et associer ensuite les rôles utilisateurs aux éléments souhaités.
