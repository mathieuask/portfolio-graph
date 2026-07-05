export type Category = "moi" | "etudes" | "projets" | "competences" | "entrepreneuriat";

export interface GraphNode {
  id: string;
  label: string;
  category: Category;
  note: string;
  /** logo/illustration affiché en bandeau dans le panneau de note */
  image?: string;
  /** "contain" pour un logo (fond visible), "cover" pour une illustration plein cadre */
  imageFit?: "contain" | "cover";
}

export interface GraphLink {
  source: string;
  target: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  moi: "#e0def4",
  etudes: "#7aa2f7",
  projets: "#a78bfa",
  competences: "#9ece6a",
  entrepreneuriat: "#e0af68",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  moi: "Moi",
  etudes: "Études",
  projets: "Projets",
  competences: "Compétences",
  entrepreneuriat: "Entrepreneuriat",
};

export const nodes: GraphNode[] = [
  {
    id: "mathieu",
    label: "Mathieu Askamp",
    category: "moi",
    note: `# Mathieu Askamp

Étudiant, développeur et entrepreneur français. Je conçois et publie des applications mobiles et web, de l'idée jusqu'aux stores.

- Études : [[neoma]] · [[berkeley]]
- Activité [[freelance]] : apps mobiles et web pour clients et en édition propre
- Plusieurs apps publiées sur l'App Store et Google Play

**Contact** : mathieu.askamp15@gmail.com`,
  },
  {
    id: "neoma",
    label: "NEOMA Business School",
    category: "etudes",
    image: "/logos/neoma.png",
    imageFit: "contain",
    note: `# NEOMA Business School

Programme Grande École. Formation en management, marketing et stratégie.

- Stage été 2026 : assistant marketing & communication digitale, applications mobiles
- Double culture business + tech : je code ce que je pitche

Lié : [[berkeley]] · [[mathieu]]`,
  },
  {
    id: "berkeley",
    label: "UC Berkeley",
    category: "etudes",
    image: "/logos/berkeley.svg",
    imageFit: "contain",
    note: `# UC Berkeley

Programme académique à l'université de Californie, Berkeley.

Immersion dans l'écosystème tech de la Bay Area : culture produit, vitesse d'exécution, ambition.

Lié : [[neoma]] · [[mathieu]]`,
  },
  {
    id: "freelance",
    label: "Freelance",
    category: "entrepreneuriat",
    note: `# Freelance

Développement d'applications mobiles et web pour des clients et en édition propre.

- [[biznest]] · [[casa-immo]] · [[liscore]] · [[sofia]] · [[riddle]]
- Du cadrage au déploiement sur les stores`,
  },
  {
    id: "biznest",
    label: "Biznest",
    category: "projets",
    note: `# Biznest

Projet freelance en cours.

- Mission : [[freelance]]
- Stack : [[react-native]]`,
  },
  {
    id: "casa-immo",
    label: "Casa Immo",
    category: "projets",
    image: "/logos/casa-immo.png",
    imageFit: "cover",
    note: `# Casa Immo

Application mobile immobilière, **live sur l'App Store** (v2.0.4) et en test fermé sur Google Play.

- Scoring de biens immobiliers avec calculs de rentabilité
- Stack : [[react-native]] · [[supabase]]
- Développée en binôme, distribution client en cours`,
  },
  {
    id: "liscore",
    label: "Link AI",
    category: "projets",
    image: "/logos/link-ai.png",
    imageFit: "cover",
    note: `# Link AI

Application mobile **lancée sur les stores**. Analyse et scoring assisté par [[ia-llm]].

- De l'idée au lancement en autonomie complète
- Exploration d'un modèle par abonnement`,
  },
  {
    id: "sofia",
    label: "Sofia",
    category: "projets",
    image: "/logos/sofia.png",
    imageFit: "cover",
    note: `# Sofia

Compagnon de révision pour le Bac, propulsé par l'[[ia-llm]].`,
  },
  {
    id: "riddle",
    label: "Riddle",
    category: "projets",
    note: `# Riddle

Projet freelance en cours.

- Mission : [[freelance]]`,
  },
  {
    id: "viral-company",
    label: "The Viral Company",
    category: "projets",
    note: `# The Viral Company

Studio de contenu et d'apps virales. Site vitrine live : theviralcompany.app.

- Direction artistique "La Maison"
- App mobile en cours ([[react-native]])
- Lié : [[viral-agency]]`,
  },
  {
    id: "viral-agency",
    label: "The Viral Agency",
    category: "projets",
    note: `# The Viral Agency

Plateforme web pour créateurs et marques : authentification, dashboards, données temps réel.

- Stack : [[nextjs]] · [[supabase]]
- Landing page et dashboards en production
- Lié : [[viral-company]]`,
  },
  {
    id: "react-native",
    label: "React Native / Expo",
    category: "competences",
    note: `# React Native / Expo

Mon outil principal pour le mobile. Plusieurs apps publiées : [[casa-immo]] · [[liscore]] · [[viral-company]].

Maîtrise du cycle complet : dev, builds EAS, review Apple/Google, publication.`,
  },
  {
    id: "nextjs",
    label: "Next.js / React",
    category: "competences",
    note: `# Next.js / React

Web moderne : App Router, server components, déploiement Vercel.

Utilisé sur [[viral-agency]], les sites vitrines, et ce portfolio (le graphe que tu regardes est un canvas force-directed écrit à la main).`,
  },
  {
    id: "supabase",
    label: "Supabase / PostgreSQL",
    category: "competences",
    note: `# Supabase / PostgreSQL

Backend de référence : auth, base de données, edge functions, migrations.

En production sur [[casa-immo]] et [[viral-agency]].`,
  },
  {
    id: "ia-llm",
    label: "IA / LLM",
    category: "competences",
    note: `# IA / LLM

Intégration de modèles de langage dans des produits réels : [[liscore]] et [[sofia]].

Workflows agentiques avec Claude Code au quotidien : c'est comme ça que ce site a été construit.`,
  },
  {
    id: "produit",
    label: "Design produit",
    category: "competences",
    note: `# Design produit

Du concept au store : onboarding, paywalls, psychologie utilisateur, branding. Utilisé sur quasiment tous mes projets.

- [[casa-immo]] · [[liscore]] · [[sofia]] · [[riddle]] · [[biznest]]
- Direction artistique complète sur [[viral-company]] ("La Maison")`,
  },
];

