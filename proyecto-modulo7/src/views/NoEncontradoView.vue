<script setup>
import EstadoVista from '@/components/EstadoVista.vue'
import { useRouter } from 'vue-router'
import imagenNoEncontrado from '@/assets/img/nerviosa-libro.png'

const router = useRouter()
</script>

<template>
  <main class="pagina">
    <EstadoVista
      titulo="Esta página no existe"
      texto="Revisa la dirección o vuelve al inicio para seguir explorando la tienda."
      :imagen="imagenNoEncontrado"
      etiqueta-accion="Ir al inicio"
      data-test="estado-404"
      @accion="router.push({ name: 'inicio' })"
    />
  </main>
</template>
