// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false, // Mode SPA pour éviter les problèmes de génération statique
  modules: ['@nuxt/ui'],
  css: ['./assets/css/main.css', './assets/css/loading.css'],

  // Configuration des métadonnées SEO
  app: {
    head: {
      title: 'Winchester Ascendancy - Gestionnaire de Coffres',
      meta: [
        // Métadonnées de base
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Winchester Ascendancy - Système de gestion avancé pour vos coffres et inventaires. Interface moderne et intuitive pour organiser vos items avec style steampunk.'
        },
        {
          name: 'keywords',
          content: 'coffres, inventaire, gestion, items, steampunk, discord, gestionnaire, organisation'
        },
        { name: 'author', content: 'Winchester Ascendancy Team' },
        { name: 'robots', content: 'noindex, nofollow' }, // Désactiver l'indexation en développement

        // Métadonnées Open Graph (Facebook, LinkedIn)
        { property: 'og:title', content: 'Winchester Ascendancy - Gestionnaire de Coffres' },
        {
          property: 'og:description',
          content: 'Système de gestion avancé pour vos coffres de guilde Dune Awakening.'
        },
        { property: 'og:image', content: '/og-image.jpg' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Winchester Ascendancy' },
        { property: 'og:locale', content: 'fr_FR' },

        // Métadonnées Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Winchester Ascendancy - Gestionnaire de Coffres' },
        {
          name: 'twitter:description',
          content: 'Système de gestion avancé pour vos coffres de guilde Dune Awakening.'
        },
        { name: 'twitter:image', content: '/og-image.jpg' },
        { name: 'twitter:site', content: '@winchester_asc' },

        // Métadonnées de thème et couleurs
        { name: 'theme-color', content: '#7a1f1f' },
        { name: 'msapplication-TileColor', content: '#7a1f1f' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Winchester Ascendancy' }
      ],
      link: [
        // Favicon et icônes
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },

        // Polices et ressources externes
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap'
        }
      ]
    }
  },

  // Configuration Nitro pour le développement avec proxy API
  nitro: {
    port: 3000,
    host: '0.0.0.0',
    devProxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '/api')
      },
      '/images': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        prependPath: true
      }
    }
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NODE_ENV === 'production'
        ? 'https://backend.winchester-ascendancy.com/api'
        : '/api', // Utilise le proxy en développement
      imagesBase: process.env.NODE_ENV === 'production'
        ? 'https://backend.winchester-ascendancy.com/images'
        : '/images' // Utilise le proxy en développement
    },
  },
});
