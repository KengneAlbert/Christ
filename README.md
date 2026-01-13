# Christ Le Bon Berger — Guide Développeur

Ce dépôt contient l’application web du site Christ Le Bon Berger (Vite + React + TypeScript + Tailwind + Supabase). Ce guide explique comment cloner, configurer, lancer en local, builder et déployer le projet pour que tout nouveau développeur puisse être opérationnel rapidement.

## Prérequis

- Node.js 18 ou 20 (LTS recommandé)
- npm 9+ (ou pnpm/yarn si vous préférez, mais les scripts utilisent npm)
- Un compte Supabase (pour les données, l’auth, le storage)
- Optionnel: Compte Vercel (déploiement recommandé)

Vérifier vos versions:

```bash
node -v
npm -v
```

## Installation

```bash
git clone <url-du-repo>
cd Christ
npm install
```

## Configuration des variables d’environnement

Créez un fichier `.env` à la racine en vous inspirant de `.env.example` (ajouté au dépôt). Valeurs attendues:

```
# URL publique du site (utilisée pour SEO, sitemap, OG, etc.)
VITE_SITE_URL=https://www.christ-le-bon-berger.com

# Clés Supabase (projet requis)
VITE_SUPABASE_URL=https://<votre-projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<clé_anon>

# Activer le proxy PDF côté /api (utile en prod sur Vercel). En local, laissez false.
VITE_PDF_PROXY=false
```

Notes:

- Les pages utilisent le SEO dynamique (Open Graph/Twitter) basé sur `VITE_SITE_URL`.
- Si `VITE_PDF_PROXY=true`, les PDF passent par l’endpoint `/api/pdf-proxy` (présent dans ce repo). En local via Vite, cet endpoint n’existe pas; gardez `false` en dev.

## Lancer le projet en local

```bash
npm run dev
```

Par défaut, l’app tourne sur http://localhost:5173. Le routage est en mode SPA; l’historique est géré par le serveur de dev Vite.

## Scripts utiles

- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build` (construit le site et génère le sitemap via `scripts/build-sitemap.ts`)
- Preview: `npm run preview` (sert le build localement)

## Structure du projet (aperçu)

- `src/` code applicatif React/TS
  - `components/` composants UI, SEO, modals, etc.
  - `pages/` pages principales (About, Actions, Team, Contact, Médiathèque, etc.)
  - `services/` intégrations (SEO, email, storage, cache, cookies, CSRF)
  - `lib/` clients Supabase (navigateur et Node pour scripts)
  - `hooks/` hooks personnalisés (auth, inactivité, etc.)
- `api/` endpoints serverless (Vercel) comme `pdf-proxy.ts` et `sitemap.xml.ts`
- `public/` assets statiques (favicon/logo/manifest, 404.html, robots.txt)
- `scripts/` utilitaires (ex: génération sitemap)
- `supabase/` fonctions edge, migrations, config

## Supabase (dév rapide)

1. Créez un projet Supabase et récupérez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
2. Renseignez-les dans `.env`.
3. Tables utilisées (extraits): `media_items`, `media_images`, `newsletter_subscribers`, `newsletters`, `admin_users`.
4. Pour initialiser le schéma, utilisez vos migrations existantes ou l’interface Supabase (les migrations exemple sont sous `supabase/migrations/`).

Astuce: En dev, vous pouvez désactiver des fonctionnalités si les tables ne sont pas encore prêtes (par ex. limiter l’accès à la médiathèque).

## Déploiement (Vercel recommandé)

- Ce dépôt inclut `vercel.json` avec des en-têtes de sécurité (HSTS, CSP, etc.).
- Les routes `api/` sont déployées comme fonctions serverless automatiquement.
- Étapes typiques:

```bash
# depuis la racine du projet
vercel
vercel env pull .env
# Configurez les variables d’environnement Vercel en prod (équivalentes à votre .env)
vercel deploy --prod
```

Important:

- Assurez-vous que `VITE_SITE_URL` en prod pointe vers l’URL canonique (ex: https://www.christ-le-bon-berger.com).
- Si vous activez `VITE_PDF_PROXY=true` en prod, l’endpoint `/api/pdf-proxy` doit être autorisé par la CSP (déjà géré dans `vercel.json`).

## Notes SEO & Accessibilité

- Les balises OG/Twitter et la balise canonique sont gérées via `SEOHead` + `seoService`.
- Sitemap dynamique: `/api/sitemap.xml` (fallback statique intégré si besoin). `robots.txt` pointe dessus.
- Favicons/manifest configurés (Google affichera le logo au lieu de l’icône générique).
- Modales conformes (rôles ARIA, focus management) pour une meilleure accessibilité.

## Débogage courant

- Erreurs Supabase: vérifiez `.env` et les tables nécessaires.
- PDF non chargé en local: mettez `VITE_PDF_PROXY=false` ou ouvrez directement l’URL PDF.
- SEO incohérent: vérifiez `VITE_SITE_URL` et l’utilisation de `SEOHead` sur les pages.

## Contribution

- Respectez la base de code (TypeScript strict, hooks React conformes aux règles, `eslint` propre).
- Avant PR: `npm run lint` et, si applicable, `npm run build`.

Bon dev !
