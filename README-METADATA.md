# 📋 Métadonnées SEO - Winchester Ascendancy

## 🎯 Configuration Complète des Métadonnées

### ✅ Métadonnées Implémentées

#### **1. Métadonnées de Base**
- ✅ Titre du site : "Winchester Ascendancy - Gestionnaire de Coffres"
- ✅ Description SEO optimisée
- ✅ Mots-clés pertinents
- ✅ Auteur et informations de contact
- ✅ Configuration robots.txt (noindex pendant développement)

#### **2. Open Graph (Facebook, LinkedIn)**
- ✅ Titre Open Graph personnalisé
- ✅ Description optimisée pour les réseaux sociaux
- ✅ Image Open Graph (placeholder créé)
- ✅ URL canonique
- ✅ Type de contenu (website)
- ✅ Nom du site
- ✅ Locale française (fr_FR)

#### **3. Twitter Cards**
- ✅ Carte Twitter de grande taille
- ✅ Titre et description Twitter
- ✅ Image Twitter
- ✅ Compte Twitter (@winchester_asc)

#### **4. Métadonnées Techniques**
- ✅ Theme color (#7a1f1f - rouge steampunk)
- ✅ Apple Touch Icons
- ✅ Web App Manifest
- ✅ Préconnexion aux polices Google
- ✅ Sécurité (XSS, Frame Options, etc.)

#### **5. Métadonnées par Page**
- ✅ Page Coffres : Métadonnées spécifiques
- ✅ Page Login : Métadonnées + noindex
- ✅ Page Logs : Métadonnées d'activité

### 🎨 Images à Créer

Pour optimiser complètement le SEO, créez ces images :

#### **Images Open Graph (1200x630px)**
- `public/og-image.jpg` - Image principale
- `public/og-chests.jpg` - Image pour la page coffres
- `public/og-login.jpg` - Image pour la page login
- `public/og-logs.jpg` - Image pour la page logs

#### **Icônes PWA**
- `public/apple-touch-icon.png` (180x180px)
- `public/android-chrome-192x192.png` (192x192px)
- `public/android-chrome-512x512.png` (512x512px)

### 🚀 Utilisation

Les métadonnées sont automatiquement appliquées par Nuxt.js :

```html
<!-- Généré automatiquement -->
<meta property="og:title" content="Winchester Ascendancy - Gestionnaire de Coffres" />
<meta property="og:description" content="..." />
<meta name="twitter:card" content="summary_large_image" />
```

### 📊 Avantages SEO

- ✅ **Meilleur référencement** sur Google
- ✅ **Partages optimisés** sur Facebook/LinkedIn
- ✅ **Aperçu Twitter** amélioré
- ✅ **PWA prête** avec manifest
- ✅ **Sécurité renforcée** avec headers HTTP

### 🔧 Configuration Robots

Actuellement configuré pour le développement :
```html
<meta name="robots" content="noindex, nofollow" />
```

**À changer en production :**
```html
<meta name="robots" content="index, follow" />
```

### 🎯 Prochaines Étapes

1. Créer les vraies images Open Graph
2. Générer les icônes PWA
3. Tester les partages sur réseaux sociaux
4. Activer l'indexation en production
5. Ajouter Google Analytics si nécessaire
