<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Écran de connexion -->
    <div v-if="!user" class="min-h-screen flex items-center justify-center p-4">
      <UCard class="w-full max-w-md">
        <template #header>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 text-blue-500 text-6xl">🛡️</div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Connexion Requise
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Connectez-vous avec Discord pour accéder à la gestion des coffres
            </p>
          </div>
        </template>

        <div class="text-center">
          <UButton
            @click="loginWithDiscord"
            icon="i-mdi-chat"
            color="gray"
            variant="solid"
            size="lg"
            class="w-full"
          >
            Se connecter avec Discord
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Écran de chargement -->
    <div v-else-if="loading" class="min-h-screen flex items-center justify-center p-4">
      <UCard class="w-full max-w-md">
        <div class="text-center">
          <USkeleton class="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 class="text-xl font-semibold mb-2">Vérification en cours...</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Validation de votre session et autorisations Discord
          </p>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="w-5 h-5 text-blue-500 flex items-center justify-center">🔒</span>
              <span class="text-sm">Connexion</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-5 h-5 text-blue-500 flex items-center justify-center">👤</span>
              <span class="text-sm">Profil Discord</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-5 h-5 text-blue-500 flex items-center justify-center">👥</span>
              <span class="text-sm">Rôles serveur</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-5 h-5 text-green-500 flex items-center justify-center">✅</span>
              <span class="text-sm">Accès autorisé</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Écran d'accès refusé -->
    <div v-else-if="!hasAccess" class="min-h-screen flex items-center justify-center p-4">
      <UCard class="w-full max-w-md">
        <template #header>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 text-red-500 text-6xl">❌</div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Accès Refusé
            </h1>
          </div>
        </template>

        <div class="text-center space-y-4">
          <p class="text-gray-600 dark:text-gray-400">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette application.
          </p>
          <UAlert
            color="amber"
            variant="subtle"
          >
            Rôle requis sur le serveur Discord
          </UAlert>

          <UButton
            @click="logout"
            icon="i-mdi-exit-to-app"
            color="gray"
            variant="outline"
            class="w-full"
          >
            Déconnexion
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Contenu protégé -->
    <div v-else class="min-h-screen">
      <!-- Header utilisateur modernisé -->
      <UCard class="mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <UAvatar
              :src="user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : undefined"
              :alt="user.username"
              size="lg"
            />
            <div>
              <h3 class="text-lg font-semibold">{{ user.username }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                #{{ user.discriminator }}
              </p>
              <div class="flex items-center gap-2 mt-1">
                <UBadge size="xs" color="green" variant="soft">
                  Session active
                </UBadge>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  Expire: {{ formatSessionExpiry() }}
                </span>
              </div>
            </div>
          </div>

          <UButton
            @click="logout"
            icon="i-mdi-exit-to-app"
            color="red"
            variant="outline"
            size="sm"
          >
            Déconnexion
          </UButton>
        </div>
      </UCard>

      <!-- Contenu de l'application -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const user = ref<any>(null)
const hasAccess = ref<boolean>(false)
const loading = ref<boolean>(true) // Toujours commencer par true pour éviter le flash
const sessionExpiry = ref<Date | null>(null)
// Configuration API simplifiée pour Docker
const apiBase = 'http://localhost:4000/api'

// Fonction pour vérifier l'état de la session
async function checkSession() {
  try {
    console.log('🔄 Démarrage de la vérification de session...')
    // Vérifier l'authentification
    const authResponse = await fetch(`${apiBase}/auth/me`, { credentials: 'include' })
    if (authResponse.ok) {
      user.value = await authResponse.json()
      // Calculer la date d'expiration de la session (7 jours)
      sessionExpiry.value = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    } else {
      user.value = null
      sessionExpiry.value = null
    }

    // Vérifier les autorisations (accès aux coffres)
    const accessResponse = await fetch(`${apiBase}/chests`, { credentials: 'include' })
    if (accessResponse.ok) {
      hasAccess.value = true
    } else if (accessResponse.status === 403) {
      hasAccess.value = false
    } else {
      // Si erreur autre que 403, considérer comme pas d'accès
      hasAccess.value = false
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de session:', error)
    user.value = null
    hasAccess.value = false
    sessionExpiry.value = null
  } finally {
    console.log('✅ Vérification de session terminée')
    loading.value = false
  }
}

// Vérifier l'état d'authentification et les autorisations au chargement
onMounted(async () => {
  // Toujours commencer par un état de chargement pour éviter le flash de l'écran de connexion
  loading.value = true

  await checkSession()
})

// Fonction pour formater la date d'expiration
function formatSessionExpiry() {
  if (!sessionExpiry.value) return ''
  const now = new Date()
  const diff = sessionExpiry.value.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `Expire dans ${days} jour${days > 1 ? 's' : ''} et ${hours}h`
  } else if (hours > 0) {
    return `Expire dans ${hours}h`
  } else {
    return 'Expire bientôt'
  }
}

// Connexion avec Discord
async function loginWithDiscord() {
  try {
    const response = await fetch(`${apiBase}/auth/discord`)
    const { authUrl } = await response.json()
    window.location.href = authUrl
  } catch (error) {
    console.error('Erreur lors de la connexion Discord:', error)
  }
}

// Déconnexion
async function logout() {
  try {
    await fetch(`${apiBase}/auth/logout`, { credentials: 'include' })
    user.value = null
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script>

<style scoped>
.auth-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e17 0%, #1a1f2e 100%);
}

.auth-container {
  text-align: center;
  background: #0d111a;
  border: 2px solid #1e293b;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
}

.auth-container h1 {
  color: #d9b26c;
  margin-bottom: 16px;
  font-size: 28px;
  font-weight: 700;
}

.auth-container p {
  color: #94a3b8;
  margin-bottom: 32px;
  line-height: 1.6;
}

.btn-discord {
  background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
  color: white;
  border: 2px solid #5865f2;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(88, 101, 242, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-discord::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-discord:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(88, 101, 242, 0.4);
}

.btn-discord:hover::before {
  left: 100%;
}

.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border: 2px solid var(--border-accent);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid var(--accent-primary);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.discriminator {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
}

.btn-logout {
  background: linear-gradient(135deg, var(--error) 0%, #dc2626 100%);
  color: white;
  border: 2px solid var(--error);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-logout:hover {
  background: linear-gradient(135deg, #dc2626 0%, var(--error) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

/* Palette de couleurs cohérente */
:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --border-primary: #334155;
  --border-accent: #475569;
  --border-highlight: #f59e0b;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --accent-primary: #f59e0b;
  --accent-secondary: #3b82f6;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}

/* Styles pour les informations de session modernisées */
.session-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
  padding: 8px 12px;
  background: rgba(245, 158, 11, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.session-status {
  font-size: 12px;
  color: var(--success);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.session-expiry {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
}

.loading-container {
  text-align: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border: 2px solid var(--border-accent);
  border-radius: 16px;
  padding: 48px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  max-width: 500px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.loading-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
}

.loading-container h2 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.loading-container > p {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0 0 32px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  margin: 0 auto 32px;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 0 16px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 0.8;
}

.step-icon {
  font-size: 20px;
  display: block;
  padding: 8px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.step-text {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.access-denied-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
}

.access-denied-container {
  text-align: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border: 2px solid var(--error);
  border-radius: 16px;
  padding: 48px;
  box-shadow:
    0 8px 32px rgba(239, 68, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  max-width: 500px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.access-denied-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--error), #dc2626);
}

.access-denied-container h1 {
  color: var(--error);
  margin-bottom: 16px;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.access-denied-container p {
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.6;
}

.role-required {
  color: var(--accent-primary) !important;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 32px !important;
}

/* Styles responsives */
@media (max-width: 768px) {
  .auth-container {
    padding: 32px 24px;
    margin: 16px;
  }

  .user-header {
    padding: 16px;
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .user-info {
    flex-direction: column;
    gap: 12px;
  }

  .btn-discord {
    padding: 14px 20px;
    font-size: 15px;
  }

  .loading-container, .access-denied-container {
    padding: 32px 24px;
    margin: 16px;
  }

  .loading-steps {
    flex-direction: column;
    gap: 16px;
    padding: 0;
  }

  .step {
    flex-direction: row;
    gap: 12px;
    opacity: 1;
  }

  .step-text {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .auth-container h1 {
    font-size: 24px;
  }

  .btn-discord {
    padding: 12px 16px;
    font-size: 14px;
  }

  .loading-container h2, .access-denied-container h1 {
    font-size: 22px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
  }

  .username {
    font-size: 14px;
  }
}
</style>
