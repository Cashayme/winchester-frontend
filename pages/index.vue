<template>
  <div>
    <!-- Redirection automatique vers /chests -->
  </div>
</template>

<script setup lang="ts">
// Redirection automatique vers la page chests
definePageMeta({
  redirect: '/chests',
  middleware: 'auth'
})

// Redirection côté client au cas où
onMounted(() => {
  navigateTo('/chests')
})
</script>