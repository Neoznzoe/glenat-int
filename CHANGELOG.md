Changelog
Toutes les modifications notables de ce projet sont documentees dans ce fichier.

## [0.2026.06.01]
PR / tickets associes : VBE/3197

### Catalogue
- Fiche livre desormais alimentee par Business Central (infos, resume, auteurs, papier, stock).
- Couvertures chargees en parallele, sans ralentir l'affichage des informations.
- Liste des auteurs chargee automatiquement en entier, avec affichage progressif et scroll fluide.

### Performance
- Mise en cache et prechargement des fiches livre pour une navigation plus rapide.

### Technique
- Adaptation au nouveau format de reponse de l'API.
- Resolution automatique de l'environnement API (dev / recette / prod).
- Reparation de la configuration nginx et du build Docker.
