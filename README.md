# ✈ Aelia Travel — Plateforme Laravel + React

Plateforme complète : site vitrine + module **eVisa en ligne** + module **Omra** (en arabe) + **Dashboard Admin** avec KPIs, contenu entièrement personnalisable, anti-spam reCAPTCHA, et gestion de logo multi-versions.

Construit en **Laravel 11** (PHP) + **React** (via Inertia.js) + **MySQL**, conçu pour un hébergement **Octenium** (PHP natif, sans dépendance à Node.js en production).

---

## 📁 Structure du projet

```
aelia-laravel/
├── app/
│   ├── Console/Commands/CreateAdminCommand.php   → php artisan admin:create
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/          → Contrôleurs publics (eVisa, Omra, Contact, Auth, Config)
│   │   │   └── Admin/        → Contrôleurs admin protégés (CRUD complet)
│   │   └── Middleware/HandleAdminAuth.php
│   ├── Models/                → Tous les modèles Eloquent
│   ├── Mail/                  → Mailables (alertes eVisa/Omra)
│   └── Support/                → RefGenerator, RecaptchaVerifier
│
├── database/
│   ├── migrations/             → Schéma complet (identique à l'ancien MySQL)
│   └── seeders/SiteContentSeeder.php  → Contenu par défaut éditable
│
├── resources/
│   ├── js/
│   │   ├── Pages/               → Home.jsx, Evisa.jsx, Omra.jsx (React + Inertia)
│   │   ├── Pages/Admin/         → Dashboard complet (SPA React Router)
│   │   ├── Layouts/MainLayout.jsx
│   │   ├── Components/Logo.jsx  → Logo intelligent (3 versions + fallback texte)
│   │   └── Hooks/                → useSiteConfig, useRecaptcha, usePageContent
│   └── views/
│       ├── app.blade.php         → Layout racine Inertia
│       └── emails/                → Templates email
│
├── routes/web.php               → Toutes les routes (pages + API)
├── .env.example
└── GUIDE_IMPLEMENTATION.md       → Guide pas-à-pas pour la mise en ligne
```

---

## 🚀 Démarrage rapide

```bash
# 1. Dépendances PHP
composer install

# 2. Dépendances JS + build des assets React
npm install
npm run build          # ou `npm run dev` en local pour le hot-reload

# 3. Configuration
cp .env.example .env
php artisan key:generate
# → éditez .env (MySQL, mail, reCAPTCHA)

# 4. Base de données
php artisan migrate
php artisan db:seed --class=SiteContentSeeder

# 5. Stockage public (uploads)
php artisan storage:link

# 6. Compte administrateur
php artisan admin:create
```

Le site est servi via le dossier `public/` (document root standard PHP).

**👉 Pour la mise en ligne sur Octenium, suivez `GUIDE_IMPLEMENTATION.md`.**

---

## 🎨 Fonctionnalités clés

### Contenu 100% personnalisable depuis le dashboard
Chaque section du site (hero, services, statistiques, "pourquoi nous choisir", contact...) est stockée en base (table `site_content`) et éditable depuis `/admin/content/{home|evisa|omra}` — textes, titres, listes d'éléments, sans toucher au code.

### Logo en 3 versions
Depuis `/admin/logos` : téléversez vos logos couleur / blanc / noir-et-blanc. Le composant `Logo.jsx` choisit automatiquement la bonne version selon le contexte (header sombre → blanc, footer → blanc, etc.) et retombe sur le texte stylisé "✈ Aelia Travel" si aucune version n'est encore fournie.

### Anti-spam Google reCAPTCHA v3
Intégré de façon invisible sur les 3 formulaires sensibles : contact, demande eVisa, pré-réservation Omra. Vérifié côté serveur (`RecaptchaVerifier`) avec score minimum configurable.

### Module eVisa
Catalogue de pays avec drapeaux, wizard de demande en 3 étapes, documents dynamiques par option, prix d'achat/vente avec bénéfice calculé.

### Module Omra (عمرة)
Interface 100% arabe (RTL), départs avec grille tarifaire complète (adulte/enfant/bébé × type de chambre), simulateur de prix, pré-réservation avec voyageurs nommés et scan passeport, partenaires masqués côté public.

### Dashboard Admin
CRUD complet sur toutes les entités, KPIs (CA, bénéfices, statuts), gestion des messages de contact, paramètres généraux.

---

## 🔧 Compatibilité avec l'ancienne version Node.js

Le schéma de base de données est **identique** à l'ancienne version (mêmes noms de tables et colonnes). Si vous aviez déjà des données importées (pays eVisa, offres Omra, compte admin), elles restent utilisables sans migration de données — voir `GUIDE_IMPLEMENTATION.md` section 8.

Nouvelles tables ajoutées par rapport à l'ancienne version : `site_content`, `site_media`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs` (infrastructure standard Laravel).
