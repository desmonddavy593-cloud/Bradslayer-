# BradSlayer Store

BradSlayer Store est le store PWA de **DevSlayer × Brad Society**. Il référence des applications web et redirige vers leur URL publique, sans stocker d’APK.

## Fonctionnalités

- Interface claire, compacte et mobile-first, inspirée des stores d’applications, avec recherche, catégories, rails horizontaux et navigation basse sur mobile.
- Fiches d’applications avec icône, développeur, statistiques, captures, description et bouton **Ouvrir**.
- Comptes développeurs faits maison : inscription, connexion, déconnexion et session par cookie signé avec `SESSION_SECRET`.
- Espace `/developer` : soumission, édition et suivi des apps personnelles. Les nouvelles apps sont `PENDING` et restent invisibles jusqu’à validation.
- Back-office `/admin` protégé par `ADMIN_PASSWORD` : validation, refus, suppression des apps et suppression des avis.
- Avis visiteurs : pseudo, note de 1 à 5, commentaire, cookie anonyme unique par app et limitation d’une publication par heure.
- Les neuf apps historiques sont conservées et leur statut existant est `APPROVED` par défaut.

## Lancer en local

Prérequis : Node.js 18+, npm et PostgreSQL.

```bash
npm install
cp .env.example .env
# renseigner DATABASE_URL, ADMIN_PASSWORD et SESSION_SECRET
npm run db:push
npm run dev
```

Le build exécute `prisma db push`, `prisma generate`, puis `next build`. Il n’exécute jamais de seed.

## Variables d’environnement

- `DATABASE_URL` : URL PostgreSQL Supabase.
- `ADMIN_PASSWORD` : mot de passe du back-office.
- `SESSION_SECRET` : secret utilisé pour signer les sessions développeurs et admin.

Aucune autre variable n’est nécessaire.

## Déploiement Vercel

Le dépôt GitHub `desmonddavy593-cloud/Bradslayer-` est relié à Vercel : chaque push sur `main` déclenche un déploiement. Les variables ci-dessus doivent être configurées dans Vercel. La commande de build met à jour le schéma avec `prisma db push` sans supprimer les colonnes ou tables existantes et sans seed.