export const links: GraphLink[] = [
  { source: "mathieu", target: "neoma" },
  { source: "mathieu", target: "berkeley" },
  { source: "mathieu", target: "freelance" },
  { source: "mathieu", target: "viral-company" },
  { source: "mathieu", target: "produit" },
  { source: "neoma", target: "berkeley" },
  { source: "freelance", target: "biznest" },
  { source: "freelance", target: "casa-immo" },
  { source: "freelance", target: "liscore" },
  { source: "freelance", target: "sofia" },
  { source: "freelance", target: "riddle" },
  { source: "viral-company", target: "viral-agency" },
  { source: "casa-immo", target: "react-native" },
  { source: "casa-immo", target: "supabase" },
  { source: "liscore", target: "react-native" },
  { source: "liscore", target: "ia-llm" },
  { source: "biznest", target: "react-native" },
  { source: "viral-company", target: "react-native" },
  { source: "viral-company", target: "produit" },
  { source: "viral-agency", target: "nextjs" },
  { source: "viral-agency", target: "supabase" },
  { source: "sofia", target: "ia-llm" },
  { source: "produit", target: "casa-immo" },
  { source: "produit", target: "liscore" },
  { source: "produit", target: "sofia" },
  { source: "produit", target: "riddle" },
  { source: "produit", target: "biznest" },
];
