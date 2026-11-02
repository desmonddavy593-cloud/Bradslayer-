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


## V3 — Modération et communauté

Le back-office `/admin` dispose maintenant d’un menu latéral responsive : tableau de bord, applications, validation, utilisateurs, signalements, apps refusées, statistiques, annonces/guides et messages d’aide. Les routes admin vérifient la session signée avec `SESSION_SECRET` et restent protégées par `ADMIN_PASSWORD`.

La fiche d’application propose désormais **J’aime** (un vote par visiteur et par app) et **Signaler** avec les motifs App cassée, Contenu dangereux, Arnaque ou fausse app et Autre. Le suivi accepte aussi l’événement `DOWNLOAD`, affiché à 0 tant que les fichiers d’apps ne sont pas disponibles.

### Schéma ajouté

- Colonnes optionnelles sur `User` : `suspendedAt`.
- Colonnes optionnelles sur `App` : `rejectionReason`, `reviewedAt`, `hiddenAt`.
- Nouvelle table `AppLike` : app, visiteur anonyme, date, unicité app + visiteur.
- Nouvelle table `Report` : app, motif, message facultatif, visiteur anonyme, statut et date.
- Nouvelle table `AdminLog` : action, cible et date.

Le fichier `prisma/supabase-rls.sql` contient l’activation RLS et les politiques minimales à appliquer dans Supabase. Il n’est pas lancé automatiquement par `prisma db push`, afin de ne pas rendre le build destructif. Les colonnes sont toutes facultatives ou dotées d’une valeur par défaut ; aucune donnée existante n’est supprimée.

La V3 laisse encore à compléter côté produit : graphiques journaliers détaillés sur 7/30/90 jours, export CSV, vraie vue séparée Visiteurs, masquage d’app dans toutes les listes publiques et workflow de refus avec écran dédié.


## APK Android et installation

Les développeurs peuvent importer un fichier `.apk` de 50 Mo maximum depuis `/developer`. Le navigateur vérifie l’extension, la taille et la signature ZIP `PK`, calcule l’empreinte SHA-256, demande une URL d’envoi signée au serveur puis envoie directement le fichier dans le bucket privé Supabase `apks`. Le fichier ne transite pas par une route Next.js/Vercel.

Après validation admin, la fiche publique affiche **Installer l’application**. Le serveur vérifie le statut de l’app, enregistre au plus un événement `DOWNLOAD` par visiteur et par heure et fournit une URL de téléchargement signée de 60 secondes. Le navigateur lit le flux progressivement, affiche le pourcentage et enregistre le fichier sous le nom de l’application.

Nouvelles colonnes facultatives sur `App` : `apkPath`, `apkSize`, `apkSha256`, `apkOriginalName`, `versionName`. Aucune table supplémentaire n’est utilisée pour les APK. Les variables serveur nécessaires sont `SUPABASE_URL` et `SUPABASE_SECRET_KEY`; cette dernière n’est jamais envoyée au navigateur.

À vérifier dans l’environnement Vercel/Supabase : appliquer la migration Prisma avec la vraie `DATABASE_URL`, confirmer le bucket privé `apks` et tester les endpoints signés avec les variables `SUPABASE_URL` et `SUPABASE_SECRET_KEY`. Ces opérations réseau Supabase n’ont pas pu être testées avec un stockage de production depuis le sandbox.
