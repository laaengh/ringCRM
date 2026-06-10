import { getAuth, onAuthStateChanged } from 'firebase/auth'

/**
 * Lightweight helpers for router guards.
 * Exports a `getCurrentUser` promise-based accessor that resolves
 * to the Firebase user or null. Also exports convenience functions
 * that return boolean promises when needed.
 */

export const getCurrentUser = () => {
  return new Promise((resolve) => {
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
}

export const isAdmin = async (
  to,
  from,
  next
) => {
  const currentUser = await getCurrentUser();
  const idTokenResult = await (currentUser).getIdTokenResult();

  if (idTokenResult.claims.verketMossUserRole === "admin") {
    // User is an admin, allow access
    next();
  } else {
    // User is not an admin, redirect to home
    next({ name: 'HomePage' });
  }
};

export const requireAuth = async () => {
  const user = await getCurrentUser()
  return !!user
}

export const requireNoAuth = async () => {
  const user = await getCurrentUser()
  return !user
}

export default {
  getCurrentUser,
  requireAuth,
  requireNoAuth,
  isAdmin,
}
