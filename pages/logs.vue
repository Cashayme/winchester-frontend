<template>
  <div class="min-h-screen">
    <!-- Header -->
    <AppHeader :chests="[]" />

    <!-- Contenu principal -->
    <main class="container mx-auto px-4 py-8">
      <div class="space-y-6">
        <!-- Titre et statistiques -->
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold font-display flex items-center gap-3 text-white">
            <UIcon name="i-mdi-history" class="w-8 h-8 text-blood-400" />
            Logs d'activité
          </h1>

          <!-- Bouton refresh -->
          <UButton
            @click="refreshLogs"
            :loading="loading"
            class="nav-button-subtle"
            size="lg"
          >
            <UIcon name="i-mdi-refresh" class="w-4 h-4 mr-2" />
            Actualiser
          </UButton>
        </div>

        <!-- Statistiques -->
        <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <UCard class="panel brushed ring-blood">
            <div class="text-center">
              <div class="text-2xl font-bold title-gradient">{{ stats.totalLogs }}</div>
              <div class="text-sm text-gray-300">Total des logs</div>
            </div>
          </UCard>

          <UCard class="panel brushed ring-blood">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-400">{{ stats.uniqueUsers }}</div>
              <div class="text-sm text-gray-300">Utilisateurs actifs</div>
            </div>
          </UCard>

          <UCard class="panel brushed ring-blood">
            <div class="text-center">
              <div class="text-2xl font-bold text-violet-400">{{ stats.uniqueChests }}</div>
              <div class="text-sm text-gray-300">Coffres modifiés</div>
            </div>
          </UCard>

          <UCard class="panel brushed ring-blood">
            <div class="text-center">
              <div class="text-2xl font-bold text-brass-400">{{ stats.recentActivity }}</div>
              <div class="text-sm text-gray-300">Activité récente (24h)</div>
            </div>
          </UCard>
        </div>

        <!-- Filtres avancés -->
        <UCard class="panel brushed ring-blood">
          <template #header>
            <h3 class="text-lg font-semibold font-display text-white flex items-center gap-2">
              <UIcon name="i-mdi-filter" class="w-5 h-5 text-blood-400" />
              Filtres avancés
            </h3>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Filtre par type de log -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <UIcon name="i-mdi-cog" class="w-4 h-4 inline mr-1" />
                Type d'activité
              </label>
              <select
                v-model="filters.actionType"
                class="bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white w-full"
              >
                <option value="">Tous les types</option>
                <option
                  v-for="option in actionTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Filtre par coffre -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <UIcon name="i-mdi-archive" class="w-4 h-4 inline mr-1" />
                Coffre
              </label>
              <select
                v-model="filters.chestId"
                class="bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white w-full"
              >
                <option value="">Tous les coffres</option>
                <option
                  v-for="option in chestOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Filtre par utilisateur -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <UIcon name="i-mdi-account" class="w-4 h-4 inline mr-1" />
                Utilisateur
              </label>
              <select
                v-model="filters.userId"
                class="bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white w-full"
              >
                <option value="">Tous les utilisateurs</option>
                <option
                  v-for="option in userOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Filtre par dates -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                <UIcon name="i-mdi-calendar" class="w-4 h-4 inline mr-1" />
                Période
              </label>
              <select
                v-model="filters.dateRange"
                class="bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white w-full"
              >
                <option value="">Toutes les dates</option>
                <option
                  v-for="option in dateRangeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Dates personnalisées (si sélectionnée) -->
          <div v-if="filters.dateRange === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <UInput
              v-model="filters.startDate"
              type="datetime-local"
              placeholder="Date de début"
              icon="i-mdi-calendar-start"
              class="bg-gray-800/50 border-gray-600"
            />
            <UInput
              v-model="filters.endDate"
              type="datetime-local"
              placeholder="Date de fin"
              icon="i-mdi-calendar-end"
              class="bg-gray-800/50 border-gray-600"
            />
          </div>

          <div class="flex gap-2 mt-4">
            <UButton
              @click="applyFilters"
              class="nav-button-subtle"
              size="md"
            >
              <UIcon name="i-mdi-check" class="w-4 h-4 mr-2" />
              Appliquer les filtres
            </UButton>

            <UButton
              @click="clearFilters"
              variant="outline"
              color="gray"
              size="md"
            >
              <UIcon name="i-mdi-refresh" class="w-4 h-4 mr-2" />
              Réinitialiser
            </UButton>
          </div>
        </UCard>

        <!-- Liste des logs -->
        <UCard class="panel brushed ring-blood">
          <template #header>
            <h3 class="text-lg font-semibold font-display text-white flex items-center gap-2">
              <UIcon name="i-mdi-timeline" class="w-5 h-5 text-blood-400" />
              Historique des actions
            </h3>
          </template>

          <div v-if="loading && !logs.length" class="space-y-4">
            <div v-for="i in 5" :key="i" class="tooltip-surface p-4">
              <USkeleton class="h-4 w-32 mb-2" />
              <USkeleton class="h-3 w-full mb-1" />
              <USkeleton class="h-3 w-3/4" />
            </div>
          </div>

          <div v-else-if="logs.length === 0" class="text-center py-8 text-gray-400">
            <UIcon name="i-mdi-history" class="w-12 h-12 mx-auto mb-4 opacity-50 text-blood-400" />
            <p class="text-gray-300">Aucun log trouvé</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="log in logs"
              :key="log._id"
              class="tooltip-surface p-4 hover:bg-gray-800/30 transition-colors"
            >
              <!-- Icône d'action -->
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 mt-1">
                  <UIcon
                    :name="getActionIcon(log.action)"
                    :class="getActionColor(log.action)"
                    class="w-5 h-5"
                  />
                </div>

                <!-- Contenu principal -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-medium text-white">{{ log.username }}</span>
                    <UBadge
                      :variant="getActionBadgeVariant(log.action)"
                      size="xs"
                      class="chip--accent"
                    >
                      {{ getActionLabel(log.action) }}
                    </UBadge>
                  </div>

                  <p class="text-sm text-gray-300 mb-3">{{ log.details || getDefaultDetails(log) }}</p>

                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span class="flex items-center gap-1">
                      <UIcon name="i-mdi-clock" class="w-3 h-3" />
                      {{ formatDate(log.createdAt) }}
                    </span>
                    <span v-if="log.chestName" class="flex items-center gap-1">
                      <UIcon name="i-mdi-treasure-chest" class="w-3 h-3" />
                      {{ log.chestName }}
                    </span>
                    <span v-if="log.itemName" class="flex items-center gap-1">
                      <UIcon name="i-mdi-package-variant" class="w-3 h-3" />
                      {{ log.itemName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination && pagination.pages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-gray-600/50">
            <div class="text-sm text-gray-400">
              Page {{ pagination.page }} sur {{ pagination.pages }}
              ({{ pagination.total }} logs au total)
            </div>

            <div class="flex gap-2">
              <UButton
                @click="changePage(pagination.page - 1)"
                :disabled="!pagination.hasPrev"
                class="nav-button-subtle"
                size="sm"
              >
                <UIcon name="i-mdi-chevron-left" class="w-4 h-4" />
                Précédent
              </UButton>

              <UButton
                @click="changePage(pagination.page + 1)"
                :disabled="!pagination.hasNext"
                class="nav-button-subtle"
                size="sm"
              >
                Suivant
                <UIcon name="i-mdi-chevron-right" class="w-4 h-4" />
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Métadonnées spécifiques à la page des logs
definePageMeta({
  title: 'Logs d\'Activité - Winchester Ascendancy',
  description: 'Consultez l\'historique complet des activités et modifications sur vos coffres. Suivez toutes les actions réalisées.',
  keywords: 'logs, activité, historique, audit, modifications, coffres, suivi',
  ogTitle: 'Logs d\'Activité - Winchester Ascendancy',
  ogDescription: 'Historique complet des activités sur votre système de gestion de coffres.',
  ogImage: '/og-logs.jpg',
  middleware: 'auth'
})

import { ref, onMounted } from 'vue'

// Composants
import AppHeader from '~/components/AppHeader.vue'

// Configuration API
const apiBase = 'https://backend.winchester-ascendancy.com/api'

// État
const loading = ref(false)
const logs = ref([])
const stats = ref(null)
const pagination = ref(null)

// Filtres avancés
const filters = ref({
  actionType: '',
  chestId: '',
  userId: '',
  dateRange: '',
  startDate: '',
  endDate: ''
})

// Options pour les types d'activité
const actionTypeOptions = [
  { label: '🔧 Toutes les activités', value: '' },
  { label: '📦 Gestion des coffres', value: 'chest' },
  { label: '📦 Création de coffre', value: 'CREATE_CHEST' },
  { label: '🗑️ Suppression de coffre', value: 'DELETE_CHEST' },
  { label: '📥 Gestion des items', value: 'item' },
  { label: '➕ Ajout d\'item', value: 'ADD_ITEM' },
  { label: '➖ Suppression d\'item', value: 'REMOVE_ITEM' },
  { label: '🔄 Modification quantité', value: 'UPDATE_ITEM_QUANTITY' },
  { label: '🔐 Authentification', value: 'auth' },
  { label: '🔑 Connexion', value: 'LOGIN' },
  { label: '🚪 Déconnexion', value: 'LOGOUT' }
]

// Options pour les périodes de dates
const dateRangeOptions = [
  { label: '🕐 Toutes les dates', value: '' },
  { label: '📅 Aujourd\'hui', value: 'today' },
  { label: '📅 Cette semaine', value: 'week' },
  { label: '📅 Ce mois', value: 'month' },
  { label: '📅 Cette année', value: 'year' },
  { label: '📅 24 dernières heures', value: '24h' },
  { label: '📅 7 derniers jours', value: '7d' },
  { label: '📅 30 derniers jours', value: '30d' },
  { label: '🎯 Période personnalisée', value: 'custom' }
]

// Données pour les selects
const chestOptions = ref([
  { label: '🔄 Chargement...', value: '' }
])

const userOptions = ref([
  { label: '🔄 Chargement...', value: '' }
])

// Fonctions utilitaires
function getActionIcon(action: string) {
  const icons = {
    CREATE_CHEST: 'i-mdi-plus-circle',
    ADD_ITEM: 'i-mdi-plus',
    REMOVE_ITEM: 'i-mdi-minus',
    UPDATE_ITEM_QUANTITY: 'i-mdi-swap-horizontal',
    DELETE_CHEST: 'i-mdi-delete',
    LOGIN: 'i-mdi-login',
    LOGOUT: 'i-mdi-logout'
  }
  return icons[action] || 'i-mdi-circle'
}

// Fonction pour vérifier si une action correspond au type filtré
function matchesActionType(action: string, filterType: string) {
  if (!filterType) return true

  const chestActions = ['CREATE_CHEST', 'DELETE_CHEST']
  const itemActions = ['ADD_ITEM', 'REMOVE_ITEM', 'UPDATE_ITEM_QUANTITY']
  const authActions = ['LOGIN', 'LOGOUT']

  switch (filterType) {
    case 'chest':
      return chestActions.includes(action)
    case 'item':
      return itemActions.includes(action)
    case 'auth':
      return authActions.includes(action)
    default:
      return action === filterType
  }
}

// Fonction pour calculer les dates selon la plage sélectionnée
function getDateRange(range: string) {
  const now = new Date()
  const start = new Date()

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      return { start, end: now }
    case 'week':
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      return { start, end: now }
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      return { start, end: now }
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      return { start, end: now }
    case '24h':
      start.setTime(now.getTime() - 24 * 60 * 60 * 1000)
      return { start, end: now }
    case '7d':
      start.setTime(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return { start, end: now }
    case '30d':
      start.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return { start, end: now }
    default:
      return null
  }
}

function getActionColor(action: string) {
  const colors = {
    CREATE_CHEST: 'text-green-400',
    ADD_ITEM: 'text-blue-400',
    REMOVE_ITEM: 'text-red-400',
    UPDATE_ITEM_QUANTITY: 'text-yellow-400',
    DELETE_CHEST: 'text-red-500',
    LOGIN: 'text-green-500',
    LOGOUT: 'text-gray-400'
  }
  return colors[action] || 'text-gray-400'
}

function getActionBadgeVariant(action: string) {
  const variants = {
    CREATE_CHEST: 'solid',
    ADD_ITEM: 'soft',
    REMOVE_ITEM: 'solid',
    UPDATE_ITEM_QUANTITY: 'outline',
    DELETE_CHEST: 'solid',
    LOGIN: 'soft',
    LOGOUT: 'outline'
  }
  return variants[action] || 'outline'
}

function getActionLabel(action: string) {
  const labels = {
    CREATE_CHEST: 'Création',
    ADD_ITEM: 'Ajout',
    REMOVE_ITEM: 'Suppression',
    UPDATE_ITEM_QUANTITY: 'Modification',
    DELETE_CHEST: 'Suppression',
    LOGIN: 'Connexion',
    LOGOUT: 'Déconnexion'
  }
  return labels[action] || action
}

function getDefaultDetails(log: any) {
  const actions = {
    CREATE_CHEST: `Création du coffre "${log.chestName}"`,
    ADD_ITEM: `Ajout de ${log.newQuantity - (log.oldQuantity || 0)} ${log.itemName} dans ${log.chestName}`,
    REMOVE_ITEM: `Suppression de ${(log.oldQuantity || 0) - log.newQuantity} ${log.itemName} dans ${log.chestName}`,
    UPDATE_ITEM_QUANTITY: `Modification de ${log.itemName} dans ${log.chestName} (${log.oldQuantity || 0} → ${log.newQuantity})`,
    DELETE_CHEST: `Suppression du coffre "${log.chestName}"`,
    LOGIN: 'Connexion au système',
    LOGOUT: 'Déconnexion du système'
  }
  return actions[log.action] || log.action
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fonctions de gestion des données
async function fetchChestAndUserOptions() {
  try {
    // Récupérer la liste des coffres
    const chestsResponse = await fetch(`${apiBase}/chests`, {
      credentials: 'include'
    })

    if (chestsResponse.ok) {
      const chests = await chestsResponse.json()

      if (chests && chests.length > 0) {
        chestOptions.value = [
          { label: '🏠 Tous les coffres', value: '' },
          ...chests.map((chest: any) => ({
            label: chest.name || `Coffre ${chest._id}`,
            value: chest._id
          }))
        ]
      } else {
        chestOptions.value = [
          { label: '📭 Aucun coffre disponible', value: '' }
        ]
      }
    } else {
      console.error('Erreur lors du chargement des coffres:', chestsResponse.status)
      chestOptions.value = [
        { label: '❌ Erreur de chargement', value: '' }
      ]
    }

    // Récupérer la liste des utilisateurs depuis les logs
    const usersResponse = await fetch(`${apiBase}/logs/users`, {
      credentials: 'include'
    })

    if (usersResponse.ok) {
      const users = await usersResponse.json()

      if (users && users.length > 0) {
        userOptions.value = [
          { label: '👥 Tous les utilisateurs', value: '' },
          ...users.map((user: any) => ({
            label: user.username || user.discordUsername || `User ${user.discordId || user._id}`,
            value: user._id || user.discordId
          }))
        ]
      } else {
        userOptions.value = [
          { label: '👤 Aucun utilisateur trouvé', value: '' }
        ]
      }
    } else {
      console.error('Erreur lors du chargement des utilisateurs:', usersResponse.status)
      userOptions.value = [
        { label: '❌ Erreur de chargement', value: '' }
      ]
    }
  } catch (error) {
    console.error('Erreur lors du chargement des options:', error)
    // En cas d'erreur, définir des options par défaut
    chestOptions.value = [
      { label: '❌ Erreur de chargement des coffres', value: '' }
    ]
    userOptions.value = [
      { label: '❌ Erreur de chargement des utilisateurs', value: '' }
    ]
  }
}

async function fetchLogs() {
  try {
    loading.value = true

    const params = new URLSearchParams({
      page: pagination.value?.page?.toString() || '1',
      limit: '20'
    })

    // Ajouter les filtres actifs
    if (filters.value.actionType) {
      params.set('actionType', filters.value.actionType)
    }
    if (filters.value.chestId) {
      params.set('chestId', filters.value.chestId)
    }
    if (filters.value.userId) {
      params.set('userId', filters.value.userId)
    }

    // Gestion des dates
    if (filters.value.dateRange === 'custom' && filters.value.startDate && filters.value.endDate) {
      params.set('startDate', filters.value.startDate)
      params.set('endDate', filters.value.endDate)
    } else if (filters.value.dateRange && filters.value.dateRange !== 'custom') {
      const dateRange = getDateRange(filters.value.dateRange)
      if (dateRange) {
        params.set('startDate', dateRange.start.toISOString())
        params.set('endDate', dateRange.end.toISOString())
      }
    }

    const [logsResponse, statsResponse] = await Promise.all([
      fetch(`${apiBase}/logs?${params.toString()}`, {
        credentials: 'include'
      }).then(r => r.json()),
      fetch(`${apiBase}/logs/stats`, {
        credentials: 'include'
      }).then(r => r.json())
    ])

    logs.value = logsResponse.logs
    pagination.value = logsResponse.pagination
    stats.value = statsResponse

  } catch (error) {
    console.error('Erreur lors du chargement des logs:', error)
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const response = await fetch(`${apiBase}/logs/stats`, {
      credentials: 'include'
    })
    stats.value = await response.json()
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

function applyFilters() {
  fetchLogs()
}

function clearFilters() {
  filters.value = {
    actionType: '',
    chestId: '',
    userId: '',
    dateRange: '',
    startDate: '',
    endDate: ''
  }
  fetchLogs()
}



function changePage(page: number) {
  // Mise à jour de la page dans les filtres et rechargement
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20'
  })

  // Ajouter les filtres actifs
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== '') {
      params.set(key, value)
    }
  })

  // Recharger avec la nouvelle page
  fetchLogs()
}

function refreshLogs() {
  fetchLogs()
  fetchStats()
}

// Chargement initial
onMounted(async () => {
  // Charger les options des filtres en parallèle avec les données
  await Promise.all([
    fetchChestAndUserOptions(),
    fetchLogs(),
    fetchStats()
  ])
})
</script>
