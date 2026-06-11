<template>
  <q-page class="flex flex-left">

    <div class="q-pa-md row-vertical-alignment" style="width: 100%;">
      <div class="stats-grid">
        <q-card class="bg-primary text-white">
           <t>Totalt antall kunder</t>
          <t>5</t>
          </q-card>
        <q-card class="bg-primary text-white">
          <t>Ny</t>
          <t>5</t>
        </q-card>
        <q-card class="bg-primary text-white">
          <t>Kontaktet</t>
          <t>5</t>
        </q-card>
        <q-card class="bg-primary text-white">
          <t>Interessert</t>
          <t>55</t>
        </q-card>
        <q-card class="bg-primary text-white">
           <t>Ikke aktuelle</t>
          <t>5</t>         
        </q-card>
        <q-card class="bg-primary text-white">
           <t>Kunder</t>
          <t>5</t>  
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style lang="sass">
.row-vertical-alignment
  .stats-grid
    display: grid
    grid-template-columns: repeat(4, minmax(0, 1fr))
    gap: 1rem

  .stats-grid > div
    padding: 10px 15px
    background: rgba(#999,.15)
    border: 1px solid rgba(#999,.2)
    border-radius: 6px
</style>