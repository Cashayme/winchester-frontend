<template>
  <UModal v-model="isOpen" prevent-close>
    <!-- Modal de renommage -->
    <UCard v-if="mode === 'rename'" class="max-w-md" role="dialog" aria-labelledby="rename-title" aria-describedby="rename-description">
      <template #header>
        <div class="flex items-center gap-2" id="rename-title">
          <UIcon name="i-mdi-pencil" class="w-5 h-5 text-yellow-500" />
          <h3 class="text-lg font-semibold">Renommer le coffre</h3>
        </div>
        <p id="rename-description" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Entrez un nouveau nom pour ce coffre
        </p>
      </template>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Nouveau nom</label>
          <UInput
            v-model="newName"
            placeholder="Entrez le nouveau nom..."
            :maxlength="50"
            @keyup.enter="confirmRename"
            autofocus
          />
          <p class="text-xs text-gray-500 mt-1">{{ newName.length }}/50 caractères</p>
        </div>

        <div class="flex gap-2">
          <UButton
            @click="confirmRename"
            :disabled="!newName.trim() || newName.trim() === selectedChest?.name"
            color="yellow"
            variant="solid"
            class="flex-1"
            :loading="loading"
          >
            Renommer
          </UButton>
          <UButton
            @click="close"
            variant="outline"
            color="gray"
            class="flex-1"
          >
            Annuler
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Modal de suppression -->
    <UCard v-else-if="mode === 'delete'" class="max-w-lg" role="dialog" aria-labelledby="delete-title" aria-describedby="delete-description">
      <template #header>
        <div class="flex items-center gap-2 text-red-500" id="delete-title">
          <UIcon name="i-mdi-delete" class="w-5 h-5" />
          <h3 class="text-lg font-semibold">Supprimer le coffre</h3>
        </div>
        <p id="delete-description" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Choisissez comment procéder avec le coffre sélectionné
        </p>
      </template>

        <!-- Étape 1: Choix de l'action -->
        <div v-if="deleteStep === 1" class="space-y-4 mt-4">
          <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div class="flex items-start gap-3">
              <UIcon name="i-mdi-alert-circle" class="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-red-800 dark:text-red-200">Attention</h4>
                <p class="text-sm text-red-700 dark:text-red-300 mt-1">
                  Vous êtes sur le point de supprimer le coffre <strong>{{ selectedChest?.name }}</strong>.
                  Cette action est <strong>irréversible</strong>.
                </p>
              </div>
            </div>
          </div>

          <div v-if="selectedChestEntries.length === 0" class="text-center">
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <UIcon name="i-mdi-check-circle" class="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p class="text-sm text-green-700 dark:text-green-300">
                Ce coffre est vide. Il peut être supprimé sans risque.
              </p>
            </div>

            <div class="flex gap-2 mt-6">
              <UButton
                @click="confirmDeleteEmpty"
                color="red"
                variant="solid"
                class="flex-1"
                :loading="loading"
              >
                Supprimer le coffre
              </UButton>
              <UButton
                @click="close"
                variant="outline"
                color="gray"
                class="flex-1"
              >
                Annuler
              </UButton>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="grid grid-cols-2 gap-4 text-center">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <UIcon name="i-mdi-package-variant-closed" class="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 class="font-medium text-blue-800 dark:text-blue-200">Migrer les items</h4>
                <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Déplacer {{ selectedChestEntries.length }} items vers un autre coffre
                </p>
              </div>
              <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <UIcon name="i-mdi-delete-forever" class="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h4 class="font-medium text-red-800 dark:text-red-200">Supprimer définitivement</h4>
                <p class="text-sm text-red-700 dark:text-red-300 mt-1">
                  Perdre {{ selectedChestEntries.length }} items définitivement
                </p>
              </div>
            </div>

            <div class="flex gap-2">
              <UButton
                @click="deleteStep = 2"
                color="blue"
                variant="solid"
                class="flex-1"
              >
                Migrer les items
              </UButton>
              <UButton
                @click="deleteStep = 3"
                color="red"
                variant="solid"
                class="flex-1"
              >
                Supprimer définitivement
              </UButton>
              <UButton
                @click="close"
                variant="outline"
                color="gray"
                class="flex-1"
              >
                Annuler
              </UButton>
            </div>
          </div>
        </div>

        <!-- Étape 2: Sélection du coffre de destination -->
        <div v-if="deleteStep === 2" class="space-y-4">
          <div class="text-center">
            <UIcon name="i-mdi-package-variant-closed" class="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h4 class="text-lg font-medium">Sélectionner le coffre de destination</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Les {{ selectedChestEntries.length }} items seront déplacés vers ce coffre.
            </p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium">Coffre de destination</label>
            <USelectMenu
              v-model="selectedTargetChestId"
              :options="availableTargetChests"
              option-attribute="name"
              value-attribute="_id"
              placeholder="Choisir un coffre..."
            />
          </div>

          <div class="flex gap-2">
            <UButton
              @click="confirmMigrateAndDelete"
              :disabled="!selectedTargetChestId"
              color="blue"
              variant="solid"
              class="flex-1"
              :loading="loading"
            >
              Migrer et supprimer
            </UButton>
            <UButton
              @click="deleteStep = 1"
              variant="outline"
              color="gray"
              class="flex-1"
            >
              Retour
            </UButton>
          </div>
        </div>

        <!-- Étape 3: Confirmation de suppression définitive -->
        <div v-if="deleteStep === 3" class="space-y-4">
          <div class="text-center">
            <UIcon name="i-mdi-alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 class="text-lg font-medium text-red-600 dark:text-red-400">SUPPRESSION DÉFINITIVE</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Les {{ selectedChestEntries.length }} items suivants seront <strong>perdus définitivement</strong> :
            </p>
          </div>

          <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 max-h-32 overflow-y-auto">
            <div class="space-y-1">
              <div
                v-for="entry in selectedChestEntries.slice(0, 5)"
                :key="entry._id"
                class="text-sm text-red-700 dark:text-red-300"
              >
                • {{ entry.item?.nom || 'Item inconnu' }} (x{{ entry.quantity }})
              </div>
              <div v-if="selectedChestEntries.length > 5" class="text-sm text-red-600 dark:text-red-400">
                ... et {{ selectedChestEntries.length - 5 }} autres items
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div class="flex items-start gap-3">
              <UIcon name="i-mdi-alert" class="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 class="font-medium text-yellow-800 dark:text-yellow-200">Dernière confirmation</h4>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Tapez <strong>"SUPPRIMER"</strong> pour confirmer la suppression définitive :
                </p>
              </div>
            </div>
            <UInput
              v-model="deleteConfirmation"
              placeholder="Tapez SUPPRIMER..."
              class="mt-2"
              @keyup.enter="confirmForceDelete"
              autofocus
            />
          </div>

          <div class="flex gap-2">
            <UButton
              @click="confirmForceDelete"
              :disabled="deleteConfirmation !== 'SUPPRIMER'"
              color="red"
              variant="solid"
              class="flex-1"
              :loading="loading"
            >
              SUPPRIMER DÉFINITIVEMENT
            </UButton>
            <UButton
              @click="deleteStep = 1"
              variant="outline"
              color="gray"
              class="flex-1"
            >
              Retour
            </UButton>
          </div>
        </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  mode: 'rename' | 'delete' | null
  selectedChest: any
  selectedChestEntries: any[]
  availableChests: any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm-rename': [newName: string]
  'confirm-delete': [options: { migrateTo?: string; confirmed?: boolean }]
}>()

