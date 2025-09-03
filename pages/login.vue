<template>
  <div class="min-h-screen" style="
    background:
      radial-gradient(1200px 700px at 80% -10%, rgba(160,31,31,0.08), transparent 60%),
      radial-gradient(900px 600px at 15% 120%, rgba(138,92,246,0.05), transparent 55%),
      linear-gradient(180deg, #0b0d12 0%, #0e1219 100%);
  ">
    <!-- Écran de connexion -->
    <div v-if="!user" class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <!-- En-tête avec blason et titre -->
        <div class="text-center mb-8">
          <!-- Blason Winchester avec titre superposé -->
          <div class="relative mb-6">
            <img
              src="/winchester_shield_transparent.png"
              alt="Blason Winchester Ascendancy"
              class="w-64 h-64 mx-auto filter drop-shadow-lg shield-animation object-contain"
            />
            <!-- Effet de halo autour du blason -->
            <div class="absolute inset-0 w-64 h-64 mx-auto rounded-full bg-red-500/20 blur-xl -z-10"></div>

            <!-- Titre superposé sur le blason -->
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
              <h1 class="text-4xl font-display font-bold title-gradient-dark mb-2 drop-shadow-2xl">
                Winchester Ascendancy
              </h1>
            </div>
          </div>

          <!-- Espace pour compenser la superposition -->
          <div class="h-8"></div>

          <!-- Sous-titre -->
          <p class="text-sm text-gray-400 font-medium tracking-wide uppercase">
            Gestionnaire de Coffres
          </p>
        </div>

        <!-- Carte de connexion -->
        <UCard class="panel brushed ring-blood">
          <template #header>
            <div class="text-center">
              <UIcon name="i-mdi-shield-account" class="w-12 h-12 mx-auto mb-3 text-blood-400" />
              <h2 class="text-xl font-bold text-white font-display">
                Accès Sécurisé
              </h2>
              <p class="text-sm text-gray-400 mt-2">
                Authentification requise pour continuer
              </p>
            </div>
          </template>

          <div class="space-y-6">
            <!-- Message d'erreur si présent -->
            <UAlert
              v-if="errorMessage"
              color="red"
              variant="subtle"
              :title="errorMessage"
              icon="i-mdi-alert-circle"
              class="border-red-500/20"
            />

            <!-- Bouton Discord (inchangé) -->
            <div class="text-center">
              <button
                @click="loginWithDiscord"
                class="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white border-none rounded-lg px-4 py-3 text-base font-medium cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg w-full"
              >
                <UIcon
                  name="i-mdi-discord"
                  class="w-5 h-5 flex-shrink-0"
                />
                Se connecter avec Discord
              </button>
            </div>

            <!-- Informations supplémentaires -->
            <div class="border-t border-[rgba(255,255,255,0.1)] pt-4">
              <div class="text-center space-y-2">
                <p class="text-xs text-gray-500">
                  🔒 Connexion sécurisée via Discord OAuth
                </p>
                <p class="text-xs text-gray-500">
                  👥 Accès réservé aux membres autorisés
                </p>
              </div>
            </div>
          </div>
        </UCard>


      </div>
    </div>

    <!-- Écran de chargement -->
    <div v-else-if="loading" class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <!-- En-tête avec blason -->
        <div class="text-center mb-8">
          <div class="relative mb-6">
            <img
              src="/winchester_shield_transparent.png"
              alt="Blason Winchester Ascendancy"
              class="w-40 h-40 mx-auto filter drop-shadow-lg opacity-60 shield-animation object-contain"
            />
            <div class="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-red-500/20 blur-xl -z-10"></div>
          </div>
          <h1 class="text-3xl font-display font-bold title-gradient mb-2">
            Winchester Ascendancy
          </h1>
          <div class="bar-copper w-24 mx-auto"></div>
        </div>

        <!-- Carte de chargement -->
        <UCard class="panel brushed ring-blood">
          <div class="text-center">
            <div class="relative mb-6">
              <UIcon name="i-mdi-loading" class="w-16 h-16 mx-auto text-blood-400 animate-spin" />
              <div class="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-blood-500/20 blur-lg"></div>
            </div>

            <h2 class="text-xl font-bold text-white font-display mb-2">
              Vérification en cours...
            </h2>
            <p class="text-sm text-gray-400 mb-6">
              Validation de votre session et autorisations Discord
            </p>

            <div class="space-y-4">
              <div class="flex items-center gap-3 justify-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span class="text-sm text-gray-300">Connexion Discord</span>
              </div>
              <div class="flex items-center gap-3 justify-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                <span class="text-sm text-gray-300">Validation du profil</span>
              </div>
              <div class="flex items-center gap-3 justify-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                <span class="text-sm text-gray-300">Vérification des rôles</span>
              </div>
              <div class="flex items-center gap-3 justify-center">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" style="animation-delay: 0.6s"></div>
                <span class="text-sm text-gray-300">Accès autorisé</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Écran d'accès refusé -->
    <div v-else-if="!hasAccess" class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <!-- En-tête avec blason -->
        <div class="text-center mb-8">
          <div class="relative mb-6">
            <img
              src="/winchester_shield_transparent.png"
              alt="Blason Winchester Ascendancy"
              class="w-40 h-40 mx-auto filter drop-shadow-lg opacity-40 shield-animation object-contain"
            />
            <div class="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-red-500/20 blur-xl -z-10"></div>
          </div>
          <h1 class="text-3xl font-display font-bold text-gray-400 mb-2">
            Winchester Ascendancy
          </h1>
          <div class="bar-copper w-24 mx-auto opacity-50"></div>
        </div>

        <!-- Carte d'accès refusé -->
        <UCard class="panel brushed ring-blood">
          <template #header>
            <div class="text-center">
              <div class="relative mb-4">
                <UIcon name="i-mdi-shield-off" class="w-12 h-12 mx-auto text-red-400" />
                <div class="absolute inset-0 w-12 h-12 mx-auto rounded-full bg-red-500/20 blur-lg"></div>
              </div>
              <h2 class="text-xl font-bold text-white font-display">
                Accès Refusé
              </h2>
              <p class="text-sm text-gray-400 mt-2">
                Autorisation insuffisante
              </p>
            </div>
          </template>

          <div class="text-center space-y-6">
            <p class="text-gray-400">
              Vous n'avez pas les autorisations nécessaires pour accéder à cette application.
            </p>

            <UAlert
              color="amber"
              variant="subtle"
              icon="i-mdi-shield-alert"
              class="border-amber-500/20"
            >
              <template #title>
                Rôle requis sur le serveur Discord
              </template>
              Contactez un administrateur pour obtenir les permissions nécessaires.
            </UAlert>

            <div class="border-t border-[rgba(255,255,255,0.1)] pt-4">
              <UButton
                @click="logout"
                icon="i-mdi-logout"
                color="gray"
                variant="outline"
                class="w-full"
                size="lg"
              >
                Retour à la connexion
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Redirection automatique vers l'application -->
    <div v-else class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <!-- En-tête avec blason -->
        <div class="text-center mb-8">
          <div class="relative mb-6">
            <img
              src="/winchester_shield_transparent.png"
              alt="Blason Winchester Ascendancy"
              class="w-40 h-40 mx-auto filter drop-shadow-lg shield-animation object-contain"
            />
            <div class="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-green-500/20 blur-xl -z-10"></div>
          </div>
          <h1 class="text-3xl font-display font-bold title-gradient mb-2">
            Winchester Ascendancy
          </h1>
          <div class="bar-copper w-24 mx-auto"></div>
        </div>

        <!-- Carte de succès -->
        <UCard class="panel brushed ring-blood">
          <div class="text-center">
            <div class="relative mb-6">
              <UIcon name="i-mdi-check-circle" class="w-16 h-16 mx-auto text-green-400" />
              <div class="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-green-500/20 blur-lg"></div>
            </div>

            <h2 class="text-xl font-bold text-white font-display mb-2">
              Authentification réussie !
            </h2>
            <p class="text-sm text-gray-400 mb-6">
              Redirection vers l'application...
            </p>

            <div class="space-y-4">
              <div class="relative">
                <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blood-500 to-blood-400 rounded-full animate-pulse"
                       style="width: 100%; animation: progress 2s ease-in-out;"></div>
                </div>
              </div>

              <p class="text-xs text-gray-500">
                Préparation de votre espace de travail...
              </p>
            </div>
          </div>
        </UCard>


      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes progress {
  0% { width: 0%; }
  100% { width: 100%; }
}

/* Animation d'apparition du blason */
@keyframes shield-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-10deg);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.shield-animation {
  animation: shield-appear 1s ease-out;
}

