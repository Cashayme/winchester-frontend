export default defineNuxtRouteMiddleware(async (to, from) => {
  // Pages qui nécessitent une authentification
  const protectedRoutes = ['/chests', '/logs', '/']

  // Vérifier si la route actuelle nécessite une authentification
  const requiresAuth = protectedRoutes.some(route =>
    to.path === route || to.path.startsWith(`${route}/`)
  )

  // Si la route ne nécessite pas d'authentification, continuer
  if (!requiresAuth) {
    return
  }

  try {
    console.log('🔐 Vérification de l\'authentification pour:', to.path)

    // Configuration API
    const apiBase = 'https://backend.winchester-ascendancy.com/api'

    // Vérifier la session utilisateur
    const authResponse = await fetch(`${apiBase}/auth/me`, {
      credentials: 'include'
    })

    if (authResponse.ok) {
      const userData = await authResponse.json()

      // Vérifier les autorisations d'accès
      const accessResponse = await fetch(`${apiBase}/chests`, {
        credentials: 'include'
      })

      if (accessResponse.ok) {
        console.log('✅ Utilisateur authentifié et autorisé')
        return // Continuer vers la route demandée
      } else if (accessResponse.status === 403) {
        console.log('🚫 Utilisateur authentifié mais accès refusé')
        // Rediriger vers une page d'accès refusé au lieu de login
        return navigateTo('/login?error=access_denied')
      } else {
        console.log('❌ Erreur lors de la vérification des autorisations')
        return navigateTo('/login?error=server_error')
      }
    } else {
      console.log('🔒 Utilisateur non authentifié, redirection vers /login')
      // Rediriger vers login avec l'URL de destination
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification d\'authentification:', error)
    return navigateTo('/login?error=network_error')
  }
})
