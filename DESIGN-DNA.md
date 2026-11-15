# CALVIN HOME — Design DNA

Identité visuelle extraite du site existant (`css/style.css`) et conservée telle quelle.
Direction : **luxe contemporain, showroom architectural, artisanat du bois**. Angles droits, matières chaudes,
typographie éditoriale, peu d'effets. Aucun dégradé décoratif.

## 1. Palette

| Rôle | Variable | Valeur |
|---|---|---|
| Fond principal | `--ivory` | `#FAF7F2` |
| Fond crème (sections expertises) | `--cream` | `#F1E9DC` |
| Sable (placeholders, cartes) | `--sand` | `#E6DAC7` |
| Noir profond (hero, contact, pied de page) | `--ink` | `#17120E` |
| Texte courant | `--ink-2` | `#2A211A` |
| Brun bois (accent profond) | `--wood` | `#5E3B22` |
| Marron chaleureux (italiques des titres) | `--brown` | `#7C5233` |
| Bronze (accent principal sur fond clair) | `--bronze` | `#8F6330` |
| Bronze clair (accent sur fond sombre) | `--bronze-l` | `#C39A5E` |
| Texte secondaire | `--muted` | `#6B5E52` |
| Filets | `--line` | `rgba(23,18,14,.14)` |
| WhatsApp | `--wa` | `#1E7F4F` |

Règle : le bronze `#8F6330` est le seul bronze autorisé sur fond clair (contraste de texte suffisant) ; `#C39A5E` uniquement sur fond sombre.

## 2. Typographie (polices auto-hébergées, `assets/fonts/`)

- **Titres** : Cormorant Garamond 400 / 500, romain + *italique* (mot-clé de chaque titre en italique, couleur `--brown` ou `--bronze-l`).
- **Texte et interface** : Jost 400 / 500.
- Hiérarchie : `h1` hero `clamp(2.9rem, 7.4vw, 7rem)` · `h1` catalogue `clamp(2.8rem, 6.4vw, 5.6rem)` · `h2` `clamp(2.3rem, 4.6vw, 4rem)` · `h3` service `clamp(1.9rem, 3vw, 2.8rem)` · texte 17 px (16,5 px mobile) · `.lead` `clamp(1.05rem, 1.4vw, 1.22rem)`.
- Sur-titres (`.eyebrow`) : 12,5 px, capitales, interlettrage `.24em`, filet de 34 px.
- Chiffres alignés (`lnum`) sur tous les titres.

## 3. Dimensions et espacements

- Conteneur `.wrap` : 1360 px max, marge latérale `--pad = clamp(18px, 4.2vw, 64px)`.
- Section `.sec` : `padding: clamp(72px, 10vw, 150px) 0`.
- En-tête fixe : `--hh = 76px` (68 px sous 960 px).
- Grilles : expertises 12 colonnes, alternance texte/photo ; vignettes d'accueil 6 colonnes (4 → 2 en réduction) ; catalogue en maçonnerie 3 colonnes (2 sous 720 px), gouttière 18 px (10 px mobile).

## 4. Formes, bordures, ombres

- **Rayon : 0** partout (boutons, cartes, champs, visionneuse). Seul le bouton WhatsApp flottant est rond.
- Bordures : filets 1 px `--line` ; champs `rgba(23,18,14,.28)`.
- Ombres rares et diffuses : collage `0 30px 60px -30px rgba(23,18,14,.45)` · en-tête défilé `0 6px 24px rgba(23,18,14,.07)` · bouton flottant `0 10px 30px -6px rgba(0,0,0,.45)`.

## 5. Composants

- **Boutons** : hauteur 54 px (44 px en `-sm`), capitales 13,5 px, interlettrage `.16em`, angles droits. `btn-solid` bronze → bois au survol ; `btn-ghost` filet blanc sur fond sombre ; `btn-line` filet noir ; `btn-wa` vert WhatsApp.
- **Liens d'action** `.link-arrow` : capitales, soulignement, la flèche s'écarte au survol.
- **Cartes catalogue** : fond sable, légende qui monte au survol (desktop) ou sous l'image (mobile), pastille « photo/vidéo », bouton lecture rond.
- **Galerie** : maçonnerie CSS, chargement différé, visionneuse plein écran (clavier, balayage tactile, focus piégé).
- **Formulaires** : champs blancs, étiquettes en capitales, erreurs en `#9B2C1C`, retour de validation en bandeau vert/rouge.

## 6. Mouvement

- Courbe CSS : `--ease: cubic-bezier(.22, .61, .36, 1)` (durées 0,3 s interactions · 0,9–1,2 s révélations).
- Courbes GSAP : `power3.out` (entrées), `power4.out` (mots du titre), `power3.inOut` (masques, rideau de page).
- Principes : transform / opacity / clip-path uniquement · une seule lecture par élément · aucune boucle permanente · parallaxe uniquement ≥ 961 px · `prefers-reduced-motion` désactive tout le motion design (le contenu reste visible).

## 7. Responsive

Points de rupture : **1100 px** (vignettes 4 colonnes) · **960 px** (menu plein écran, parallaxe coupée, expertises en une colonne) · **720 px** (catalogue 2 colonnes, légendes sous l'image, hero portrait) · **420 px** (ajustements fins). Zones tactiles ≥ 44 px, `env(safe-area-inset-*)` pris en compte.
