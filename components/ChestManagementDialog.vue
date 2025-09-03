<template>
  <!-- Overlay avec gestion du coffre -->
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="chest-management-overlay p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div class="bar-copper mb-4"></div>

        <!-- Header -->
        <div class="flex items-start gap-4 mb-6">
          <div class="w-20 h-20 bg-[rgba(12,14,20,0.35)] rounded-lg flex items-center justify-center ring-1 ring-[rgba(255,255,255,0.06)] flex-shrink-0">
            <UIcon name="i-mdi-package-variant-closed" class="w-12 h-12 text-[rgba(122,28,28,0.6)]" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-xl font-bold text-white mb-2">{{ selectedChest?.name }}</h3>
            <div class="flex items-center gap-2 mb-2">
              <span class="chip chip--accent">{{ totalItems }} items</span>
              <span class="chip">{{ usedSlots }} slots utilisés</span>
            </div>
            <p class="text-sm text-gray-400">
              Créé le {{ formatDate(selectedChest?.createdAt) }}
            </p>
          </div>
          <UButton
            @click="$emit('close')"
            icon="i-mdi-close"
            color="gray"
            variant="ghost"
            size="sm"
            class="flex-shrink-0"
          />
        </div>

        <!-- Actions principales -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <UButton
            @click="showRename = true"
            icon="i-mdi-pencil"
            color="yellow"
            variant="outline"
            size="lg"
            class="h-20 flex-col gap-2"
          >
            <span class="font-semibold">Renommer</span>
            <span class="text-xs opacity-75">Changer le nom</span>
          </UButton>

          <UButton
            @click="showDelete = true"
            icon="i-mdi-delete"
            color="red"
            variant="outline"
            size="lg"
            class="h-20 flex-col gap-2"
          >
            <span class="font-semibold">Supprimer</span>
            <span class="text-xs opacity-75">Supprimer le coffre</span>
          </UButton>
        </div>

        <!-- Section renommage -->
        <div v-if="showRename" class="border-t border-[rgba(255,255,255,0.1)] pt-6 mb-6">
          <h4 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UIcon name="i-mdi-pencil" class="w-5 h-5 text-yellow-500" />
            Renommer le coffre
          </h4>

          <div class="space-y-4">
            <UInput
              v-model="newChestName"
              placeholder="Nouveau nom du coffre..."
              :maxlength="50"
              @keyup.enter="confirmRename"
              autofocus
            />
            <p class="text-xs text-gray-500">{{ newChestName.length }}/50 caractères</p>

            <div class="flex gap-2">
              <UButton
                @click="confirmRename"
                :disabled="!newChestName.trim() || newChestName.trim() === selectedChest?.name"
                color="yellow"
                variant="solid"
                class="flex-1"
                :loading="loading"
              >
                Renommer
              </UButton>
              <UButton
                @click="showRename = false"
                variant="outline"
                color="gray"
                class="flex-1"
              >
                Annuler
              </UButton>
            </div>
          </div>
        </div>

        <!-- Section suppression -->
        <div v-if="showDelete" class="border-t border-[rgba(255,255,255,0.1)] pt-6">
          <h4 class="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <UIcon name="i-mdi-delete" class="w-5 h-5 text-red-500" />
            Supprimer le coffre
          </h4>

          <!-- Coffre vide -->
          <div v-if="totalItems === 0" class="space-y-4">
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div class="flex items-start gap-3">
                <UIcon name="i-mdi-check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h5 class="font-medium text-green-800 dark:text-green-200">Coffre vide</h5>
                  <p class="text-sm text-green-700 dark:text-green-300 mt-1">
                    Ce coffre ne contient aucun item. Il peut être supprimé sans risque.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton
                @click="confirmDeleteEmpty"
                color="red"
                variant="solid"
                class="flex-1"
                :loading="loading"
              >
                Supprimer définitivement
              </UButton>
              <UButton
                @click="showDelete = false"
                variant="outline"
                color="gray"
                class="flex-1"
              >
                Annuler
              </UButton>
            </div>
          </div>

          <!-- Coffre non vide -->
          <div v-else class="space-y-4">
            <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div class="flex items-start gap-3">
                <UIcon name="i-mdi-alert-circle" class="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h5 class="font-medium text-red-800 dark:text-red-200">Attention</h5>
                  <p class="text-sm text-red-700 dark:text-red-300 mt-1">
                    Ce coffre contient {{ totalItems }} items. Choisissez comment procéder :
                  </p>
                </div>
              </div>
            </div>

            <!-- Options de suppression -->
            <div class="space-y-4">
              <!-- Sélection du coffre de destination -->
              <div v-if="showMigrateOptions" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <label class="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Sélectionner le coffre de destination :
                </label>
                <select
                  v-model="selectedMigrateTarget"
                  class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                >
                  <option value="">Choisir un coffre...</option>
                  <option
                    v-for="chest in availableTargets"
                    :key="chest._id"
                    :value="chest._id"
                  >
                    {{ chest.name }} ({{ chest.entries || 0 }} items)
                  </option>
                </select>
                <div class="flex gap-2 mt-3">
                  <UButton
                    @click="confirmMigrateAndDelete"
                    :disabled="!selectedMigrateTarget"
                    color="blue"
                    variant="solid"
                    size="sm"
                    :loading="loading"
                    class="flex-1"
                  >
                    Migrer vers ce coffre
                  </UButton>
                  <UButton
                    @click="showMigrateOptions = false"
                    variant="outline"
                    color="gray"
                    size="sm"
                  >
                    Annuler
                  </UButton>
                </div>
              </div>

              <!-- Boutons principaux -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UButton
                  @click="showMigrateOptions = true"
                  icon="i-mdi-package-variant-closed"
                  color="blue"
                  variant="outline"
                  class="h-16 flex-col gap-1"
                >
                  <span class="font-medium">Migrer les items</span>
                  <span class="text-xs">Vers un autre coffre</span>
                </UButton>

                <UButton
                  @click="confirmForceDelete"
                  icon="i-mdi-delete-forever"
                  color="red"
                  variant="solid"
                  class="h-16 flex-col gap-1"
                  :loading="loading"
                >
                  <span class="font-medium">Supprimer tout</span>
                  <span class="text-xs">Items perdus</span>
                </UButton>
              </div>
            </div>

            <UButton
              @click="showDelete = false"
              variant="outline"
              color="gray"
              class="w-full"
            >
              Annuler
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const props = defineProps<{
  isVisible: boolean
  selectedChest: any
  chestEntries: any[]
  availableChests: any[]
}>()

