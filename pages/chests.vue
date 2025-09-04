<template>
  <!-- Écran de chargement global -->
  <div v-if="globalLoading" class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <UIcon name="i-mdi-loading" class="w-16 h-16 mx-auto mb-4 animate-spin text-blue-500" />
        <h2 class="text-xl font-semibold mb-2">Initialisation...</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Préparation de l'application</p>
      </div>
    </UCard>
  </div>

  <!-- Écran de connexion requis -->
  <div v-else-if="!isAuthenticated" class="min-h-screen flex items-center justify-center p-4">
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

  <!-- Application principale -->
  <div v-else class="min-h-screen">
    <!-- Header -->
    <AppHeader :user="user" @logout="logout" />

    <!-- Notification élégante -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform translate-y-2"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-0 transform -translate-y-2"
      leave-to-class="opacity-100 transform translate-y-0"
    >
      <div
        v-if="notification.show"
        class="fixed top-4 right-4 z-50 max-w-sm"
      >
        <div
          :class="[
            'flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm',
            {
              'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200': notification.type === 'success',
              'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200': notification.type === 'error',
              'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200': notification.type === 'info'
            }
          ]"
        >
          <UIcon
            v-if="notification.icon"
            :name="notification.icon"
            class="w-5 h-5 mt-0.5 flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-sm">{{ notification.title }}</h4>
            <p class="text-sm opacity-90 mt-1">{{ notification.message }}</p>
          </div>
          <button
            @click="notification.show = false"
            class="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
          >
            <UIcon name="i-mdi-close" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Contenu principal -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Panneau gauche : Gestion des coffres -->
        <div class="lg:col-span-1 space-y-6">
          <ChestPanel
            :chests="chests"
            :selected-chest-id="selectedChestId"
            :chest-entries="chestEntries"
            @chest-selected="selectChest"
            @create-chest="createChest"
            @manage-chest="openChestManagementDialog"
          />

          <SearchPanel
            :query="pickerQuery"
            :picker-options="pickerOptions"
            :selected-chest-id="selectedChestId"
            :picker-item-id="pickerItemId"
            :selected-pick="selectedPick"
            @query-changed="pickerQuery = $event"
            @option-selected="handlePickerOptionSelected"
            @deposit-with-quantity="handleDepositWithQuantity"
          />
        </div>

        <!-- Panneau central : Inventaire -->
        <div class="lg:col-span-2">
          <UCard class="brushed ring-blood">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold flex items-center gap-2 text-white">
                  <UIcon name="i-mdi-grid" class="w-5 h-5 text-blood-400" />
                  {{ selectedChestId ? `${selectedChestName}` : 'Sélectionnez un coffre' }}
                </h3>
                <UBadge
                  variant="soft"
                  color="blood"
                  class="badge-blood text-base px-3 py-1 font-semibold tracking-wide"
                >
                  <UIcon name="i-mdi-treasure-chest" class="w-4 h-4 mr-2" />
                  {{ chests.length }} coffre{{ chests.length > 1 ? 's' : '' }}
                </UBadge>
              </div>
            </template>
          </UCard>

          <div class="mt-6">
            <InventoryGrid
            :chest-slots="chestSlots"
            :selected-chest-id="selectedChestId"
            :selected-chest-name="selectedChestName"
            :chest-entries="chestEntries"
            :selected-entry-idx="selectedEntryIdx"
            :edit-quantity="editQuantity"
            :quantity-changed="quantityChanged"
            :quantity-loading="quantityLoading"
            :quantity-recently-changed="quantityRecentlyChanged"
            :save-animation-step="saveAnimationStep"
            :current-page="currentPage"
            :total-pages="totalPages"
            @slot-clicked="handleSlotClicked"
            @mark-new-item="handleMarkNewItem"
            ref="inventoryGridRef"
            @item-details-closed="closeItemDetails"
            @quantity-changed="setItemQuantity"
            @adjust-quantity="adjustQuantity"
            @page-changed="currentPage = $event"
            @remove-item="removeItemFromChest"
          />
          </div>
        </div>
      </div>

      <!-- Dialogues et modals -->
      <ChestManagementDialog
        :is-visible="chestManagementDialogOpen"
        :selected-chest="selectedChest"
        :chest-entries="chestEntries"
        :available-chests="chests"
        @close="chestManagementDialogOpen = false"
        @confirm-rename="handleRenameChest"
        @confirm-delete="handleDeleteChest"
      />

      <ChestManagementModal
        v-model="chestManagementModalOpen"
        :mode="chestManagementMode"
        :selected-chest="selectedChest"
        :selected-chest-entries="chestEntries"
        :available-chests="chests"
        @confirm-rename="handleRenameChest"
        @confirm-delete="handleDeleteChest"
      />

      <!-- Overlay de création de coffre -->
      <div
        v-if="showCreateChestOverlay"
        class="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeCreateChestOverlay"
      >
        <div class="tooltip-surface p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div class="bar-copper mb-4"></div>

          <!-- Header -->
          <div class="flex items-start gap-4 mb-6">
            <div class="w-20 h-20 bg-[rgba(12,14,20,0.35)] rounded-lg flex items-center justify-center ring-1 ring-[rgba(255,255,255,0.06)] flex-shrink-0">
              <UIcon name="i-mdi-plus-circle" class="w-12 h-12 text-blood-400" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold text-white mb-2">Nouveau coffre</h3>
              <p class="text-sm text-gray-400">
                Créez un nouveau coffre pour organiser vos items
              </p>
            </div>
            <UButton
              @click="closeCreateChestOverlay"
              icon="i-mdi-close"
              color="gray"
              variant="ghost"
              size="sm"
              class="flex-shrink-0"
            />
          </div>

          <!-- Formulaire -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">
                Nom du coffre <span class="text-red-400">*</span>
              </label>
              <UInput
                v-model="newChestName"
                placeholder="Ex: Coffre des trésors, Armurerie..."
                icon="i-mdi-crown"
                size="lg"
                autofocus
                @keyup.enter="handleCreateChest"
                class="copper-outline"
                :class="{ 'ring-2 ring-red-500': createChestError }"
              />
              <p class="text-sm text-gray-400">
                Choisissez un nom descriptif pour votre coffre
              </p>
              <p v-if="createChestError" class="text-sm text-red-400">
                {{ createChestError }}
              </p>
            </div>

            <div class="flex gap-3 justify-end pt-4 border-t border-blood-800/30">
              <UButton
                @click="closeCreateChestOverlay"
                variant="outline"
                color="gray"
                size="lg"
                :disabled="createChestLoading"
              >
                Annuler
              </UButton>
              <UButton
                @click="handleCreateChest"
                :disabled="!newChestName.trim() || createChestLoading"
                :loading="createChestLoading"
                color="red"
                variant="solid"
                size="lg"
                class="copper-outline"
              >
                <UIcon name="i-mdi-check" class="w-4 h-4 mr-2" />
                Créer le coffre
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Métadonnées spécifiques à la page des coffres
definePageMeta({
  title: 'Mes Coffres - Winchester Ascendancy',
  description: 'Gérez vos coffres et inventaires avec style. Interface moderne pour organiser vos items de manière intuitive et efficace.',
  keywords: 'coffres, inventaire, gestion, items, organisation, Dune, Awakening, Winchester, Ascendancy',
  ogTitle: 'Mes Coffres - Winchester Ascendancy',
  ogDescription: 'Interface de gestion avancée pour vos coffres de guilde Dune Awakening.',
  ogImage: '/og-chests.jpg',
  middleware: 'auth'
})
// Imports des composants
import AppHeader from '~/components/AppHeader.vue'
import ChestPanel from '~/components/ChestPanel.vue'
import SearchPanel from '~/components/SearchPanel.vue'
import InventoryGrid from '~/components/InventoryGrid.vue'
import ChestManagementModal from '~/components/ChestManagementModal.vue'
import ChestManagementDialog from '~/components/ChestManagementDialog.vue'

