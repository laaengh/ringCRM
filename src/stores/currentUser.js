import { defineStore, acceptHMRUpdate } from 'pinia'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, auth } from 'boot/firebase'

export const useUserStore = defineStore('useUserStore', {
  state: () => ({
    user: null
  }),
  getters: {
    getUser: (state) => state.user
  },
  actions: {
    async setUser() {
      try {
        const usersQuery = query(collection(db, 'users'), where('fbUid', '==', auth.currentUser?.uid))
        const usersSnap = await getDocs(usersQuery)
        if (!usersSnap.empty) {
          this.user = { ...usersSnap.docs[0].data(), id: usersSnap.docs[0].id }
        }
      } catch (e) {
        console.error('Failed to fetch user by fbUid', e)
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