// États
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const newName = ref('')
const deleteStep = ref(1)
const selectedTargetChestId = ref('')
const deleteConfirmation = ref('')

// Computed
const availableTargetChests = computed(() =>
  props.availableChests.filter(chest => chest._id !== props.selectedChest?._id)
)

// Méthodes
const close = () => {
  isOpen.value = false
  resetStates()
}

const resetStates = () => {
  newName.value = ''
  deleteStep.value = 1
  selectedTargetChestId.value = ''
  deleteConfirmation.value = ''
  loading.value = false
}

const confirmRename = async () => {
  if (!newName.value.trim() || newName.value.trim() === props.selectedChest?.name) return

  loading.value = true
  try {
    await emit('confirm-rename', newName.value.trim())
    close()
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
    close()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    loading.value = false
  }
}

const confirmMigrateAndDelete = async () => {
  if (!selectedTargetChestId.value) return

  loading.value = true
  try {
    await emit('confirm-delete', {
      migrateTo: selectedTargetChestId.value,
      confirmed: true
    })
    close()
  } catch (error) {
    console.error('Erreur lors de la migration et suppression:', error)
  } finally {
    loading.value = false
  }
}

const confirmForceDelete = async () => {
  if (deleteConfirmation.value !== 'SUPPRIMER') return

  loading.value = true
  try {
    await emit('confirm-delete', { confirmed: true })
    close()
  } catch (error) {
    console.error('Erreur lors de la suppression définitive:', error)
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => props.mode, (newMode) => {
  if (newMode === 'rename' && props.selectedChest) {
    newName.value = props.selectedChest.name
  }
})

watch(isOpen, (newValue) => {
  if (!newValue) {
    resetStates()
  }
})
</script>