// Référence au composant InventoryGrid pour déclencher les animations
const inventoryGridRef = ref<InstanceType<typeof InventoryGrid> | null>(null)

// Configuration API simplifiée pour Docker
// Toujours utiliser localhost:4000 car le backend est exposé sur l'hôte
const apiBase = 'https://backend.winchester-ascendancy.com/api'
const imagesBase = 'http://localhost:4000/images'

// Debug: Afficher la configuration API
console.log('🔧 Configuration API:', {
  apiBase,
  imagesBase,
  nodeEnv: process.env.NODE_ENV,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
  port: typeof window !== 'undefined' ? window.location.port : 'server-side'
})

// État de chargement global pour éviter le flash de l'écran de connexion
const globalLoading = ref(true)

// États principaux
const chests = ref<any[]>([])
const selectedChestId = ref<string>('')
const chestEntries = ref<any[]>([])
const selectedEntryIdx = ref<number | null>(null)
const selectedChestEntry = computed(() => (selectedEntryIdx.value != null ? chestEntries.value[selectedEntryIdx.value] : null))

// États de gestion des coffres
const chestManagementModalOpen = ref(false)
const chestManagementMode = ref<'rename' | 'delete' | null>(null)
const selectedChest = computed(() => chests.value.find(chest => chest._id === selectedChestId.value))

