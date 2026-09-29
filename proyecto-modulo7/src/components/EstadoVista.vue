<script setup>
defineProps({
  // 'vacio' | 'error'
  tipo: { type: String, default: 'vacio' },
  titulo: { type: String, required: true },
  texto: { type: String, default: '' },
  imagen: { type: String, default: '' },
  etiquetaAccion: { type: String, default: '' }
})

defineEmits(['accion'])
</script>

<template>
  <section
    class="estado sticker"
    :class="`estado--${tipo}`"
    :role="tipo === 'error' ? 'alert' : 'status'"
    :data-test="`estado-${tipo}`"
  >
    <div v-if="imagen" class="marco-img estado-img">
      <img :src="imagen" alt="">
    </div>
    <h2 class="titulo-md">{{ titulo }}</h2>
    <p v-if="texto" class="estado-texto">{{ texto }}</p>
    <v-btn
      v-if="etiquetaAccion"
      :color="tipo === 'error' ? 'error' : 'primary'"
      variant="flat"
      data-test="btn-accion"
      @click="$emit('accion')"
    >
      {{ etiquetaAccion }}
    </v-btn>
  </section>
</template>

<style scoped>
.estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  text-align: center;
}
.estado--error {
  box-shadow: 4px 4px 0 rgb(var(--v-theme-error)) !important;
}
.estado-img {
  width: 100%;
  max-width: 200px;
}
.estado-texto {
  max-width: 460px;
  margin: 0;
  opacity: 0.8;
}
</style>
