# CALVIN HOME — Site vitrine « Showroom »

Site statique (HTML5 / CSS3 / JavaScript), sans serveur, sans base de données.
Pointe-Noire · Showroom KM4 · République du Congo.

---

## 1. Ouvrir le site (sur un ordinateur)

1. Si le projet est livré en **plusieurs archives ZIP**, extrayez-les **toutes dans le même dossier**
   (acceptez la fusion/le remplacement si votre système le demande). Les fichiers se complètent sans perte :
   la partie 1 contient le site et les images, la partie 2 contient le reste des vidéos.
2. Double-cliquez sur **`index.html`** : le site s’ouvre dans Chrome.
3. Gardez le dossier `assets/` à côté de `index.html` (ne déplacez pas les fichiers séparément).

> Le site fonctionne aussi en double-clic (`file://`) : aucune dépendance externe, polices incluses.

## 2. Mettre le site en ligne (hébergement)

Envoyez **tout le contenu du dossier** (pas le dossier lui-même) à la racine de votre hébergement :

| Hébergement | Méthode |
|---|---|
| **Netlify** (gratuit) | netlify.com → *Add new site → Deploy manually* → glissez le dossier complet. |
| **Vercel** | Importez le dépôt GitHub (framework « Other ») : `vercel.json` fournit la commande de build. |
| **GitHub Pages** | Déposez les fichiers dans un dépôt → *Settings → Pages* → branche `main`, dossier `/ (root)`. |
| **Hébergement mutualisé / cPanel** | Gestionnaire de fichiers → `public_html/` → envoyez tous les fichiers (ou un ZIP puis « Extraire »). |

Aucune configuration serveur n’est nécessaire. Activez le **HTTPS** (gratuit chez les hébergeurs ci-dessus).
Les liens sont tous relatifs : le site fonctionne à la racine d’un domaine comme dans un sous-dossier.

## 3. Structure du projet

```
index.html            Accueil (hero, expertises, aperçu catalogue, showroom, avis, devis)
catalogue.html        Catalogue complet : filtres, pagination, visionneuse photo/vidéo
css/style.css         Styles (palette beige / bois / bronze / noir profond)
js/common.js          Icônes SVG, liens WhatsApp, menu mobile, animations
js/home.js            Hero, avis, formulaires (devis, avis)
js/catalogue.js       Filtres, pagination, visionneuse
js/data.js            LISTE DES 72 ARTICLES (photos + vidéos) — modifiable
js/avis-valides.js    Avis validés ajoutés manuellement (vide au départ)
js/reviews.js         Avis clients via Firestore (REST)
js/firebase-config.js Configuration Firebase (vide par défaut)
firestore.rules       Règles de sécurité Firestore
scripts/gen-config.js Génère la config Firebase au build (Vercel)
vercel.json           Configuration de déploiement
assets/brand/         Logo officiel CALVIN HOME + favicons (tirés du vrai logo)
assets/img/           52 photos pleine taille (WebP)
assets/thumbs/        Miniatures de la grille (WebP, chargement rapide)
assets/video/         20 vidéos (MP4 H.264, optimisées pour le démarrage rapide)
assets/posters/       Images d’aperçu des vidéos
assets/fonts/         Polices Cormorant Garamond et Jost (auto-hébergées)
```

## 4. Ce que l’on peut modifier facilement

- **Numéro WhatsApp / téléphone** : `js/common.js`, objet `CH_CONFIG` en haut du fichier
  (`phoneDisplay` pour l’affichage, `phoneIntl` pour le lien `wa.me`, format international sans `+`).
  Tous les boutons, formulaires et le bouton flottant se mettent à jour automatiquement.
- **Catalogue** : `js/data.js`. Chaque article a `cat` (catégorie), `title` (titre), `file`, `thumb`.
  Catégories : `aluminium`, `bois`, `garnissage`, `decoration`, `construction`, `general`.
  Pour reclasser un article, changez simplement sa valeur `cat`.
  Pour ajouter un article : copiez la photo dans `assets/img/`, une miniature (≈ 640 px) dans `assets/thumbs/`, puis ajoutez une ligne dans `data.js`.
- **Avis clients** : voir la section 6.

## 5. WhatsApp

- Numéro utilisé : **+242 06 452 27 22**, repris des documents fournis (LISEZ-MOI des archives et fiches produit du catalogue). Lien : `https://wa.me/242064522722`.
- **À tester une fois en ligne** : cliquez sur un bouton WhatsApp depuis un téléphone pour confirmer que la conversation s’ouvre bien avec ce numéro.
- Messages préremplis : contact général, devis, renseignements produit (avec le nom et la référence de l’article),
  renseignements sur un service, visite du showroom.
