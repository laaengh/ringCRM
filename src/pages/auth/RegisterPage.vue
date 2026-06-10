<template>
  <q-page
    class="column items-center justify-center q-mx-auto"
    style="width: clamp(320px, 50vw, 420px)"
  >
    <h1 class="text-h4 text-weight-medium text-center q-mb-md text-primary">Registrer deg</h1>

    <q-form class="full-width" @submit.prevent="onSave">
      <q-input v-model="name" label="Navn" outlined class="bg-white q-mb-md rounded-borders" />
      <q-input
        v-model="email"
        label="E-post"
        type="email"
        outlined
        class="bg-white q-mb-md rounded-borders"
      />
      <q-input
        v-model="phone"
        label="Telefonnummer"
        mask="+47 ########"
        outlined
        class="bg-white q-mb-md rounded-borders"
      />

      <q-input
        v-model="password"
        label="Passord"
        :type="showPassword ? 'text' : 'password'"
        outlined
        class="bg-white q-mb-md rounded-borders"
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
        :disabled="everythingInvalid"
        type="submit"
        label="Opprett"
        no-caps
        text-color="white"
        flat
        class="bg-primary q-py-md rounded-borders full-width"
        :loading="busy"
      />

      <div class="q-mt-md text-center">
        <span class="text-grey-7">Har du allerede en konto?</span>
        <q-btn
          flat
          no-caps
          color="primary"
          label="Logg inn"
          @click="$router.push('/auth/login')"
          class="q-ml-xs"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { db, auth } from 'boot/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { addDoc, collection } from 'firebase/firestore'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const busy = ref(false)

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')

const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const everythingInvalid = computed(() => {
  return !name.value || !email.value || !password.value
})

const onSave = async () => {
  busy.value = true
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCred.user

    // optional: set displayName on auth profile
    try {
      await updateProfile(user, { displayName: name.value })
    } catch (e) {
      console.warn('Could not update profile displayName', e)
    }

    // save user record in Firestore
    await addDoc(collection(db, 'users'), {
      name: name.value,
      email: email.value,
      phone: phone.value,
      fbUid: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    $q.notify({ message: 'Brukeren er registrert', color: 'positive', position: 'bottom' })
    await router.push({ name: 'HomePage' })
  } catch (err) {
    console.error('Registration error', err)
    const msg = err instanceof Error ? err.message : String(err)
    $q.notify({ message: 'Feil ved registrering: ' + msg, color: 'negative', position: 'bottom' })
  } finally {
    busy.value = false
  }
}
</script>

<style scoped lang="scss">
.q-input:deep(.q-field__control) {
  background-color: white;
}
</style>
