<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'boot/firebase'
import EssentialLink from 'components/EssentialLink.vue'


// CHECK FOR AUTH CHANGES AND LOG THEM
let unsubscribeAuth = null

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('[AUTH] Logged in user:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      })
    } else {
      console.log('[AUTH] No user logged in')
    }
  })
})

onBeforeUnmount(() => {
  if (unsubscribeAuth) unsubscribeAuth()
})

const linksList = [
  {
    title: 'Dashboard/Index Page',
    icon: 'search',
    link: '/'
  },
  {
    title: 'brregSearch Page',
    icon: 'code',
    link: '/brreg-search'
  },
  {
    title: 'PotentialCustomers Page',
    icon: 'chat',
    link: '/potential-customers'
  },
  {
    title: 'CustomerList Page',
    icon: 'record_voice_over',
    link: '/customer-list'
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
