<script setup>
import ProductCard from './ProductCard.vue'
import EstadoVista from './EstadoVista.vue'
import imagenError from '@/assets/img/nerviosa-libro.png'
import imagenVacio from '@/assets/img/nerd-libro.png'

// Maneja los cuatro estados de una lista: cargando, error, vacío y con datos
defineProps({
  productos: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
  error: { type: String, default: '' },
  idsFavoritos: { type: Array, default: () => [] },
  esqueletos: { type: Number, default: 8 },
  tituloVacio: { type: String, default: 'No hay productos para mostrar' },
  textoVacio: { type: String, default: '' },
  accionVacio: { type: String, default: '' }
})

defineEmits(['agregar', 'favorito', 'reintentar', 'vacio-accion'])
</script>

<template>
  <div>
    <div v-if="cargando" class="rejilla" data-test="cargando" role="status" aria-label="Cargando productos">
      <v-skeleton-loader v-for="n in esqueletos" :key="n" type="image, article, actions" class="sticker" />
    </div>

    <EstadoVista
      v-else-if="error"
      tipo="error"
      titulo="No pudimos cargar los productos"
      :texto="error"
      :imagen="imagenError"
      etiqueta-accion="Reintentar"
      @accion="$emit('reintentar')"
    />

    <EstadoVista
      v-else-if="productos.length === 0"
      tipo="vacio"
      :titulo="tituloVacio"
      :texto="textoVacio"
      :imagen="imagenVacio"
      :etiqueta-accion="accionVacio"
      @accion="$emit('vacio-accion')"
    />

    <div v-else class="rejilla" data-test="rejilla-productos">
      <ProductCard
        v-for="producto in productos"
        :key="producto.id"
        :producto="producto"
        :es-favorito="idsFavoritos.includes(String(producto.id))"
        @agregar="$emit('agregar', $event)"
        @favorito="$emit('favorito', $event)"
      />
    </div>
  </div>
</template>
