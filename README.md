# BradSlayer Store

BradSlayer Store est le catalogue d’applications web de **DevSlayer × Brad Society**. La V1 référence des PWA hébergées ailleurs : le store présente chaque fiche et le bouton **Ouvrir** redirige vers l’application. Aucun APK n’est stocké.

## Fonctionnalités V1

- Accueil avec sélection à la une, tendances, nouveautés et recherche.
- Catégories : Outils, Jeux, Éducation, Finance, Transport, Actualités, Communauté.
- Fiche d’application avec icône, développeur, description, captures, note et lien externe.
- Page À propos pour DevSlayer et Brad Society.
- Back-office `/admin` protégé par `ADMIN_PASSWORD` pour ajouter, modifier et supprimer des apps.
- PWA installable avec `manifest.webmanifest`, icône et service worker.
- Neuf applications fictives incluses dans `prisma/seed.ts`.

## Lancer en local

Prérequis : Node.js 18+, npm et une base PostgreSQL.

```bash
npm install
cp .env.example .env
# renseigner DATABASE_URL et ADMIN_PASSWORD
npx prisma db push
npm run db:seed
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000). Si la base n’est pas encore disponible, l’interface affiche automatiquement le catalogue de démonstration ; les écritures admin nécessitent une base accessible.

## Variables d’environnement

- `DATABASE_URL` : URL PostgreSQL, fournie par Railway.
- `ADMIN_PASSWORD` : mot de passe du back-office. Ne jamais le committer.
- `NEXT_PUBLIC_STORE_URL` : URL publique facultative du store.

## Déploiement Railway

1. Créer un projet Railway et ajouter un service PostgreSQL.
2. Ajouter un service **GitHub Repo** lié à `desmonddavy593-cloud/Bradslayer-`.
3. Configurer les variables `DATABASE_URL` (référence Railway du service PostgreSQL), `ADMIN_PASSWORD` et éventuellement `NEXT_PUBLIC_STORE_URL`.
4. Railway détecte automatiquement Next.js via le `package.json` et utilise `npm run build` puis `npm start`.
5. Après le premier déploiement, exécuter `npx prisma db push` puis `npm run db:seed` dans un shell Railway, ou ajouter une étape de release selon votre configuration.

Le projet est prêt pour les déploiements automatiques à chaque push sur `main`.

## V2 prévue

Paiements, comptes utilisateurs, comptes développeurs, soumission d’applications, analytics et avis utilisateurs pourront être ajoutés dans une prochaine version.