- Les formulaires **n’envoient rien à un serveur** : ils ouvrent WhatsApp avec le message déjà rédigé, que le visiteur envoie lui-même.

## 6. Avis clients (enregistrement réel + validation)

**Mode Firebase (Firestore)** — activé dès que `FIREBASE_API_KEY` et `FIREBASE_PROJECT_ID` sont définies (voir `.env.example`) :
1. Le visiteur envoie nom, note (1–5) et commentaire → un document `reviews` est créé avec `status: "pending"` (API REST Firestore, `js/reviews.js`).
2. Il n'est **jamais affiché** tant que `status` ≠ `"approved"` : les règles `firestore.rules` n'autorisent la lecture publique que des avis approuvés, interdisent toute modification/suppression côté public et valident les champs.
3. Pour publier : console Firebase → Firestore → collection `reviews` → passer `status` à `approved`.

**Configuration à faire (une seule fois)** : créer un projet Firebase + base Firestore, publier `firestore.rules`, enregistrer une application Web, puis ajouter `FIREBASE_API_KEY` et `FIREBASE_PROJECT_ID` dans Vercel (Settings → Environment Variables) et redéployer. Le build exécute `scripts/gen-config.js` qui génère `js/firebase-config.js`.

**Sans configuration (état actuel)** : repli honnête sur WhatsApp — l'avis est préparé dans un message envoyé à CALVIN HOME, qui peut ensuite l'ajouter à `js/avis-valides.js`. Aucune base de données n'est simulée ; l'interface indique le mode réellement actif.

## 7. Informations à compléter / confirmer

- **Adresse précise et horaires du showroom KM4** : non confirmés dans les documents, donc **non affichés**.
  Le site indique qu’ils sont communiqués sur WhatsApp. Quand vous les aurez, ajoutez-les dans `index.html`, section `#showroom`.
- **Classement des articles** : fait d’après ce que l’on voit sur chaque photo/vidéo
  (canapés → Garnissage, pièces aménagées → Décoration, meubles et portes → Bois et meubles, cuisines/chantiers → Construction,
  fenêtres → Aluminium, le reste → « Autres réalisations »). Vérifiez-le et corrigez `cat` dans `data.js` si besoin.
  La catégorie Aluminium ne compte que 2 vidéos : ajoutez des photos de portes/fenêtres/baies vitrées aluminium pour l’enrichir.

## 8. Rapport de fusion des deux archives

- Archives : `CALVIN_HOME_SHOWROOM_PARTIE_1.zip` (65 fichiers) et `…PARTIE_2.zip` (67 fichiers).
- **52 photos identiques dans les deux archives** (comparaison octet par octet) → conservées une seule fois, aucune perte.
- **20 vidéos** : 9 dans la partie 1 + 11 dans la partie 2, aucun doublon → toutes conservées.
- Logo officiel `logo-calvin-home-officiel.jpg` (identique dans les deux) : conservé tel quel (1492 × 672), jamais redessiné ni modifié.
  Les favicons sont un simple recadrage de l’emblème de ce logo.
- Ancien `index.html` et `catalogue.json` : remplacés par la nouvelle refonte (la liste d’articles est reprise dans `js/data.js`).
- **Total : 72 médias, tous visibles dans le catalogue** (6 pages de 12).

## 9. Optimisation et limites techniques

- Images WebP déjà légères ; miniatures dédiées pour la grille ; chargement différé (`loading="lazy"`).
- Vidéos : remuxées sans perte avec `faststart` (lecture immédiate dans Chrome), chargées à la demande.
  Elles sont déjà très compressées (format WhatsApp, 368 × 656 ou 640 × 368 px).
- **Qualité vidéo** : en plein écran sur grand écran, ces petites vidéos apparaissent un peu floues. Pour un rendu « cinéma »,
  remplacez-les par les originaux en haute définition (1080p) du téléphone, avec le même nom de fichier.
- Aucun script externe, aucune police externe, aucun suivi.

## 10. Navigateurs et tests

Tests automatisés Playwright/Chromium (bureau 1366×800 et émulation Pixel 7) : logo, 5 expertises, liens WhatsApp, hero vidéo, menu mobile, devis, validation d’avis, pagination (6 pages), filtres (comptes exacts), visionneuse photo/vidéo, décodage des 20 vidéos, 72 vignettes chargées, console sans erreur, aucune requête en échec.
Le flux d’avis Firestore a été testé avec un réseau simulé (format des requêtes, statut « pending », rendu des avis approuvés) ; il n’a pas pu être testé contre une vraie base Firebase.