const emit = defineEmits<{
  'close': []
  'confirm-rename': [newName: string]
  'confirm-delete': [options: { migrateTo?: string; confirmed?: boolean }]
}>()

// États locaux
const showRename = ref(false)
const showDelete = ref(false)
const showMigrateOptions = ref(false)
const newChestName = ref('')
const selectedMigrateTarget = ref('')
const loading = ref(false)

// Computed
const totalItems = computed(() =>
  props.chestEntries.reduce((sum, entry) => sum + entry.quantity, 0)
)

const usedSlots = computed(() => props.chestEntries.length)

const availableTargets = computed(() =>
  props.availableChests.filter(chest => chest._id !== props.selectedChest?._id)
)

// Fonctions utilitaires
const formatDate = (date: string) => {
  if (!date) return ''
  try {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr })
  } catch {
    return date
  }
}

// Gestion des actions
const confirmRename = async () => {
  if (!newChestName.value.trim() || newChestName.value.trim() === props.selectedChest?.name) return

  loading.value = true
  try {
    await emit('confirm-rename', newChestName.value.trim())
    showRename.value = false
    newChestName.value = ''
    emit('close')
  } catch (error) {
    console.error('Erreur lors du renommage:', error)
  } finally {
    loading.value = false
  }
}

const confirmDeleteEmpty = async () => {
  loading.value = true
  try {
    await emit('confirm-delete', { confirmed: true })
    emit('close')
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    loading.value = false
  }
}

const confirmMigrateAndDelete = async () => {
  if (!selectedMigrateTarget.value) {
    alert('Veuillez sélectionner un coffre de destination.')
    return
  }

  loading.value = true
  try {
    await emit('confirm-delete', {
      migrateTo: selectedMigrateTarget.value,
      confirmed: true
    })
    emit('close')
  } catch (error) {
    console.error('Erreur lors de la migration et suppression:', error)
  } finally {
    loading.value = false
  }
}

const confirmForceDelete = async () => {
  if (!confirm(`⚠️ ATTENTION: Cette action est IRRÉVERSIBLE !\n\nTous les ${totalItems.value} items de ce coffre seront définitivement perdus.\n\nVoulez-vous vraiment continuer ?`)) {
    return
  }

  loading.value = true
  try {
    await emit('confirm-delete', { confirmed: true })
    emit('close')
  } catch (error) {
    console.error('Erreur lors de la suppression forcée:', error)
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => props.isVisible, (visible) => {
  if (visible) {
    showRename.value = false
    showDelete.value = false
    showMigrateOptions.value = false
    newChestName.value = props.selectedChest?.name || ''
    selectedMigrateTarget.value = ''
  }
})

watch(() => props.selectedChest, (newChest) => {
  if (newChest) {
    newChestName.value = newChest.name || ''
  }
})
</script>
