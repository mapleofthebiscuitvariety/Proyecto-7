<script setup>
import { computed, ref } from 'vue'
import { mdiBookOpenPageVariant, mdiCartPlus, mdiHeart, mdiHeartOutline, mdiStar } from '@mdi/js'
import { formatoPrecio } from '@/utils/formato'

const props = defineProps({
  producto: { type: Object, required: true },
  esFavorito: { type: Boolean, default: false }
})

defineEmits(['agregar', 'favorito'])

const TONOS = ['primary', 'turquesa', 'rosa', 'ambar']

const sinStock = computed(() => Number(props.producto.stock) <= 0)
const pocoStock = computed(() => !sinStock.value && Number(props.producto.stock) <= 5)
const precio = computed(() => formatoPrecio(props.producto.precio))
const rating = computed(() => Number(props.producto.rating || 0).toFixed(1))

// Si no hay portada (o falla al cargar) se dibuja una portada genérica con el color de la categoría
const imagenRota = ref(false)
const mostrarImagen = computed(() => !!props.producto.imagen && !imagenRota.value)
const tono = computed(() => {
  const texto = String(props.producto.categoria || '')
  const suma = [...texto].reduce((acc, letra) => acc + letra.charCodeAt(0), 0)
  return `var(--v-theme-${TONOS[suma % TONOS.length]})`
})
</script>

<template>
  <v-card class="tarjeta sticker sticker--hover" :class="{ 'tarjeta--agotada': sinStock }" data-test="producto-card">
    <router-link
      :to="{ name: 'producto', params: { id: producto.id } }"
      class="portada"
      :aria-label="`Ver detalle de ${producto.titulo}`"
    >
      <img
        v-if="mostrarImagen"
        :src="producto.imagen"
        :alt="`Portada de ${producto.titulo}`"
        loading="lazy"
        @error="imagenRota = true"
      >
      <div v-else class="portada-generica" :style="{ '--tono': tono }" data-test="portada-generica">
        <v-icon :icon="mdiBookOpenPageVariant" size="52" />
        <span class="portada-titulo">{{ producto.titulo }}</span>
      </div>
    </router-link>

    <v-card-text class="cuerpo">
      <div class="fila-meta">
        <v-chip size="small" label color="primary" variant="tonal" data-test="categoria">
          {{ producto.categoria }}
        </v-chip>
        <span class="rating" :aria-label="`Valoración ${rating} de 5`">
          <v-icon :icon="mdiStar" size="16" color="ambar" />
          {{ rating }}
        </span>
      </div>

      <router-link
        :to="{ name: 'producto', params: { id: producto.id } }"
        class="titulo enlace-limpio"
        data-test="titulo"
      >
        {{ producto.titulo }}
      </router-link>
      <p class="autor" data-test="autor">{{ producto.autor }}</p>

      <v-chip v-if="sinStock" size="x-small" label color="error" variant="flat" data-test="etiqueta-stock">Agotado</v-chip>
      <v-chip v-else-if="pocoStock" size="x-small" label color="warning" variant="flat" data-test="etiqueta-stock">
        Últimas {{ producto.stock }} unidades
      </v-chip>
    </v-card-text>

    <v-card-actions class="acciones">
      <span class="precio" data-test="precio">{{ precio }}</span>
      <v-spacer />
      <v-btn
        icon
        size="small"
        variant="text"
        :aria-label="esFavorito ? `Quitar ${producto.titulo} de favoritos` : `Agregar ${producto.titulo} a favoritos`"
        data-test="btn-favorito"
        @click="$emit('favorito', producto.id)"
      >
        <v-icon :icon="esFavorito ? mdiHeart : mdiHeartOutline" :color="esFavorito ? 'rosa' : undefined" />
      </v-btn>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        :disabled="sinStock"
        :prepend-icon="mdiCartPlus"
        :aria-label="`Agregar ${producto.titulo} al carrito`"
        data-test="btn-agregar"
        @click="$emit('agregar', producto.id)"
      >
        {{ sinStock ? 'Agotado' : 'Agregar' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.tarjeta {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.tarjeta--agotada .portada {
  filter: grayscale(0.6);
  opacity: 0.85;
}
.portada {
  display: block;
  aspect-ratio: 4 / 3;
  border-bottom: 2px solid rgb(var(--v-theme-borde));
  overflow: hidden;
}
.portada img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.portada-generica {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
  background: rgba(var(--tono), 0.28);
  color: rgb(var(--v-theme-on-surface));
  text-align: center;
}
.portada-titulo {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-weight: 600;
  line-height: 1.2;
}
.cuerpo {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}
.fila-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.rating {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.85rem;
  font-weight: 800;
}
.titulo {
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.25;
}
.autor {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.75;
}
.acciones {
  padding: 0.5rem 1rem 1rem;
}
.precio {
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
}
</style>
