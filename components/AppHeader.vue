<template>
  <header class="relative overflow-hidden">
    <!-- Fond décoratif steampunk -->
    <div class="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal-2 to-charcoal opacity-95"></div>
    <div class="absolute inset-0 panel brushed with-rivets"></div>

    <!-- Lignes décoratives -->
    <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-copper to-transparent opacity-60"></div>
    <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brass to-transparent opacity-40"></div>

    <!-- Header Desktop - Layout 3 colonnes -->
    <div class="relative container mx-auto px-6 py-4 hidden lg:flex">
      <!-- Colonne gauche : Logo et titre -->
      <div class="flex items-center gap-4 flex-1">
        <!-- Logo élégant -->
        <div class="relative">
          <div class="absolute inset-0 bg-blood-500/15 rounded-full blur-lg scale-110"></div>
          <div class="relative bg-gradient-to-br from-blood-600/15 to-blood-800/15 rounded-full p-2.5 copper-ring">
            <img
              src="/vector-logo.svg"
              alt="Winchester Ascendancy"
              class="w-16 h-16 lg:w-20 lg:h-20 drop-shadow-lg filter brightness-110"
            />
          </div>
        </div>

        <!-- Titre majestueux -->
        <div class="flex flex-col">
          <h1 class="text-2xl lg:text-3xl font-display font-bold text-white tracking-wider drop-shadow-lg">
            <span class="text-blood-300">
              Winchester Ascendancy
            </span>
          </h1>
          <p class="text-sm text-blood-200/80 font-medium tracking-wide mt-0.5">
            Gestionnaire d'inventaire
          </p>
        </div>
      </div>

      <!-- Colonne centrale : Navigation -->
      <div class="flex items-center justify-center flex-1">
        <nav class="flex items-center gap-6">
                      <NuxtLink to="/chests">
              <div class="nav-button-modern group">
              <UIcon name="i-mdi-package-variant-closed" class="w-5 h-5 text-blood-400 group-hover:text-blood-300 transition-colors" />
              <span class="text-white font-medium text-sm tracking-wide group-hover:text-blood-200 transition-colors">
                Coffres
              </span>
            </div>
          </NuxtLink>

          <NuxtLink to="/logs">
            <div class="nav-button-modern group">
              <UIcon name="i-mdi-history" class="w-5 h-5 text-blood-400 group-hover:text-blood-300 transition-colors" />
              <span class="text-white font-medium text-sm tracking-wide group-hover:text-blood-200 transition-colors">
                Logs
              </span>
            </div>
          </NuxtLink>
        </nav>
      </div>

      <!-- Colonne droite : Profil utilisateur -->
      <div class="flex items-center justify-end flex-1">
        <div v-if="user" class="flex items-center">
          <div class="flex items-center gap-3 lg:gap-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-blood-400/30 copper-ring">
            <!-- Avatar -->
            <div class="relative">
              <div class="absolute inset-0 bg-blood-500/40 rounded-full blur-lg scale-110"></div>
              <UAvatar
                :src="user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : undefined"
                :alt="user.username"
                size="lg"
                class="relative ring-3 lg:ring-4 ring-blood-400/50"
              />
            </div>

            <!-- Informations utilisateur -->
            <div class="flex flex-col hidden md:flex">
              <span class="text-lg font-bold text-white tracking-wide">{{ user.username }}</span>
              <span class="text-sm text-blood-300/80 font-medium">#{{ user.discriminator }}</span>
            </div>

            <!-- Bouton déconnexion moderne -->
            <div class="border-l border-blood-400/20 pl-3 ml-3">
              <button
                @click="logout"
                class="nav-button-logout-modern group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <UIcon name="i-mdi-logout" class="w-4 h-4 text-red-400 group-hover:text-red-300" />
                <span class="text-red-300 group-hover:text-red-200 font-medium text-sm tracking-wide">
                  Déconnexion
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Header Mobile -->
    <div class="relative block lg:hidden">
      <!-- Top Bar Mobile -->
      <div class="flex items-center justify-between px-4 py-3">
        <!-- Logo mobile réduit -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="absolute inset-0 bg-blood-500/20 rounded-full blur-lg scale-110"></div>
            <div class="relative bg-gradient-to-br from-blood-600/20 to-blood-800/20 rounded-full p-2 copper-ring">
              <img
                src="/vector-logo.svg"
                alt="Winchester Ascendancy"
                class="w-10 h-10 drop-shadow-lg filter brightness-110"
              />
            </div>
          </div>

          <div class="flex flex-col">
            <h1 class="text-lg font-display font-bold text-white tracking-wide">
              <span class="text-blood-300">WA</span>
            </h1>
          </div>
        </div>

        <!-- Menu hamburger et profil -->
        <div class="flex items-center gap-3">
          <!-- Profil utilisateur mobile -->
          <div v-if="user" class="flex items-center">
            <UAvatar
              :src="user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : undefined"
              :alt="user.username"
              size="sm"
              class="ring-2 ring-blood-400/50"
            />
          </div>

          <!-- Bouton hamburger -->
          <UButton
            @click.stop="toggleMobileMenu"
            variant="solid"
            size="sm"
            class="nav-button-subtle p-2"
            :class="{ 'bg-blood-600/30': isMobileMenuOpen }"
          >
            <UIcon
              :name="isMobileMenuOpen ? 'i-mdi-close' : 'i-mdi-menu'"
              class="w-5 h-5 text-white"
            />
          </UButton>
        </div>
      </div>

      <!-- Menu mobile déroulant -->
      <div
        v-if="isMobileMenuOpen"
        class="fixed top-16 left-0 right-0 bg-gradient-to-b from-charcoal-2 to-charcoal panel border-t border-blood-400/30 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-300"
      >
        <div class="px-4 py-4 space-y-4">
          <!-- Navigation mobile -->
          <nav class="space-y-2">
            <NuxtLink to="/chests" @click="closeMobileMenu">
              <div class="flex items-center gap-3 p-3 rounded-lg nav-button-subtle hover:bg-blood-600/20 transition-colors">
                <UIcon name="i-mdi-package-variant-closed" class="w-6 h-6 text-blood-400" />
                <span class="text-white font-semibold">🏰 Coffres</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/logs" @click="closeMobileMenu">
              <div class="flex items-center gap-3 p-3 rounded-lg nav-button-subtle hover:bg-blood-600/20 transition-colors">
                <UIcon name="i-mdi-history" class="w-6 h-6 text-blood-400" />
                <span class="text-white font-semibold">📜 Logs</span>
              </div>
            </NuxtLink>
          </nav>

          <!-- Profil utilisateur détaillé -->
          <div v-if="user" class="border-t border-blood-400/20 pt-4">
            <div class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <UAvatar
                :src="user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : undefined"
                :alt="user.username"
                size="md"
                class="ring-2 ring-blood-400/50"
              />
              <div class="flex-1">
                <div class="text-white font-semibold">{{ user.username }}</div>
                <div class="text-blood-300/80 text-sm">#{{ user.discriminator }}</div>
              </div>
              <UButton
                @click="logout"
                variant="solid"
                size="sm"
                class="nav-button-logout px-3 py-2"
              >
                <UIcon name="i-mdi-logout" class="w-4 h-4 mr-2" />
                Déconnexion
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  user?: any
}>()

