import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Helper function to get current user once
const getCurrentUser = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(
      getAuth(),
      (user) => {
        unsubscribe()
        resolve(user)
      },
      () => {
        unsubscribe()
        resolve(null)
      },
    )
  })

export const getUserRoleLabel = (role) => {
  const labels = {
    user: 'Bruker',
  }
  return labels[role] || role || 'Ukjent'
}

export { getCurrentUser }
export default getCurrentUser