/* Animation des points de chargement */
@keyframes dot-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.dot-pulse {
  animation: dot-pulse 2s ease-in-out infinite;
}

/* Effet de halo pour les icônes */
.icon-glow {
  filter: drop-shadow(0 0 8px currentColor);
}

/* Nouveau gradient rouge subtil pour le titre */
.title-gradient-dark {
  background: linear-gradient(135deg, #4a0e0e, #8b1a1a, #652121);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 4px rgba(139, 26, 26, 0.3));
}
</style>

<script setup lang="ts">
// Métadonnées spécifiques à la page de connexion
definePageMeta({
  title: 'Connexion - Winchester Ascendancy',
  description: 'Connectez-vous avec Discord pour accéder à votre gestionnaire de coffres. Authentification sécurisée et rapide.',
  keywords: 'connexion, discord, authentification, sécurité, coffres',
  ogTitle: 'Connexion - Winchester Ascendancy',
  ogDescription: 'Accédez à votre espace de gestion de coffres en vous connectant avec Discord.',
  ogImage: '/og-login.jpg',
  robots: 'noindex, nofollow' // Évite l'indexation de la page de connexion
})

import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Récupérer les paramètres de l'URL
const redirectUrl = computed(() => {
  const redirect = route.query.redirect as string
  return redirect || '/chests'
})

const errorType = computed(() => {
  return route.query.error as string
})

// Messages d'erreur
const errorMessages = {
  access_denied: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
  server_error: 'Erreur serveur. Veuillez réessayer plus tard.',
  network_error: 'Erreur de connexion. Vérifiez votre connexion internet.'
}

const errorMessage = computed(() => {
  return errorType.value ? errorMessages[errorType.value as keyof typeof errorMessages] || 'Une erreur inconnue s\'est produite.' : null
})

// Utilise le proxy Nuxt pour partager les cookies de session
// Configuration API simplifiée pour Docker
const apiBase = 'http://localhost:4000/api'

// État d'authentification
const user = ref(null)
const loading = ref(true)
const hasAccess = ref(false)

// Fonction de connexion Discord
async function loginWithDiscord() {
  try {
    const response = await fetch(`${apiBase}/auth/discord`, {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const { authUrl } = await response.json()
    window.location.href = authUrl
  } catch (error) {
    console.error('Erreur lors de la connexion Discord:', error)
    // Afficher un message d'erreur à l'utilisateur
    alert('Erreur lors de la connexion à Discord. Veuillez réessayer.')
  }
}

// Fonction de déconnexion
async function logout() {
  try {
    await fetch(`${apiBase}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    user.value = null
    hasAccess.value = false
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

// Vérification de la session
async function checkSession() {
  try {
    console.log('🔄 Démarrage de la vérification de session...')

    const response = await fetch(`${apiBase}/auth/me`, {
      credentials: 'include'
    })

    if (response.ok) {
      const userData = await response.json()
      user.value = userData.user
      hasAccess.value = userData.hasAccess

      console.log('✅ Vérification de session terminée')

      // Redirection automatique si authentifié et autorisé
      if (user.value && hasAccess.value) {
        setTimeout(() => {
          router.push(redirectUrl.value)
        }, 1000)
      }
    } else {
      console.log('❌ Session non valide')
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de session:', error)
  } finally {
    loading.value = false
  }
}

// Cycle de vie
onMounted(() => {
  checkSession()
})
</script>
