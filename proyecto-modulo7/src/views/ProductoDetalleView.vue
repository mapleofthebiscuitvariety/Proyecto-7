<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { mdiArrowLeft, mdiBookOpenPageVariant, mdiCartPlus, mdiHeart, mdiHeartOutline, mdiMinus, mdiPlus, mdiStar } from '@mdi/js'
import EstadoVista from '@/components/EstadoVista.vue'
import { mostrarAviso } from '@/composables/useAviso'
import { formatoPrecio } from '@/utils/formato'
import imagenError from '@/assets/img/nerviosa-libro.png'
import imagenNoEncontrado from '@/assets/img/organiza-libro.png'

const props = defineProps({
  id: { type: [String, Number], required: true }
})

const router = useRouter()
const store = useStore()

const producto = computed(() => store.getters['productos/porId'](props.id))
const cargando = computed(() => store.getters['productos/loading'])
const error = computed(() => store.getters['productos/error'])
const esFavorito = computed(() => store.getters['favoritos/esFavorito'](props.id))
const enCarrito = computed(() => store.getters['carrito/cantidadDe'](props.id))

const cantidad = ref(1)
const imagenRota = ref(false)

const sinStock = computed(() => !!producto.value && producto.value.stock <= 0)
const disponibles = computed(() => (producto.value ? Math.max(producto.value.stock - enCarrito.value, 0) : 0))
const precio = computed(() => (producto.value ? formatoPrecio(producto.value.precio) : ''))

// Ciclo de vida: si se entra directo por URL y aún no hay datos, se cargan
onMounted(() => {
  if (!store.getters['productos/cargado']) store.dispatch('productos/cargar')
})

// El título de la pestaña sigue al producto mostrado
watch(
  producto,
  actual => {
    if (actual) document.title = `${actual.titulo} · LibroNova`
  },
  { immediate: true }
)

// Al cambiar de producto se reinicia el selector
watch(
  () => props.id,
  () => {
    cantidad.value = 1
    imagenRota.value = false
  }
)

function cambiar(delta) {
  const maximo = Math.max(disponibles.value, 1)
  cantidad.value = Math.min(Math.max(cantidad.value + delta, 1), maximo)
}

async function agregar() {
  const ok = await store.dispatch('carrito/agregar', { id: props.id, cantidad: cantidad.value })
  if (ok) {
    mostrarAviso(`Agregaste ${cantidad.value} × «${producto.value.titulo}»`)
    cantidad.value = 1
  } else {
    mostrarAviso('No hay más unidades disponibles', 'warning')
  }
}

function alternarFavorito() {
  store.commit('favoritos/TOGGLE', props.id)
}

function reintentar() {
  store.dispatch('productos/cargar')
}
</script>

<template>
  <div class="pagina detalle-pagina">
    <v-btn variant="text" :prepend-icon="mdiArrowLeft" class="mb-4" data-test="btn-volver" @click="router.back()">
      Volver
    </v-btn>

    <div v-if="cargando" data-test="cargando" role="status" aria-label="Cargando producto">
      <v-skeleton-loader type="image, article, actions" class="sticker" />
    </div>

    <EstadoVista
      v-else-if="error"
      tipo="error"
      titulo="No pudimos cargar el producto"
      :texto="error"
      :imagen="imagenError"
      etiqueta-accion="Reintentar"
      @accion="reintentar"
    />

    <EstadoVista
      v-else-if="!producto"
      tipo="vacio"
      titulo="No encontramos ese producto"
      texto="Puede que el enlace esté mal o que el producto ya no esté disponible."
      :imagen="imagenNoEncontrado"
      etiqueta-accion="Ir a la tienda"
      data-test="estado-no-encontrado"
      @accion="router.push({ name: 'tienda' })"
    />

    <article v-else class="detalle sticker" data-test="detalle-producto">
      <div class="detalle-portada">
        <img v-if="producto.imagen && !imagenRota" :src="producto.imagen" :alt="`Portada de ${producto.titulo}`" @error="imagenRota = true">
        <div v-else class="portada-generica">
          <v-icon :icon="mdiBookOpenPageVariant" size="72" />
        </div>
      </div>

      <div class="detalle-info">
        <div class="etiquetas">
          <v-chip label color="primary" variant="tonal">{{ producto.categoria }}</v-chip>
          <v-chip v-if="sinStock" label color="error" variant="flat">Agotado</v-chip>
          <v-chip v-else label color="success" variant="tonal">{{ producto.stock }} en stock</v-chip>
        </div>

        <h1 class="titulo-xl" data-test="detalle-titulo">{{ producto.titulo }}</h1>
        <p class="autor">de {{ producto.autor }}</p>

        <p class="rating">
          <v-icon :icon="mdiStar" color="ambar" size="20" />
          <strong>{{ Number(producto.rating || 0).toFixed(1) }}</strong> / 5
        </p>

        <p class="descripcion">{{ producto.descripcion || 'Sin descripción disponible.' }}</p>

        <p class="precio" data-test="detalle-precio">{{ precio }}</p>

        <div class="compra">
          <div class="cantidad" role="group" aria-label="Cantidad">
            <v-btn icon size="small" variant="outlined" aria-label="Disminuir cantidad" :disabled="cantidad <= 1 || sinStock" @click="cambiar(-1)">
              <v-icon :icon="mdiMinus" />
            </v-btn>
            <span class="cantidad-valor" aria-live="polite" data-test="cantidad">{{ cantidad }}</span>
            <v-btn icon size="small" variant="outlined" aria-label="Aumentar cantidad" :disabled="cantidad >= disponibles || sinStock" @click="cambiar(1)">
              <v-icon :icon="mdiPlus" />
            </v-btn>
          </div>

          <v-btn
            color="primary"
            variant="flat"
            size="large"
            :prepend-icon="mdiCartPlus"
            :disabled="sinStock || disponibles === 0"
            data-test="btn-agregar-detalle"
            @click="agregar"
          >
            {{ sinStock ? 'Agotado' : disponibles === 0 ? 'Ya está todo en tu carrito' : 'Agregar al carrito' }}
          </v-btn>

          <v-btn
            icon
            variant="outlined"
            :aria-label="esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'"
            data-test="btn-favorito-detalle"
            @click="alternarFavorito"
          >
            <v-icon :icon="esFavorito ? mdiHeart : mdiHeartOutline" :color="esFavorito ? 'rosa' : undefined" />
          </v-btn>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.detalle-pagina {
  max-width: 960px;
}
.detalle {
  display: grid;
  grid-template-columns: minmax(200px, 320px) 1fr;
  gap: 2rem;
  padding: 2rem;
  background: rgb(var(--v-theme-surface));
}
.detalle-portada {
  align-self: start;
  aspect-ratio: 3 / 4;
  border: 2px solid rgb(var(--v-theme-borde));
  border-radius: 12px;
  overflow: hidden;
}
.detalle-portada img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.portada-generica {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-turquesa), 0.28);
}
.etiquetas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.autor {
  margin: 0.4rem 0 0.75rem;
  font-style: italic;
  opacity: 0.8;
}
.rating {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 1rem;
}
.descripcion {
  line-height: 1.7;
  opacity: 0.9;
}
.precio {
  margin: 1rem 0;
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
.compra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
.cantidad {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.cantidad-valor {
  min-width: 2ch;
  font-size: 1.15rem;
  font-weight: 800;
  text-align: center;
}

@media (max-width: 700px) {
  .detalle {
    grid-template-columns: 1fr;
    padding: 1.25rem;
  }
  .detalle-portada {
    max-width: 240px;
    justify-self: center;
    width: 100%;
  }
}
</style>
