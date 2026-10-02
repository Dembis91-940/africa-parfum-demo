# Africa Parfum

Présentation de parfumerie : six références réelles, photographies originales des maisons, Scrollcraft, animations Remotion et sélection personnelle.

**Le site GitHub Pages est une vitrine permanente. Le conseiller Hermes est connecté dans la version locale uniquement.** GitHub Pages ne peut pas exécuter le service Python Hermes. Aucun paiement ou stock réel.

## Version locale

- Node 22+, `npm ci`, puis `npm run dev`.
- Copier `.env.example` vers `.env.local` et générer un jeton aléatoire pour `HERMES_BRIDGE_TOKEN`.
- `HERMES_BRIDGE_URL=http://127.0.0.1:8788/chat`.
- Exécuter `scripts/hermes-bridge.py` avec le Python de l’installation Hermes. Adapter `HERMES_SOURCE` si nécessaire.
- Les accès fournisseur sont résolus par Hermes ; ne jamais copier ses secrets dans le navigateur ou le dépôt.
- Dans le navigateur, demander « Montre-moi Baccarat Rouge 540 », « Ouvre sa fiche ».
- Le microphone nécessite un navigateur compatible et une autorisation explicite. Repli texte disponible.

## GitHub Pages

`npm run build:github` génère `github-dist/`. Le contenu publié est dans `docs/` pour GitHub Pages (branche main).

## Limites

Les silhouettes 3D inventées ont été supprimées. Les photographies montrent les vrais flacons. Leur provenance et les empreintes SHA256 sont dans `public/products/sources.json`. Aucun modèle 3D fidèle validé n’est disponible dans ce projet ; aucune rotation 3D n’est promise. Les marques sont citées sans affiliation. Les fiches renvoient aux maisons. Aucun prix, stock, achat ou commande. La sélection ne persiste pas après fermeture. Le conseiller local utilise les classes Hermes AIAgent sans outils système ni mémoire personnelle. Pour une conversation à distance, déployer un service Hermes isolé derrière authentification, limiter le débit et relier un backend HTTPS au site ; ne jamais publier le relais personnel brut.

## Vérifications

TypeScript ; demande réelle à Hermes et sélection automatique testées dans le navigateur ; catalogue WebMCP, sélection valide et identifiant invalide ; ouverture de fiche et ajout à la sélection. Microphone humain non testé automatiquement.


### Scrollcraft

Le moteur officiel Scrollcraft (MIT, Nate Herk) est fourni sans modifications dans `public/scrollcraft`. Les plans du flacon, le sillage par notes, le catalogue et la sélection sont du code propre à Africa Parfum. Le bouton « Réduire les animations » conserve tous les contenus et retire les séquences supplémentaires. La préférence système est également respectée. Les modifications du filtre recalculent la mise en page sans remonter le moteur.
