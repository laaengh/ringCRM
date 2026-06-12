<!-- filepath: /Users/marcus/dev/quasar/ringCRM/src/pages/CustomerList.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md items-start">
      <div class="col-12">
        <h4 class="q-my-none">Kundeliste</h4>
        <p class="text-grey-7 q-mt-sm">Bedrifter du har lagt til i ringelisten din.</p>
      </div>

      <div v-if="loading" class="col-12 flex justify-center">
        <q-spinner size="40px" color="primary" />
      </div>

      <div v-else-if="error" class="col-12">
        <q-banner rounded class="bg-red-1 text-red-9">{{ error }}</q-banner>
      </div>

      <div v-else class="col-12">
        <q-table
          flat
          bordered
          :rows="companies"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 15 }"
        >
          <template #body-cell-kommune="props">
            <q-td :props="props">
              {{ extractKommune(props.row) }}
            </q-td>
          </template>

          <template #body-cell-sistOppdatert="props">
            <q-td :props="props">
              {{ formatDate(getLastUpdated(props.row)) }}
            </q-td>
          </template>

          <template #body-cell-handlinger="props">
            <q-td :props="props">
              <q-btn
                    color="blue"
                    icon="details"
                    label="Detaljer"
                />
            </q-td>
          </template>

          <template #no-data>
            <div class="full-width text-center q-pa-md text-grey-7">
              Ingen bedrifter i ringelisten ennå.
            </div>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from 'boot/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const companies = ref([])
const loading = ref(false)
const error = ref('')
let currentUser = null
let unsubscribeAuth = null

const columns = [
  { name: 'firmaNavn', label: 'Firmanavn', field: 'firmaNavn', align: 'left', sortable: false },
  { name: 'orgNummer', label: 'Orgnr', field: 'orgNummer', align: 'left', sortable: false },
  { name: 'kommune', label: 'Kommune', field: 'kommune', align: 'left' },
  { name: 'firmaStatus', label: 'Status', field: 'firmaStatus', align: 'left', sortable: true },
  { name: 'sistOppdatert', label: 'Sist oppdatert', field: 'sistOppdatert', align: 'left' },
  { name: 'handlinger', label: 'Handlinger', field: 'handlinger', align: 'left' },
]

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    currentUser = user
    if (user) {
      await fetchCallList()
    } else {
      companies.value = []
      error.value = 'Du må være logget inn for å se kundelisten.'
    }
  })
})

onBeforeUnmount(() => {
  if (unsubscribeAuth) unsubscribeAuth()
})

function extractKommune(row) {
  if (row.kommune) return row.kommune
  if (row.firmaKommune) return row.firmaKommune
  if (!row.firmaAdresse) return '—'
  const parts = String(row.firmaAdresse).split(',').map((p) => p.trim()).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : '—'
}

function toDate(value) {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate() // Firestore Timestamp
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getLastUpdated(row) {
  return row.updatedAt || row.legtTilDato || row.registreringsDato || null
}

function formatDate(value) {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('nb-NO', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

async function fetchCallList() {
  loading.value = true
  error.value = ''

  try {
    const q = query(
      collection(db, 'ringeListe'),
      where('fbUID', '==', currentUser.uid)
    )
    const snap = await getDocs(q)
    companies.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Kunne ikke hente kundeliste.'
  } finally {
    loading.value = false
  }
}
</script>