<template>
  <q-page class="column items-center justify-center c-page">
    <div class="flex justify-center">
      <div class="column">
        <h1 class="text-h4 text-weight-medium text-center q-mb-md text-primary">Logg inn</h1>
        <q-input
          v-model="email"
          label="E-post"
          type="email"
          outlined
          class="bg-white q-mb-md rounded-borders"
          style="width: clamp(300px, 50vw, 380px)"
          :rules="[
            (val) => !!val || 'E-post er påkrevd',
            (val) => val.includes('@') || 'E-post må inneholde @',
            (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Ugyldig e-postadresse',
          ]"
          lazy-rules
        />
        <q-input
          v-model="password"
          label="Passord"
          :type="showPassword ? 'text' : 'password'"
          outlined
          class="bg-white q-mb-md rounded-borders"
          style="width: clamp(300px, 50vw, 380px)"
          :rules="[(val) => !!val || 'Passord er påkrevd']"
          lazy-rules
          ><div class="flex items-center">
            <q-btn
              @click="togglePasswordVisibility"
              :icon="showPassword ? 'visibility_off' : 'visibility'"
              no-caps
              flat
              round
              size="sm"
              style="height: fit-content"
            /></div
        ></q-input>
        <q-btn
          @click="onSignInWithEmail"
          :loading="busy"
          label="Logg inn"
          no-caps
          text-color="white"
          flat
          class="bg-primary rounded-borders"
          style="width: clamp(300px, 50vw, 380px)"
        />
        <div class="q-mt-md text-center">
          <span class="text-grey-7">Har du ikke en konto?</span>
          <q-btn
            flat
            no-caps
            color="primary"
            label="Registrer deg"
            @click="$router.push('/auth/register')"
            class="q-ml-xs"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { auth } from 'boot/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

const $q = useQuasar()
const router = useRouter()
const busy = ref(false)
const email = ref('')
const password = ref('')

const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const getErrorMessage = (error) => {
  const errorCode = error?.code || ''

  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Ugyldig e-postadresse'
    case 'auth/user-disabled':
      return 'Denne brukerkontoen er deaktivert'
    case 'auth/user-not-found':
      return 'Finner ingen bruker med denne e-postadressen'
    case 'auth/wrong-password':
      return 'Feil passord'
    case 'auth/invalid-credential':
      return 'Ugyldig e-post eller passord'
    case 'auth/too-many-requests':
      return 'For mange mislykkede forsøk. Prøv igjen senere'
    case 'auth/network-request-failed':
      return 'Nettverksfeil. Sjekk internettforbindelsen din'
    default:
      return 'Innlogging feilet. Sjekk e-post og passord'
  }
}

const onSignInWithEmail = async () => {
  if (!email.value || !password.value) {
    $q.notify({
      message: 'E-post og passord må fylles ut',
      color: 'negative',
      position: 'top',
      timeout: 3000,
    })
    return
  }

  busy.value = true
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    $q.notify({
      message: 'Velkommen!',
      color: 'positive',
      position: 'top',
      timeout: 2000,
    })
    await router.push({ name: 'HomePage' })
  } catch (err) {
    console.error('Error signing in', err)
    $q.notify({
      message: getErrorMessage(err),
      color: 'negative',
      position: 'top',
      timeout: 4000,
    })
  } finally {
    busy.value = false
  }
}
</script>