// États du dialogue de gestion des coffres
const chestManagementDialogOpen = ref(false)

// Système de notifications élégantes
const notification = ref<{
  show: boolean
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  icon?: string
}>({
  show: false,
  type: 'success',
  title: '',
  message: '',
  icon: ''
})

// États du picker
const pickerQuery = ref('')
const pickerItemId = ref<number | undefined>(undefined)
const pickerOptions = ref<any[]>([])
const selectedPick = ref<any | null>(null)
const suggestIdx = ref(-1)

// États supplémentaires
const quantityLoading = ref(false)
const quantityRecentlyChanged = ref(false)
const saveAnimationStep = ref(0) // 0: idle, 1: saving, 2: success, 3: closing
const editQuantity = ref(1)

// État d'authentification
const isAuthenticated = ref(false)
const user = ref(null)

// Computed properties
// Pagination
const itemsPerPage = 32 // 4x8 grid
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(chestEntries.value.length / itemsPerPage))

const chestSlots = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  const pageItems = chestEntries.value.slice(start, end)

  // Compléter avec des cases vides pour la grille
  const out: any[] = [...pageItems]
  while (out.length < itemsPerPage) out.push(null)
  return out
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const selectedChestName = computed(() => {
  return chests.value.find(c => c._id === selectedChestId.value)?.name || ''
})

const canDepositPick = computed(() => {
  return !!selectedChestId.value && (!!pickerItemId.value || !!selectedPick.value || pickerOptions.value.length > 0)
})

