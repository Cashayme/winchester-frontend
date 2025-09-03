<template>
  <div class="space-y-6">

    <!-- Grille d'inventaire -->
    <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
      <div
        v-for="(slot, idx) in chestSlots"
        :key="idx"
        class="relative w-full"
      >
        <!-- Case d'inventaire -->
        <div
          :class="[
            'border rounded-lg p-2 transition-all duration-200 h-[120px] flex flex-col',
            {
              'bg-gray-800/50 cursor-pointer slot-filled inventory-slot hover:scale-105 hover:shadow-lg hover:border-blood-400': slot && slot.item,
              'inventory-slot--selected glow-accent': slot && slot.item && isSelected(slot, idx),
              'bg-gray-800/30 border-gray-600/40': !slot || !slot.item,
              'item-newly-added': slot && slot.item && isNewlyAdded(slot, idx)
            }
          ]"
          @click="slot && slot.item ? toggleItemDetails(slot, idx) : null"
        >
          <!-- Image -->
          <div class="flex justify-center mb-2">
            <div class="relative">
              <img
                v-if="slot && slot.item"
                :src="imageSrc(slot.item)"
                :alt="slot.item.nom"
                class="w-12 h-12 object-contain rounded"
              />
              <div v-else class="flex items-center justify-center w-full py-8">
                <!-- Icône de slot mécanique élégant - parfaitement centré -->
                <div class="relative flex items-center justify-center">
                  <!-- Cercle extérieur avec mécanisme -->
                  <div class="w-10 h-10 rounded-full border-2 border-gray-500/40 flex items-center justify-center">
                    <!-- Symbole central parfaitement centré -->
                    <span class="text-gray-400/60 font-bold text-xl select-none leading-none">+</span>
                  </div>

                  <!-- Points de fixation mécaniques discrets -->
                  <div class="absolute -top-1 -left-1 w-0.5 h-0.5 bg-gray-500/30 rounded-full"></div>
                  <div class="absolute -top-1 -right-1 w-0.5 h-0.5 bg-gray-500/30 rounded-full"></div>
                  <div class="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-gray-500/30 rounded-full"></div>
                  <div class="absolute -bottom-1 -right-1 w-0.5 h-0.5 bg-gray-500/30 rounded-full"></div>
                </div>
              </div>

              <!-- Indicateurs spéciaux -->
              <div v-if="slot?.item?.unique" class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span class="text-xs text-black font-bold">★</span>
              </div>
              <div v-else-if="slot?.item && slot.item.tier >= 3" class="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full flex items-center justify-center">
                <span class="text-xs text-white font-bold">◆</span>
              </div>
            </div>
          </div>

          <!-- Nom et quantité -->
          <div class="flex-1 flex flex-col justify-between text-center min-h-0">
            <div class="flex-1 flex items-center justify-center min-h-0">
              <p class="text-xs font-medium text-white leading-tight line-clamp-2 break-words px-1">
                {{ slot && slot.item ? slot.item.nom : '' }}
              </p>
            </div>
            <div v-if="slot && slot.item" class="mt-1">
              <span class="inline-block badge-blood text-xs px-1.5 py-0.5 rounded font-medium">
                ×{{ slot.quantity || 1 }}
              </span>
            </div>
          </div>
        </div>

        <!-- Overlay avec détails (apparait au clic) -->
                          <div
                    ref="tooltipOverlay"
                    v-if="selectedSlotIndex === idx && slot && slot.item"
                    class="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 tooltip-manual"
                    @click.self="closeItemDetails"
                  >
          <div
            class="tooltip-surface p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            :style="{
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: saveAnimationStep === 3 ? 0 : 1,
              transform: saveAnimationStep === 3 ? 'translateY(-20px) scale(0.9)' : 'translateY(0) scale(1)',
              filter: saveAnimationStep === 3 ? 'blur(2px) brightness(0.9)' : 'blur(0px) brightness(1)'
            }"
          >
            <div class="bar-copper mb-4"></div>
            <!-- Header avec image -->
            <div class="flex items-start gap-4 mb-4">
              <img
                :src="imageSrc(slot.item)"
                :alt="slot.item.nom"
                class="w-20 h-20 object-contain rounded-lg bg-[rgba(12,14,20,0.35)] p-2 flex-shrink-0 ring-1 ring-[rgba(255,255,255,0.06)]"
              />
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-bold text-white mb-2">{{ slot.item.nom }}</h3>
                <div class="flex items-center gap-2 mb-2">
                  <span class="chip chip--accent">×{{ slot.quantity }}</span>
                  <span v-if="slot.item.tier" class="chip">T{{ slot.item.tier }}</span>
                  <span v-if="slot.item.categorie" class="chip">{{ slot.item.categorie }}</span>
                </div>
              </div>
              <UButton
                @click="closeItemDetails"
                icon="i-mdi-close"
                color="gray"
                variant="ghost"
                size="sm"
                class="flex-shrink-0"
              />
            </div>

            <!-- Description -->
            <p v-if="slot.item.description" class="text-gray-300 text-sm leading-relaxed mb-4">
              {{ slot.item.description }}
            </p>

            <!-- Bouton Détails -->
            <div class="flex gap-2 mb-4">
              <UButton
                v-if="slot.item.url_fiche"
                :href="slot.item.url_fiche"
                target="_blank"
                icon="i-mdi-open-in-new"
                color="blue"
                variant="outline"
                size="sm"
              >
                Voir la fiche
              </UButton>
              <UButton
                v-else
                icon="i-mdi-information-outline"
                color="gray"
                variant="outline"
                size="sm"
                disabled
              >
                Détails
              </UButton>
            </div>

            <!-- Statistiques -->
            <div v-if="slot.item.statistiques && slot.item.statistiques.length > 0" class="mb-4">
              <h4 class="text-sm font-semibold text-white mb-2">Statistiques</h4>
              <div class="space-y-1">
                <div
                  v-for="stat in slot.item.statistiques"
                  :key="stat.attribut"
                  class="flex items-center justify-between text-xs"
                >
                  <span class="text-gray-400">{{ stat.attribut }}</span>
                  <div class="flex items-center gap-1">
                    <span class="text-white">{{ stat.valeur }}{{ stat.est_pourcentage ? '%' : '' }}</span>
                    <span>{{ stat.mieux_plus_haut ? '📈' : '📉' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contrôles de quantité (bouton OK teinté) -->
            <div class="border-t border-blood/50 pt-4">
              <h4 class="text-sm font-semibold text-white mb-3">Modifier la quantité</h4>
              <div class="flex items-center gap-2 mb-3">
                <div class="flex-1">
                  <UInput
                    v-model.number="localEditQuantity"
                    type="number"
                    min="1"
                    max="999"
                    size="sm"
                    placeholder="Qté"
                    :class="{ 'quantity-input-changed': quantityChanged }"
                    @keydown.enter="handleEnterKey"
                  />
                </div>
                <UButton
                  @click="setItemQuantity(localEditQuantity)"
                  :disabled="!localEditQuantity || localEditQuantity < 1 || localEditQuantity === (slot?.quantity || 1) || quantityLoading"
                  :icon="quantityLoading ? 'i-mdi-loading' : 'i-mdi-check'"
                  color="blood"
                  variant="solid"
                  size="sm"
                  class="quantity-button btn-blood"
                  :class="{ 'quantity-loading-icon': quantityLoading }"
                >
                  OK
                </UButton>
              </div>
            </div>

            <!-- Boutons d'ajustement subtils -->
            <div class="space-y-4">
              <!-- Section Réduire -->
              <div>
                <div class="flex items-center justify-center mb-3">
                  <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                    <UIcon name="i-mdi-minus-circle" class="w-3 h-3 text-red-400" />
                    <span class="text-xs font-medium text-red-300">Ajustements</span>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-1.5">
                  <button
                    @click="adjustQuantity(-10)"
                    class="group flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800/50 hover:bg-red-500/20 border border-gray-700/50 hover:border-red-400/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    title="Réduire de 10"
                  >
                    <UIcon name="i-mdi-minus" class="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors duration-200" />
                    <span class="text-xs font-medium text-gray-300 group-hover:text-red-200 mt-1 transition-colors duration-200">10</span>
                  </button>
                  <button
                    @click="adjustQuantity(-5)"
                    class="group flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800/50 hover:bg-red-500/20 border border-gray-700/50 hover:border-red-400/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    title="Réduire de 5"
                  >
                    <UIcon name="i-mdi-minus" class="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors duration-200" />
                    <span class="text-xs font-medium text-gray-300 group-hover:text-red-200 mt-1 transition-colors duration-200">5</span>
                  </button>
                  <button
                    @click="adjustQuantity(-1)"
                    class="group flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800/50 hover:bg-red-500/20 border border-gray-700/50 hover:border-red-400/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    title="Réduire de 1"
                  >
                    <UIcon name="i-mdi-minus" class="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors duration-200" />
                    <span class="text-xs font-medium text-gray-300 group-hover:text-red-200 mt-1 transition-colors duration-200">1</span>
                  </button>
                </div>
              </div>

              <!-- Section Augmenter -->
              <div>
                <div class="flex items-center justify-center mb-3">
                  <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <UIcon name="i-mdi-plus-circle" class="w-3 h-3 text-green-400" />
                    <span class="text-xs font-medium text-green-300">Ajustements</span>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-1.5">
                  <button
                    @click="adjustQuantity(1)"
                    class="group flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800/50 hover:bg-green-500/20 border border-gray-700/50 hover:border-green-400/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    title="Augmenter de 1"
                  >
                    <UIcon name="i-mdi-plus" class="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors duration-200" />
                    <span class="text-xs font-medium text-gray-300 group-hover:text-green-200 mt-1 transition-colors duration-200">1</span>
                  </button>
                  <button
                    @click="adjustQuantity(5)"
                    class="group flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800/50 hover:bg-green-500/20 border border-gray-700/50 hover:border-green-400/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    title="Augmenter de 5"
                  >
                    <UIcon name="i-mdi-plus" class="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors duration-200" />
                    <span class="text-xs font-medium text-gray-300 group-hover:text-green-200 mt-1 transition-colors duration-200">5</span>
                  </button>
                  <button
                    @click="adjustQuantity(10)"
                    class="group flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800/50 hover:bg-green-500/20 border border-gray-700/50 hover:border-green-400/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    title="Augmenter de 10"
                  >
                    <UIcon name="i-mdi-plus" class="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors duration-200" />
                    <span class="text-xs font-medium text-gray-300 group-hover:text-green-200 mt-1 transition-colors duration-200">10</span>
                  </button>
                </div>
              </div>

              <!-- Section Supprimer (outlined rouge discret) -->
              <div class="mt-6 pt-4 border-t border-blood/50">
                <UButton
                  @click="removeItem"
                  :disabled="quantityLoading"
                  :icon="quantityLoading ? 'i-mdi-loading' : 'i-mdi-trash-can'"
                  color="red"
                  variant="outline"
                  block
                  size="sm"
                  class="border-red-500 text-red-500 cursor-pointer disabled:cursor-not-allowed"
                >
                  {{ quantityLoading ? 'Suppression...' : 'Supprimer' }}
                </UButton>
              </div>
            </div>

            <!-- Animation de succès élégante -->
            <div
              v-if="saveAnimationStep > 0"
              class="text-center mt-4 relative overflow-hidden"
            >
              <!-- État de sauvegarde -->
              <div
                v-if="saveAnimationStep === 1"
                class="flex items-center justify-center gap-2 text-blue-400"
              >
                <UIcon name="i-mdi-loading" class="w-5 h-5 animate-spin" />
                <span class="text-sm font-medium">Sauvegarde en cours...</span>
              </div>

              <!-- État de succès -->
              <div
                v-else-if="saveAnimationStep === 2"
                class="relative shadow-none border-none"
                style="box-shadow: none; border: none;"
              >
                <!-- Cercle d'animation -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-16 h-16 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin save-success-ring"></div>
                </div>

                <!-- Icône de succès -->
                <div class="relative flex items-center justify-center gap-2">
                  <div class="relative">
                    <UIcon name="i-mdi-check-circle" class="w-6 h-6 animate-pulse text-green-400" />
                    <div class="absolute inset-0 bg-green-400/30 rounded-full animate-ping"></div>
                  </div>
                  <div
                    class="inline-block p-0 m-0 bg-transparent shadow-none border-none"
                    style="box-shadow: none; border: none; outline: none; background: transparent;"
                  >
                    <span
                      class="text-sm font-medium animate-pulse text-green-400 shadow-none border-none"
                      style="box-shadow: none !important; border: none !important; outline: none !important; background: transparent !important;"
                    >Changements sauvegardés !</span>
                  </div>
                </div>

                <!-- Particules de célébration -->
                <div class="absolute inset-0 pointer-events-none">
                  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div class="w-1 h-1 bg-green-400 rounded-full save-success-particle" style="animation-delay: 0.1s;"></div>
                  </div>
                  <div class="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                    <div class="w-1 h-1 bg-green-400 rounded-full save-success-particle" style="animation-delay: 0.2s;"></div>
                  </div>
                  <div class="absolute top-2/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
                    <div class="w-1 h-1 bg-green-400 rounded-full save-success-particle" style="animation-delay: 0.3s;"></div>
                  </div>
                </div>
              </div>

              <!-- État de fermeture -->
              <div
                v-else-if="saveAnimationStep === 3"
                class="flex items-center justify-center gap-2 text-gray-400"
              >
                <UIcon name="i-mdi-eye-off" class="w-5 h-5" />
                <span class="text-sm">Fermeture...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contrôles de pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <div class="flex items-center gap-2">
          <UButton
            @click="prevPage"
            :disabled="currentPage <= 1"
            variant="outline"
            size="sm"
            color="gray"
          >
            <UIcon name="i-mdi-chevron-left" class="w-4 h-4" />
            Précédent
          </UButton>

          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400">Page</span>
            <span class="text-sm font-medium text-white">{{ currentPage }}</span>
            <span class="text-sm text-gray-400">sur</span>
            <span class="text-sm font-medium text-white">{{ totalPages }}</span>
          </div>

          <UButton
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            variant="outline"
            size="sm"
            color="gray"
          >
            Suivant
            <UIcon name="i-mdi-chevron-right" class="w-4 h-4" />
          </UButton>
        </div>

        <!-- Indicateur d'items -->
        <div class="text-xs text-gray-500">
          {{ chestEntries.length }} items au total
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  chestSlots: any[]
  selectedChestId: string
  selectedChestName: string
  chestEntries: any[]
  selectedEntryIdx: number | null
  editQuantity: number
  quantityChanged: boolean
  quantityLoading: boolean
  quantityRecentlyChanged: boolean
  saveAnimationStep: number
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  'slot-clicked': [slot: any, index: number]
  'item-details-closed': []
  'quantity-changed': [newQuantity: number]
  'adjust-quantity': [delta: number]
  'page-changed': [page: number]
  'remove-item': [slot: any, index: number]
  'mark-new-item': [itemId: string, slotIndex: number]
}>()

// Exposer la fonction pour usage externe
defineExpose({
  markItemAsNew
})

// Configuration API simplifiée pour Docker
const apiBase = 'http://localhost:4000/api'
const imagesBase = 'http://localhost:4000/images'

// Système de suivi des nouveaux items pour l'animation
const newlyAddedItems = ref<Set<string>>(new Set())
const animationTimeouts = ref<Map<string, number>>(new Map())

// Fonction pour marquer un item comme nouvellement ajouté
function markItemAsNew(itemId: string, slotIndex: number) {
  const key = `${itemId}-${slotIndex}`
  newlyAddedItems.value.add(key)

  // Supprimer l'animation après 3 secondes
  const timeoutId = window.setTimeout(() => {
    newlyAddedItems.value.delete(key)
    animationTimeouts.value.delete(key)
  }, 3000)

  animationTimeouts.value.set(key, timeoutId)
}

// Fonction pour vérifier si un item est nouvellement ajouté
function isNewlyAdded(slot: any, slotIndex: number): boolean {
  if (!slot || !slot.item) return false
  const key = `${slot.item._id}-${slotIndex}`
  return newlyAddedItems.value.has(key)
}

// Nettoyer les timeouts au démontage du composant
onUnmounted(() => {
  animationTimeouts.value.forEach(timeoutId => {
    clearTimeout(timeoutId)
  })
  animationTimeouts.value.clear()
  newlyAddedItems.value.clear()
})

// Gestion des détails d'item
const selectedSlotIndex = ref<number | null>(null)
const tooltipOverlay = ref<HTMLElement | null>(null)

const isSelected = (slot: any, slotIndex: number) => {
  return props.selectedEntryIdx === slotIndex
}

function toggleItemDetails(slot: any, slotIndex: number) {
  if (!slot || !slot.item) {
    selectedSlotIndex.value = null
    return
  }

  selectedSlotIndex.value = (selectedSlotIndex.value === slotIndex ? null : slotIndex)
  emit('slot-clicked', slot, slotIndex)
}

function closeItemDetails() {
  selectedSlotIndex.value = null
  emit('item-details-closed')
}

// État local pour le champ de quantité
const localEditQuantity = ref(props.editQuantity || 1)

// Synchronisation avec la prop
watch(() => props.editQuantity, (newValue) => {
  localEditQuantity.value = newValue || 1
})

// Synchronisation de selectedSlotIndex avec selectedEntryIdx
watch(() => props.selectedEntryIdx, (newValue) => {
  selectedSlotIndex.value = newValue
})

// Animation manuelle avec JavaScript
watch(() => props.saveAnimationStep, async (newValue) => {
  await nextTick()

  if (newValue === 3) {
    if (tooltipOverlay.value && 'style' in tooltipOverlay.value) {
      const htmlElement = tooltipOverlay.value as HTMLElement
      htmlElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      htmlElement.style.opacity = '0'
      htmlElement.style.transform = 'translateY(-20px) scale(0.9)'
      htmlElement.style.filter = 'blur(2px) brightness(0.9)'
    }
  } else if (newValue === 2 && tooltipOverlay.value && 'style' in tooltipOverlay.value) {
    const htmlElement = tooltipOverlay.value as HTMLElement
    htmlElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    htmlElement.style.opacity = '1'
    htmlElement.style.transform = 'translateY(0) scale(1)'
    htmlElement.style.filter = 'blur(0px)'
  }
})

function handleEnterKey(event: KeyboardEvent) {
  event.preventDefault()

  const newQty = localEditQuantity.value
  if (!newQty || newQty < 1 || newQty === (props.selectedEntryIdx !== null ? props.chestEntries[props.selectedEntryIdx]?.quantity || 1 : 1)) return

  // Émettre directement l'événement de changement de quantité
  emit('quantity-changed', newQty)
}

function setItemQuantity(newQuantity: number) {
  emit('quantity-changed', newQuantity)
}

function adjustQuantity(delta: number) {
  emit('adjust-quantity', delta)
}

function removeItem() {
  if (selectedSlotIndex.value !== null) {
    const slot = props.chestSlots[selectedSlotIndex.value]
    if (slot && slot.item) {
      emit('remove-item', slot, selectedSlotIndex.value)
    }
  }
}

function nextPage() {
  if (props.currentPage < props.totalPages) {
    emit('page-changed', props.currentPage + 1)
  }
}

function prevPage() {
  if (props.currentPage > 1) {
    emit('page-changed', props.currentPage - 1)
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-changed', page)
  }
}

function imageSrc(it: any) {
  const url = it?.image_url as string | undefined
  if (!url) return '/placeholder.png'
  if (url.startsWith('http')) return url
  return `${imagesBase}${url}`
}
</script>