const emit = defineEmits<{
  logout: []
}>()

// État du menu mobile
const isMobileMenuOpen = ref(false)
const screenWidth = ref(0)

// Computed pour détecter si on est en mobile
const isMobile = computed(() => screenWidth.value < 1024)

// Gestion de la taille d'écran
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})

// Gestion du menu mobile
const toggleMobileMenu = () => {
  console.log('🔄 Toggle menu demandé, état actuel:', isMobileMenuOpen.value)
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  console.log('🔄 Menu mobile toggled:', isMobileMenuOpen.value)

  // Forcer un rendu en cas de problème de réactivité
  setTimeout(() => {
    console.log('⏰ Vérification après timeout:', isMobileMenuOpen.value)
  }, 100)
}

const closeMobileMenu = () => {
  console.log('❌ Fermeture menu demandée')
  isMobileMenuOpen.value = false
  console.log('❌ Menu mobile fermé')
}

const logout = () => {
  console.log('🚪 Bouton déconnexion cliqué dans AppHeader')
  closeMobileMenu() // Fermer le menu mobile lors de la déconnexion
  emit('logout')
}

// Fonction de test pour déboguer
const forceOpenMenu = () => {
  isMobileMenuOpen.value = true
  console.log('🔧 Menu forcé ouvert pour test')
}
</script>