// Fonction de notification élégante
function showSuccessNotification(result: any) {
  let title = 'Coffre supprimé avec succès'
  let message = 'Le coffre a été supprimé.'

  if (result.migratedTo && result.migration?.targetChest) {
    title = 'Migration réussie !'
    message = `${result.migration.itemCount} items ont été migrés vers "${result.migration.targetChest.name}".`
  } else if (result.deleted && result.deleted.name) {
    message = `Le coffre "${result.deleted.name}" a été supprimé.`
  }

  notification.value = {
    show: true,
    type: 'success',
    title,
    message,
    icon: 'i-mdi-check-circle'
  }

  // Masquer automatiquement après 5 secondes
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

const quantityChanged = computed(() =>
  Boolean(selectedChestEntry.value && editQuantity.value !== selectedChestEntry.value.quantity)
)

// Fonctions principales
async function fetchChests() {
  const response = await fetch(`${apiBase}/chests`, { credentials: 'include' })
  if (response.ok) {
    chests.value = await response.json()
    selectFirstChest()
  } else {
    console.error('Erreur fetchChests:', response.status)
  }
}

async function selectChest(chestId: string) {
  if (selectedChestId.value !== chestId) {
    selectedChestId.value = chestId
    selectedEntryIdx.value = null
    await fetchChestItems()
  }
}

async function fetchChestItems() {
  if (!selectedChestId.value || selectedChestId.value === '') {
    chestEntries.value = []
    return
  }
  const response = await fetch(`${apiBase}/chests/${selectedChestId.value}/items`, { credentials: 'include' })
  if (response.ok) {
    const res = await response.json()
    chestEntries.value = res.items || []
  } else {
    console.error('Erreur fetchChestItems:', response.status)
  }
}

function selectFirstChest() {
  if (chests.value.length > 0 && (!selectedChestId.value || selectedChestId.value === '')) {
    selectedChestId.value = chests.value[0]._id
  }
}

// Fonctions du picker
const onPickerInput = async () => {
  console.log('onPickerInput called - redirecting to onPickerInputDebounced')
  await onPickerInputDebounced()
}

const onPickerInputDebounced = debounce(async () => {
  const q = pickerQuery.value.trim()
  if (!q) {
    pickerOptions.value = []
    return
  }
  const params = new URLSearchParams({ q })
  try {
    const response = await fetch(`${apiBase}/items/suggest?${params.toString()}`, { credentials: 'include' })
    if (response.ok) {
      const res = await response.json()
      pickerOptions.value = res || []
      suggestIdx.value = (pickerOptions.value.length ? 0 : -1)
    }
  } catch (error) {
    console.error('Erreur onPickerInput:', error)
  }
}, 150)

function pick(option: any) {
  selectedPick.value = option || null
  pickerItemId.value = option?._id ?? undefined
  pickerQuery.value = option?.nom || ''
  pickerOptions.value = []
}

function moveSel(d: number) {
  if (!pickerOptions.value.length) return
  suggestIdx.value = (suggestIdx.value + d + pickerOptions.value.length) % pickerOptions.value.length
}

function chooseSel() {
  if (suggestIdx.value < 0 || suggestIdx.value >= pickerOptions.value.length) return
  pick(pickerOptions.value[suggestIdx.value])
}

async function depositPicked(n: number) {
  if (!selectedChestId.value) return

  const body: any = { inc: n }
  if (selectedPick.value && selectedPick.value._id) {
    body.itemMongoId = selectedPick.value._id
  } else if (pickerOptions.value.length) {
    body.itemMongoId = pickerOptions.value[0]?._id
  } else if (pickerItemId.value) {
    // Fallback: si on a pickerItemId, on l'utilise comme itemMongoId
    body.itemMongoId = pickerItemId.value
  } else {
    // Pas d'item sélectionné et pas d'options - on ne peut rien faire
    console.warn('Aucun item à ajouter - aucune option disponible')
    return
  }
  const response = await fetch(`${apiBase}/chests/${selectedChestId.value}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  })
  if (response.ok) {
    await fetchChestItems()
  } else {
    console.error('Erreur:', response.status)
  }
}

// Ancienne fonction conservée pour compatibilité
async function handleDepositOne() {
  try {
    await depositPicked(1)
    // Vider l'input de recherche après un ajout réussi
    pickerQuery.value = ''
    pickerOptions.value = []
    selectedPick.value = null
    pickerItemId.value = undefined
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error)
  }
}

// Nouvelle fonction pour ajouter un item avec quantité personnalisée
async function handleDepositWithQuantity(item: any, quantity: number) {
  try {
    // Mettre à jour les variables pour l'item sélectionné
    selectedPick.value = item
    pickerItemId.value = item._id

    // Ajouter l'item avec la quantité spécifiée
    await depositPicked(quantity)

    // Trouver l'emplacement de l'item ajouté et déclencher l'animation
    const slotIndex = findNewItemSlot(item._id)
    if (slotIndex !== -1 && inventoryGridRef.value) {
      inventoryGridRef.value.markItemAsNew(item._id, slotIndex)
      console.log(`✨ Animation déclenchée pour l'item "${item.nom}" à l'emplacement ${slotIndex}`)
    }

    // Vider l'input de recherche après un ajout réussi
    pickerQuery.value = ''
    pickerOptions.value = []
    selectedPick.value = null
    pickerItemId.value = undefined

    console.log(`✅ Item "${item.nom}" ajouté avec quantité ${quantity}`)
  } catch (error) {
    console.error('Erreur lors de l\'ajout avec quantité:', error)
  }
}

// Fonction pour trouver l'emplacement du nouvel item ajouté
function findNewItemSlot(itemId: string): number {
  const slots = chestSlots.value
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (slot && slot.item && slot.item._id === itemId) {
      return i
    }
  }
  return -1
}

// Gestionnaire pour marquer les nouveaux items (au cas où)
function handleMarkNewItem(itemId: string, slotIndex: number) {
  if (inventoryGridRef.value) {
    inventoryGridRef.value.markItemAsNew(itemId, slotIndex)
  }
}

async function removeItemFromChest(slot: any, slotIndex: number) {
  if (!selectedChestId.value || !slot || !slot.item) return

  try {
    const body = {
      itemMongoId: slot.item._id,
      inc: -slot.quantity // Supprimer toute la quantité
    }

    const response = await fetch(`${apiBase}/chests/${selectedChestId.value}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    })

    if (response.ok) {
      await fetchChestItems()
      closeItemDetails()
      console.log('Item supprimé avec succès')
    } else {
      console.error('Erreur lors de la suppression:', response.status)
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

function handlePickerOptionSelected(options: any) {
  // Gérer le cas où options est un array (résultats de recherche) ou un objet (sélection individuelle)
  if (Array.isArray(options)) {
    pickerOptions.value = options
  } else {
    // C'est un objet individuel sélectionné
    pick(options)
  }
}

// Fonctions de gestion des slots
function handleSlotClicked(slot: any, slotIndex: number) {
  if (!slot || !slot.item) {
    selectedEntryIdx.value = null
    return
  }
  const newIndex = (selectedEntryIdx.value === slotIndex ? null : slotIndex)
  selectedEntryIdx.value = newIndex
}

function closeItemDetails() {
  selectedEntryIdx.value = null
  saveAnimationStep.value = 0
}

// Fonctions de gestion des quantités
async function setItemQuantity(newQuantity: number) {
  if (!selectedChestEntry.value || !selectedChestId.value || newQuantity < 1) return

  const currentQuantity = selectedChestEntry.value.quantity || 1
  const difference = newQuantity - currentQuantity

  if (difference === 0) return

  quantityLoading.value = true

  try {
    const body: any = { inc: difference }
    if (selectedChestEntry.value.itemId != null) body.itemId = selectedChestEntry.value.itemId
    else if (selectedChestEntry.value.item?.id != null) body.itemId = selectedChestEntry.value.item.id
    else if (selectedChestEntry.value.itemMongoId) body.itemMongoId = selectedChestEntry.value.itemMongoId

    const response = await fetch(`${apiBase}/chests/${selectedChestId.value}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    })

    if (response.ok) {
      await fetchChestItems()
      editQuantity.value = newQuantity

      saveAnimationStep.value = 2
      quantityRecentlyChanged.value = true
      setTimeout(() => {
        quantityRecentlyChanged.value = false
        saveAnimationStep.value = 3 // Étape de fermeture pour déclencher tooltip-exit
        // Fermer automatiquement le tooltip après l'animation
        setTimeout(() => {
          saveAnimationStep.value = 0
          closeItemDetails()
        }, 500) // Fermeture exactement à la fin de l'animation (0.5s)
      }, 1000) // Durée de l'animation de succès
    } else {
      console.error('Erreur setItemQuantity:', response.status)
      saveAnimationStep.value = 0
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    saveAnimationStep.value = 0
  } finally {
    quantityLoading.value = false
  }
}

async function adjustQuantity(delta: number) {
  if (!selectedChestEntry.value) return

  const currentQuantity = selectedChestEntry.value.quantity || 1
  const newQuantity = Math.max(1, currentQuantity + delta)

  await setItemQuantity(newQuantity)
}

// Overlay de création de coffre
const showCreateChestOverlay = ref(false)
const newChestName = ref('')
const createChestLoading = ref(false)
const createChestError = ref('')

async function createChest() {
  showCreateChestOverlay.value = true
  newChestName.value = ''
  createChestError.value = ''
}

async function handleCreateChest() {
  const name = newChestName.value.trim()
  if (!name) {
    createChestError.value = 'Le nom du coffre est requis'
    return
  }

  createChestLoading.value = true
  createChestError.value = ''

  try {
    const response = await fetch(`${apiBase}/chests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name })
    })

    if (response.ok) {
      await fetchChests()
      await fetchChestItems()
      showCreateChestOverlay.value = false
      newChestName.value = ''
      console.log(`✅ Coffre "${name}" créé avec succès`)
    } else {
      const error = await response.json()
      createChestError.value = `Erreur: ${error.error || 'Erreur inconnue'}`
    }
  } catch (error) {
    console.error('Erreur createChest:', error)
    createChestError.value = 'Erreur lors de la création du coffre'
  } finally {
    createChestLoading.value = false
  }
}

