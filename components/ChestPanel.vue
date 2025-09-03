<template>
  <UCard class="panel brushed copper-outline with-rivets">
    <template #header>
      <h3 class="text-lg font-semibold flex items-center gap-2 text-white">
        <UIcon name="i-mdi-crown" class="w-5 h-5" />
        Coffres
      </h3>
    </template>

    <div class="space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-300">Coffre sélectionné</label>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="chest in chests"
            :key="chest._id"
            @click="$emit('chest-selected', chest._id)"
            @dblclick="$emit('manage-chest', chest._id)"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors copper-outline cursor-pointer',
              selectedChestId === chest._id
                ? 'bg-[rgba(122,28,28,0.18)] text-[#f5e7e7]'
                : 'bg-[rgba(20,22,28,0.7)] text-gray-300 hover:bg-[rgba(25,27,34,0.8)]'
            ]"
            :title="selectedChestId === chest._id ? 'Double-clic pour gérer ce coffre' : 'Cliquer pour sélectionner'"
          >
            {{ chest.name }}
          </button>
        </div>
      </div>

      <UButton
        @click="$emit('create-chest')"
        icon="i-mdi-plus"
        color="red"
        variant="outline"
        block
        size="lg"
        class="copper-outline"
      >
        Nouveau coffre
      </UButton>

      <hr class="my-4 copper-ring" />

      <div v-if="selectedChestId" class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-400">Items total</span>
          <span class="badge-blood px-2 py-0.5">{{ totalItems }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-400">Slots utilisés</span>
          <span class="badge-blood px-2 py-0.5">{{ usedSlots }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  chests: any[]
  selectedChestId: string
  chestEntries: any[]
}>()

defineEmits<{
  'chest-selected': [chestId: string]
  'create-chest': []
  'manage-chest': [chestId: string]
}>()

const totalItems = computed(() => {
  return props.chestEntries.reduce((sum, entry) => sum + entry.quantity, 0)
})

const usedSlots = computed(() => {
  return props.chestEntries.length
})
</script>
