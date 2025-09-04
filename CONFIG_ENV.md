# 🔧 Configuration Environnement - Frontend Static

## Variables d'environnement nécessaires

Créez un fichier `.env` dans le dossier `frontend/` avec ces variables :

```env
# URLs de l'API backend déployée
API_BASE_URL=https://backend.winchester-ascendancy.com/api
IMAGES_BASE_URL=https://backend.winchester-ascendancy.com/images

# Environnement
NODE_ENV=production
```

## Configuration CSP

La CSP est automatiquement configurée pour permettre :
- ✅ Connexions vers `https://backend.winchester-ascendancy.com`
- ✅ Chargement des polices Google Fonts
- ✅ Images depuis HTTPS
- ✅ Scripts et styles locaux avec `unsafe-inline` (nécessaire pour Nuxt)

## Headers de sécurité

Les headers suivants sont configurés :
- `Content-Security-Policy` : Protection contre XSS et autres attaques
- `X-Frame-Options: DENY` : Empêche le clickjacking
- `X-Content-Type-Options: nosniff` : Protection MIME type
- `X-XSS-Protection` : Protection XSS navigateur
- `Referrer-Policy` : Contrôle des informations referrer

## Déploiement

Après avoir configuré les variables d'environnement :

```bash
# Générer les fichiers statiques
npm run generate

# Les fichiers sont dans .output/public/
# Déployez ce dossier sur votre hébergement static
```