function closeCreateChestOverlay() {
  showCreateChestOverlay.value = false
  newChestName.value = ''
  createChestError.value = ''
}

// Fonctions de gestion des coffres
function openRenameModal(chestId: string) {
  if (!chestId) return
  selectedChestId.value = chestId
  chestManagementMode.value = 'rename'
  chestManagementModalOpen.value = true
}

function openDeleteModal(chestId: string) {
  if (!chestId) return
  selectedChestId.value = chestId
  chestManagementMode.value = 'delete'
  chestManagementModalOpen.value = true
}

function openChestManagementDialog(chestId: string) {
  if (!chestId) return
  selectedChestId.value = chestId
  chestManagementDialogOpen.value = true
}

async function handleRenameChest(newName: string) {
  if (!selectedChestId.value || !newName.trim()) return

  try {
    const response = await fetch(`${apiBase}/chests/${selectedChestId.value}/rename`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ newName: newName.trim() })
    })

    if (response.ok) {
      await fetchChests()
      // Resélectionner le coffre renommé
      const renamedChest = chests.value.find(chest => chest.name === newName.trim())
      if (renamedChest) {
        selectedChestId.value = renamedChest._id
        await fetchChestItems()
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Erreur lors du renommage')
    }
  } catch (error) {
    console.error('Erreur lors du renommage du coffre:', error)
    alert(`Erreur lors du renommage: ${error.message}`)
  }
}

