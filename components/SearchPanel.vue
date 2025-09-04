<template>
  <UCard class="panel brushed copper-outline with-rivets">
    <template #header>
      <h3 class="text-lg font-semibold flex items-center gap-2 text-white">
        <UIcon name="i-mdi-magnify" class="w-5 h-5" />
        Recherche
      </h3>
    </template>

    <div class="space-y-4">
      <!-- Champ de recherche -->
      <UInput
        v-model="localQuery"
        @input="onPickerInputDebounced"
        @keydown.down.prevent="moveSel(1)"
        @keydown.up.prevent="moveSel(-1)"
        @keydown.enter.prevent="chooseSel()"
        placeholder="Rechercher un item..."
        size="lg"
      />

      <!-- Suggestions d'autocomplétion -->
      <div v-if="pickerOptions.length > 0" class="space-y-2">
        <p class="text-sm text-gray-400">Suggestions :</p>
        <div class="space-y-1 max-h-48 overflow-y-auto">
          <div
            v-for="(option, index) in pickerOptions.slice(0, 5)"
            :key="option._id"
            :class="[
              'p-3 rounded-lg cursor-pointer transition-colors copper-outline',
              index === suggestIdx ? 'bg-[rgba(122,28,28,0.18)] text-[#f5e7e7]' : 'bg-[rgba(20,22,28,0.7)] text-gray-200 hover:bg-[rgba(25,27,34,0.8)]'
            ]"
            @click="pick(option)"
          >
            <div class="flex items-center gap-3">
              <img
                :src="imageSrc(option)"
                :alt="option.nom"
                class="w-8 h-8 object-contain rounded bg-[rgba(12,14,20,0.35)]"
              />
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ option.nom }}</p>
                <p class="text-xs opacity-75">{{ option.categorie }}</p>
              </div>
              <span class="badge-blood px-2 py-0.5 text-xs">T{{ option.tier }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Aperçu de l'item sélectionné -->
      <div v-if="selectedItemPreview" class="p-4 bg-[rgba(20,22,28,0.7)] rounded-lg border border-blood-400/30">
        <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <UIcon name="i-mdi-eye" class="w-4 h-4 text-blood-400" />
          Aperçu de l'item
        </h4>

        <div class="flex items-start gap-4">
          <img
            :src="imageSrc(selectedItemPreview)"
            :alt="selectedItemPreview.nom"
            class="w-16 h-16 object-contain rounded-lg bg-[rgba(12,14,20,0.35)] ring-1 ring-blood-400/30"
          />

          <div class="flex-1 min-w-0">
            <h5 class="text-lg font-bold text-white mb-1">{{ selectedItemPreview.nom }}</h5>
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="chip chip--accent">{{ selectedItemPreview.categorie }}</span>
              <span class="chip">T{{ selectedItemPreview.tier }}</span>
              <span v-if="selectedItemPreview.unique" class="chip">⭐ Unique</span>
            </div>

            <p v-if="selectedItemPreview.description" class="text-sm text-gray-300 leading-relaxed">
              {{ selectedItemPreview.description }}
            </p>

            <div v-if="selectedItemPreview.statistiques && selectedItemPreview.statistiques.length > 0" class="mt-3">
              <p class="text-xs text-gray-400 mb-1">Statistiques principales :</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="stat in selectedItemPreview.statistiques.slice(0, 3)"
                  :key="stat.attribut"
                  class="text-xs px-2 py-1 bg-blood-400/20 text-blood-300 rounded"
                >
                  {{ stat.attribut }}: {{ stat.valeur }}{{ stat.est_pourcentage ? '%' : '' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration de la quantité -->
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-gray-300 flex-shrink-0">Quantité :</label>
          <div class="flex-1">
            <UInput
              v-model.number="selectedQuantity"
              type="number"
              min="1"
              max="999"
              size="sm"
              placeholder="1"
              class="text-center"
            />
          </div>
        </div>

        <button
          @click="addItemWithQuantity"
          :disabled="!canDeposit"
          class="nav-button-modern group w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'hover:scale-105': canDeposit }"
        >
          <UIcon name="i-mdi-plus" class="w-6 h-6 text-blood-400 group-hover:text-blood-300 transition-colors" />
          <span class="text-white group-hover:text-blood-200 transition-colors">
            Ajouter ×{{ selectedQuantity || 1 }}
          </span>
        </button>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  query: string
  pickerOptions: any[]
  selectedChestId: string
  pickerItemId: number | undefined
  selectedPick: any
}>()

const emit = defineEmits<{
  'query-changed': [query: string]
  'option-selected': [option: any]
  'deposit-one': []
  'deposit-with-quantity': [item: any, quantity: number]
}>()

const localQuery = ref(props.query)
const suggestIdx = ref(-1)
const selectedQuantity = ref(1)
const selectedItemPreview = ref<any>(null)

// Configuration API simplifiée pour Docker
const apiBase = 'https://backend.winchester-ascendancy.com/api'
const imagesBase = 'http://localhost:4000/images'

function debounce<T extends (...args: any[]) => any>(fn: T, ms = 150) {
  let t: any
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

const onPickerInputDebounced = debounce(async () => {
  const q = localQuery.value.trim()
  if (!q) {
    emit('query-changed', '')
    selectedItemPreview.value = null
    return
  }
  const params = new URLSearchParams({ q })
  try {
    const response = await fetch(`${apiBase}/items/suggest?${params.toString()}`, { credentials: 'include' })
    if (response.ok) {
      const res = await response.json()
      emit('option-selected', res || [])
      suggestIdx.value = (res?.length ? 0 : -1)
    }
  } catch (error) { console.error('Erreur onPickerInput:', error) }
}, 150)

// Fonction pour sélectionner un item et afficher l'aperçu
function pick(option: any) {
  localQuery.value = option?.nom || ''
  selectedItemPreview.value = option
  emit('option-selected', option)
}

// Nouvelle fonction pour ajouter un item avec quantité personnalisée
function addItemWithQuantity() {
  if (!selectedItemPreview.value || !props.selectedChestId) return

  const quantity = selectedQuantity.value || 1
  emit('deposit-with-quantity', selectedItemPreview.value, quantity)

  // Reset après ajout
  selectedItemPreview.value = null
  localQuery.value = ''
  selectedQuantity.value = 1
}

function moveSel(d: number) {
  if (!props.pickerOptions.length) return
  suggestIdx.value = (suggestIdx.value + d + props.pickerOptions.length) % props.pickerOptions.length
}

function chooseSel() {
  if (suggestIdx.value < 0 || suggestIdx.value >= props.pickerOptions.length) return
  pick(props.pickerOptions[suggestIdx.value])
}

function imageSrc(it: any) {
  const url = it?.image_url as string | undefined
  if (!url) return '/placeholder.png'
  if (url.startsWith('http')) return url
  return `${imagesBase}${url}`
}

const canDeposit = computed(() =>
  !!props.selectedChestId && (
    !!props.pickerItemId ||
    !!props.selectedPick ||
    !!selectedItemPreview.value ||
    props.pickerOptions.length > 0
  )
)

watch(() => props.query, (newQuery) => {
  localQuery.value = newQuery
})

// Reset l'aperçu quand la recherche change
watch(() => localQuery.value, (newQuery) => {
  if (!newQuery || newQuery.trim() === '') {
    selectedItemPreview.value = null
  }
})
</script>
