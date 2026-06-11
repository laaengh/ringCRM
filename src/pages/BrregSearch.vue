// Hjelp fra Copilod ask og edit mode. 

<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md items-start">
      <div class="col-12">
        <h4 class="q-my-none">Brreg Search</h4>
        <p class="text-grey-7 q-mt-sm">
          Søk på org.nummer eller firmanavn.
        </p>
      </div>

      <div class="col-12 col-md-8">
        <q-input
          v-model="searchQuery"
          outlined
          clearable
          label="Org.nummer eller firmanavn"
          hint="Eksempel: 931360523 eller Equinor"
          @keyup.enter="searchBrreg"
        >
          <template #append>
            <q-btn
              flat
              round
              icon="search"
              :loading="loading"
              @click="searchBrreg"
            />
          </template>
        </q-input>
      </div>

      <div class="col-12">
        <q-banner
          v-if="error"
          inline-actions
          rounded
          class="bg-red-1 text-red-9"
        >
          {{ error }}
        </q-banner>
      </div>

      <div
        v-if="hasSearched && !loading && results.length === 0 && !error"
        class="col-12"
      >
        <q-banner rounded class="bg-grey-2 text-grey-8">
          Ingen resultater funnet.
        </q-banner>
      </div>

      <div v-if="results.length" class="col-12">
        <div class="text-subtitle2 q-mb-md">
          Resultater: {{ results.length }}
        </div>

        <div class="row q-col-gutter-md">
          <div
            v-for="company in results"
            :key="company.organisasjonsnummer"
            class="col-12 col-md-6"
          >
            <q-card bordered>
              <q-card-section>
                <div class="text-h6">{{ company.navn }}</div>
                <div class="text-body2 text-grey-7">
                  Org nr: {{ company.organisasjonsnummer }}
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="text-body2">
                <div v-if="company.organisasjonsform?.beskrivelse">
                  <strong>Type:</strong> {{ company.organisasjonsform.beskrivelse }}
                </div>
                <div v-if="company.forretningsadresse">
                  <strong>Adresse:</strong>
                  {{
                    [
                      ...(company.forretningsadresse.adresse || []),
                      company.forretningsadresse.postnummer,
                      company.forretningsadresse.poststed
                    ].filter(Boolean).join(', ')
                  }}
                </div>
                <div>
                  <strong>Status:</strong>
                  {{ company.konkurs ? 'Konkurs' : 'Aktiv/registrert' }}
                </div>
                <div>
                <q-btn
                    color="blue"
                    icon="phone"
                    label="Legg til i ringeliste"
                    :loading="addingToList[company.organisasjonsnummer]"
                    @click="addToCallList(company)"
                />
                 <q-btn
                    color="blue"
                    icon="details"
                    label="Detaljer"
                />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { auth } from 'boot/firebase'
import { db } from 'boot/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const $q = useQuasar()
const searchQuery = ref('') 
const loading = ref(false)
const error = ref('')
const hasSearched = ref(false)
const results = ref([])
const addingToList = ref({})
let currentUser = null
let unsubscribeAuth = null

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    currentUser = user
  })
})

onBeforeUnmount(() => {
  if (unsubscribeAuth) unsubscribeAuth()
})

function isOrgNumber(value) {
  return /^\d{9}$/.test(value.trim())
}

function formatAddress(forretningsadresse) {
  if (!forretningsadresse) return ''
  return [
    ...(forretningsadresse.adresse || []),
    forretningsadresse.postnummer,
    forretningsadresse.poststed
  ].filter(Boolean).join(', ')
}

async function addToCallList(company) {
  if (!currentUser) {
    $q.notify({
      type: 'negative',
      message: 'Du må være logget inn for å legge til i ringeliste.',
      position: 'top'
    })
    return
  }

  addingToList.value[company.organisasjonsnummer] = true

  try {
    const callListData = {
      firmaNavn: company.navn,
      orgNummer: company.organisasjonsnummer,
      firmaType: company.organisasjonsform?.beskrivelse || '',
      firmaAdresse: formatAddress(company.forretningsadresse),
      firmaStatus: company.konkurs ? 'Konkurs' : 'Aktiv',
      firmaNaeringskode: company.naeringskode?.kode || '',
      mvaRegistrert: company.mvaRegistrert || false,
      antallAnsatte: null,
      registreringsDato: company.registreringsdato || serverTimestamp(),
      aktivBrreg: true,
      fbUID: currentUser.uid,
      legtTilDato: serverTimestamp()
    }

    await addDoc(collection(db, 'ringeListe'), callListData)

    $q.notify({
      type: 'positive',
      message: `${company.navn} lagt til i ringeliste`,
      position: 'top',
      icon: 'check_circle'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: `Feil ved lagring: ${err instanceof Error ? err.message : 'Ukjent feil'}`,
      position: 'top'
    })
  } finally {
    addingToList.value[company.organisasjonsnummer] = false
  }
}

async function searchBrreg() {
  const query = searchQuery.value.trim()

  hasSearched.value = true
  error.value = ''
  results.value = []

  if (!query) {
    error.value = 'Skriv inn org.nummer eller firmanavn for å søke.'
    return
  }

  try {
    const endpoint = isOrgNumber(query)
      ? `https://data.brreg.no/enhetsregisteret/api/enheter/${query}`
      : `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(query)}&size=25`

    const response = await fetch(endpoint)

    if (response.status === 404) {
      results.value = []
      return
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()

    results.value = isOrgNumber(query)
      ? [data]
      : (data?._embedded?.enheter || [])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Søk feilet.'
  } finally {
    loading.value = false
  }
}
</script>