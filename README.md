# Portfolio — Mathieu Askamp

Portfolio interactif façon graphe de connaissances : un graphe force-directed navigable (canvas 2D écrit à la main, zéro lib de graphe), un panneau de note avec wikilinks et backlinks, et des filtres par catégorie. Responsive, tactile (drag, pan, pinch-zoom).

## Lancer

```bash
npm install
npm run dev
```

## Modifier le contenu

Tout le contenu (nœuds, liens, notes) vit dans un seul fichier : `data/content.ts`.
Ajouter un nœud = un objet dans `nodes` + ses liens dans `links`. Les `[[id]]` dans les notes deviennent des liens cliquables.

## Reprendre ce projet

Le code est libre (licence MIT) : forkez, remplacez `data/content.ts` par votre propre parcours, déployez sur Vercel. Aucune dépendance hors Next.js et Tailwind.

## Stack

Next.js (App Router) · Tailwind · Canvas 2D.
