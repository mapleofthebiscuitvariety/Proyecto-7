<script setup>
import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js'
import { useTema } from '@/composables/useTema'

const { esOscuro, alternar } = useTema()
</script>

<template>
  <v-btn
    icon
    variant="text"
    :aria-label="esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    data-test="btn-tema"
    @click="alternar"
  >
    <v-icon :icon="esOscuro ? mdiWhiteBalanceSunny : mdiWeatherNight" />
  </v-btn>
</template>
