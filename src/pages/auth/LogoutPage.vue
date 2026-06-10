<template>
  <q-page class="c-page flex justify-center items-center">
    <div>
      <h1 class="text-h3 text-primary">Logger ut<span class="dot-dot-dot"></span></h1>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = getAuth()

const logOut = async () => {
  await signOut(auth)
  await router.push('/auth/login')
}
logOut().catch(async (error) => {
  console.error('Error logging out: ', error)
  await router.push('/auth/login')
})
</script>

<style scoped>
.dot-dot-dot::after {
  position: absolute;
  content: '';
  animation: dots 3s steps(5, end) infinite;
}

@keyframes dots {
  0%,
  20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%,
  100% {
    content: '...';
  }
}
</style>
