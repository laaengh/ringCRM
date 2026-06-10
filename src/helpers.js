import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Helper function to get current user once
const getCurrentUser = () =>
  new Promise((resolve) => {
    console.log('[helpers] getCurrentUser: waiting for auth state')
    const unsubscribe = onAuthStateChanged(
      getAuth(),
      (user) => {
        console.log('[helpers] getCurrentUser: resolved', { uid: user?.uid || null })
        unsubscribe()
        resolve(user)
      },
      (error) => {
        console.error('[helpers] getCurrentUser: auth error', error)
        unsubscribe()
        resolve(null)
      },
    )
  })

export const getUserRoleLabel = (role) => {
  const labels = {
    admin: 'Administrator',
    user: 'Bruker',
  }
  const label = labels[role] || role || 'Ukjent'
  console.log('[helpers] getUserRoleLabel', { role, label })
  return label
}

export const isAdmin = async (forceRefresh = false) => {
  console.log('[helpers] isAdmin: start', { forceRefresh })
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    console.log('[helpers] isAdmin: no current user')
    return false
  }

  const idTokenResult = await currentUser.getIdTokenResult(forceRefresh)
  console.log('[helpers] isAdmin: token claims snapshot', idTokenResult?.claims)

  const isUserAdmin = idTokenResult?.claims?.bytteboksUserRole === 'admin'
  console.log('[helpers] isAdmin: evaluated', {
    uid: currentUser.uid,
    role: idTokenResult?.claims?.bytteboksUserRole || null,
    isAdmin: isUserAdmin,
  })
  return isUserAdmin
}

export const canViewAllBookings = async () => isAdmin(true)

export default isAdmin
