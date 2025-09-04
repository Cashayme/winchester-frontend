# 🔄 Changements de Configuration - Mode SPA

## Modifications apportées

### 1. **Désactivation du mode static**
- ✅ `ssr: false` - Mode SPA activé
- ✅ Suppression de `target: 'static'`
- ✅ Suppression de la section `generate`

### 2. **Configuration Nitro mise à jour**
- ✅ Proxy API configuré pour le développement
- ✅ Routes `/api` et `/images` proxifiées vers `localhost:4000`
- ✅ Headers CORS gérés côté backend uniquement

### 3. **Configuration runtimeConfig améliorée**
- ✅ URLs dynamiques selon l'environnement
- ✅ Développement : utilise le proxy
- ✅ Production : utilise les URLs directes

### 4. **Scripts npm corrigés**
- ✅ `build` : utilise `nuxt build` (SPA)
- ✅ `generate` : utilise `nuxt generate` (static si nécessaire)

## Avantages du mode SPA

### ✅ **Développement**
- Rechargement à chaud plus rapide
- Proxy API automatique
- Pas de génération statique complexe

### ✅ **CORS**
- Gestion centralisée côté backend
- Pas de problèmes de headers dans les fichiers statiques
- Configuration plus simple

### ✅ **Flexibilité**
- Possibilité de basculer facilement entre SPA et static
- Meilleure gestion des états côté client
- Support complet des fonctionnalités Nuxt

## Structure des URLs

### Développement (`npm run dev`)
```
Frontend: http://localhost:3000
API: http://localhost:3000/api → proxy vers http://localhost:4000/api
Images: http://localhost:3000/images → proxy vers http://localhost:4000/images
```

### Production
```
Frontend: https://winchester-ascendancy.com
API: https://backend.winchester-ascendancy.com/api
Images: https://backend.winchester-ascendancy.com/images
```

## Commandes disponibles

```bash
# Développement avec proxy
npm run dev

# Build pour production (SPA)
npm run build

# Preview du build
npm run preview

# Génération statique (si nécessaire)
npm run generate
```

## Configuration CORS

La gestion CORS est maintenant entièrement côté backend :
- ✅ Configuration dans `backend/src/index.ts`
- ✅ Support pour développement et production
- ✅ Headers appropriés pour les credentials
- ✅ Gestion des requêtes preflight OPTIONS

## Migration depuis le mode static

Si vous aviez des fichiers statiques déployés :
1. **Pas de changement nécessaire** pour les utilisateurs
2. **Le backend gère maintenant le CORS**
3. **Les appels API fonctionnent depuis n'importe quel domaine autorisé**
4. **Plus besoin de régénérer les fichiers statiques pour les changements CORS**

## Dépannage

### Problème : "CORS error" en développement
**Solution :** Vérifier que le backend tourne sur `localhost:4000`

### Problème : "API not found" en production
**Solution :** Vérifier les variables d'environnement `API_BASE_URL`

### Problème : Rechargement lent en développement
**Solution :** Le proxy peut être plus lent que les appels directs, c'est normal