async function handleDeleteChest(options: { migrateTo?: string; confirmed?: boolean }) {
  if (!selectedChestId.value) return

  try {
    const response = await fetch(`${apiBase}/chests/${selectedChestId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(options)
    })

    if (response.ok) {
      const result = await response.json()

      // Si c'était le coffre sélectionné, en sélectionner un autre
      if (selectedChestId.value === selectedChestId.value) {
        selectedChestId.value = ''
        selectedEntryIdx.value = null
        chestEntries.value = []
      }

      await fetchChests()

      // Afficher une notification élégante au lieu d'un alert
      showSuccessNotification(result)
    } else {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Erreur lors de la suppression')
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du coffre:', error)
    alert(`Erreur lors de la suppression: ${error.message}`)
  }
}

// Fonctions utilitaires
function debounce<T extends (...args: any[]) => any>(fn: T, ms = 150) {
  let t: any
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

function imageSrc(it: any) {
  const url = it?.image_url as string | undefined
  if (!url) return '/placeholder.png'
  if (url.startsWith('http')) return url
  return `${imagesBase}${url}`
}

// Synchronisation de editQuantity avec la quantité sélectionnée
watch(selectedChestEntry, (newEntry) => {
  if (newEntry) {
    editQuantity.value = newEntry.quantity || 1
  }
})

// Fonctions d'authentification
async function checkAuth() {
  try {
    const response = await fetch(`${apiBase}/auth/me`, {
      credentials: 'include'
    })

    if (response.ok) {
      const userData = await response.json()
      user.value = userData
      isAuthenticated.value = true
    } else {
      isAuthenticated.value = false
      user.value = null
    }
  } catch (error) {
    console.error('Erreur vérification auth:', error)
    isAuthenticated.value = false
    user.value = null
  }
}

async function loginWithDiscord() {
  try {
    const response = await fetch(`${apiBase}/auth/discord`, {
      credentials: 'include'
    })

    if (response.ok) {
      const { authUrl } = await response.json()
      window.location.href = authUrl
    } else {
      console.error('Erreur connexion Discord')
    }
  } catch (error) {
    console.error('Erreur connexion Discord:', error)
  }
}

async function logout() {
  console.log('🔄 Début de la déconnexion...')

  try {
    console.log('📡 Appel API de déconnexion...')
    const response = await fetch(`${apiBase}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })

    console.log('📡 Réponse API:', response.status, response.statusText)

    if (response.ok) {
      console.log('✅ Déconnexion côté serveur réussie')
    } else {
      console.error('❌ Erreur côté serveur:', response.status)
    }
  } catch (error) {
    console.error('❌ Erreur réseau lors de la déconnexion:', error)
  } finally {
    console.log('🔄 Réinitialisation de l\'état local...')

    // Réinitialiser l'état local
    user.value = null
    isAuthenticated.value = false
    chests.value = []
    chestEntries.value = []
    selectedChestId.value = ''
    selectedEntryIdx.value = null
    globalLoading.value = false

    console.log('🔄 Rechargement de la page...')
    // Recharger la page pour afficher l'écran de connexion
    window.location.reload()
  }
}

// Cycle de vie
onMounted(async () => {
  await checkAuth()

  if (isAuthenticated.value) {
    await new Promise(resolve => setTimeout(resolve, 500))

    await fetchChests()
    await fetchChestItems()

    setTimeout(() => {
      globalLoading.value = false
    }, 200)
  } else {
    // Utilisateur non authentifié - afficher l'écran de connexion
    setTimeout(() => {
      globalLoading.value = false
    }, 200)
  }
})
</script>