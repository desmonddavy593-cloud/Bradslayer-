# BradSlayer Store

BradSlayer Store est le store PWA de **DevSlayer × Brad Society**. Il référence des applications web et redirige vers leur URL publique, sans stocker d’APK.

## Fonctionnalités

- Interface claire, compacte et mobile-first, inspirée des stores d’applications, avec recherche, catégories, rails horizontaux et navigation basse sur mobile.
- PWA installable : manifeste clair, service worker versionné et bouton **Installer BradSlayer** affiché uniquement quand le navigateur fournit `beforeinstallprompt`.
- Fiches d’applications avec icône, développeur, statistiques, captures, description, bouton principal **Ouvrir**, favori et aide « Ajouter à l’écran d’accueil » pour Android Chrome et iPhone Safari. L’installation d’une app externe reste manuelle dans son propre onglet.
- Comptes développeurs faits maison : inscription, connexion, déconnexion et session par cookie signé avec `SESSION_SECRET`.
- Espace `/developer` : soumission et suivi des apps personnelles, vues/ouvertures sur 7 jours, 30 jours et total, avec mini-graphique quotidien. Les nouvelles apps sont `PENDING` et restent invisibles jusqu’à validation.
- Tracking : vue de fiche dédoublonnée par visiteur, application et fenêtre d’une heure ; ouvertures enregistrées par app et par jour.
- Back-office `/admin` protégé par `ADMIN_PASSWORD` : validation, refus, suppression des apps et des avis, résumé global des vues, ouvertures et apps les plus vues.
- Favoris et apps ouvertes récemment stockés uniquement dans `localStorage`, sans compte, accessibles depuis `/my-apps`.
- Avis visiteurs : pseudo, note de 1 à 5, cookie anonyme unique par app et limitation d’une publication par heure.
- Les neuf apps historiques sont conservées et leur statut existant est `APPROVED` par défaut.

## Nouvelles tables Prisma V3

- `AppEvent` : événements `VIEW` et `OPEN`, visiteur anonyme, app et date.

Les tables déjà présentes (`User`, `App`, `Review`) sont conservées. Aucune table ni colonne existante n’est supprimée. La RLS Supabase devra être activée séparément sur les tables applicatives, notamment `AppEvent`.

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

## Interface mobile V4 inspirée du tutoriel

L’accueil mobile reprend la structure observée dans la vidéo fournie : barre de recherche arrondie, puces horizontales, grands panneaux promotionnels, rayons horizontaux, cinq onglets (`Jeux`, `Applis`, `Recherche`, `Livres`, `Vous`), panneau de profil en bas, notifications, suggestions de recherche et filtres. Les codes de Google Play sont adaptés à BradSlayer : contenu DevSlayer × Brad Society, couleurs de marque et liens vers les apps web. La barre système du téléphone et le chrome natif du navigateur restent contrôlés par Android/iOS et ne peuvent pas être remplacés par le site.

## V4 : navigation et comptes développeurs

La navigation mobile ne contient plus de menu mort : l’en-tête, la cloche, l’avatar, les entrées du menu profil, les cartes et les contrôles des rayons ouvrent des vues ou des pages dédiées. Les pages `/notifications`, `/manage-apps`, `/payments`, `/protection`, `/pass`, `/points`, `/settings`, `/help` et `/developers` sont disponibles.

Les développeurs s’inscrivent désormais avec un pseudo unique et un mot de passe, sans adresse e-mail obligatoire. La colonne `User.username` est ajoutée sans supprimer `User.email`. Les anciens comptes sont complétés progressivement à partir de la partie locale de leur adresse e-mail lors de leur prochaine requête, sans seed de build.

Nouvelles tables V4 : `Announcement`, `AnnouncementRead` et `HelpComment`. Elles devront recevoir leurs politiques RLS Supabase après déploiement.

Les seuls textes de marque visibles dans l’application sont désormais ceux de BradSlayer, DevSlayer et Brad Society ; les libellés hérités de la référence ont été adaptés.

## Recherche, filtres et service worker

L’accueil utilise désormais un seul champ de saisie dans l’en-tête. Le focus ouvre la vue Recherche sans dupliquer le champ ; les résultats et suggestions apparaissent dessous. La recherche vocale n’est affichée que si le navigateur fournit Web Speech API. Les filtres Premium et Enfants, les événements et l’onglet Guides ne sont affichés que lorsqu’ils disposent de données réelles.

Le service worker `bradslayer-v4` utilise le réseau en premier, conserve un repli hors ligne, supprime les anciens caches à l’activation, appelle `skipWaiting` et `clients.claim`, puis recharge la page lorsqu’une nouvelle version prend la main.
