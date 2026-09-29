<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { mdiMagnify } from '@mdi/js'
import ProductGrid from '@/components/ProductGrid.vue'
import { mostrarAviso } from '@/composables/useAviso'
import { filtrarProductos, ORDENES } from '@/utils/catalogo'
import iconoTienda from '@/assets/img/libro-abierto.gif'

const store = useStore()
const route = useRoute()

const productos = computed(() => store.getters['productos/todos'])
const categorias = computed(() => store.getters['productos/categorias'])
const cargando = computed(() => store.getters['productos/loading'])
const error = computed(() => store.getters['productos/error'])
const idsFavoritos = computed(() => store.getters['favoritos/ids'])
const hayFiltros = computed(() => store.getters['filtros/hayFiltros'])

// Cada filtro se guarda en Vuex para que sobreviva a la navegación entre páginas
const busqueda = computed({
  get: () => store.getters['filtros/busqueda'],
  set: valor => store.commit('filtros/SET_BUSQUEDA', valor)
})
const categoria = computed({
  get: () => store.getters['filtros/categoria'],
  set: valor => store.commit('filtros/SET_CATEGORIA', valor)
})
const orden = computed({
  get: () => store.getters['filtros/orden'],
  set: valor => store.commit('filtros/SET_ORDEN', valor)
})
const soloFavoritos = computed({
  get: () => store.getters['filtros/soloFavoritos'],
  set: valor => store.commit('filtros/SET_SOLO_FAVORITOS', valor)
})

const filtrados = computed(() =>
  filtrarProductos(
    productos.value,
    {
      busqueda: busqueda.value,
      categoria: categoria.value,
      orden: orden.value,
      soloFavoritos: soloFavoritos.value
    },
    idsFavoritos.value
  )
)

// Ciclo de vida: al entrar se aplica la categoría de la URL (?categoria=) y se asegura que haya datos
onMounted(() => {
  if (route.query.categoria) categoria.value = String(route.query.categoria)
  if (!store.getters['productos/cargado']) reintentar()
})

// Si se navega a /tienda?categoria=X estando ya en la tienda
watch(
  () => route.query.categoria,
  valor => {
    categoria.value = valor ? String(valor) : ''
  }
)

function reintentar() {
  store.dispatch('productos/cargar')
}

function limpiarFiltros() {
  store.commit('filtros/RESET')
}

async function agregar(id) {
  const producto = store.getters['productos/porId'](id)
  const ok = await store.dispatch('carrito/agregar', { id })
  if (ok) mostrarAviso(`«${producto.titulo}» se agregó al carrito`)
  else mostrarAviso('No hay más unidades disponibles', 'warning')
}

function alternarFavorito(id) {
  store.commit('favoritos/TOGGLE', id)
}
</script>

<template>
  <div class="pagina">
    <header class="encabezado">
      <figure class="sello">
        <img :src="iconoTienda" alt="" width="44" height="44">
      </figure>
      <div>
        <h1 class="titulo-xl">Tienda</h1>
        <p class="bajada">Filtra por categoría, busca por título o autor y ordena a tu gusto.</p>
      </div>
    </header>

    <section class="filtros sticker" aria-label="Filtros del catálogo">
      <v-text-field
        v-model="busqueda"
        label="Buscar por título o autor"
        :prepend-inner-icon="mdiMagnify"
        clearable
        hide-details
        type="search"
        data-test="input-busqueda"
      />
      <v-select v-model="orden" :items="ORDENES" label="Ordenar por" hide-details data-test="select-orden" />
      <v-switch v-model="soloFavoritos" label="Solo favoritos" color="primary" hide-details data-test="switch-favoritos" />

      <div class="chips" role="group" aria-label="Categorías">
        <v-chip
          link
          color="primary"
          :variant="categoria === '' ? 'flat' : 'outlined'"
          data-test="chip-categoria"
          @click="categoria = ''"
        >
          Todas
        </v-chip>
        <v-chip
          v-for="cat in categorias"
          :key="cat"
          link
          color="primary"
          :variant="categoria === cat ? 'flat' : 'outlined'"
          data-test="chip-categoria"
          @click="categoria = cat"
        >
          {{ cat }}
        </v-chip>
      </div>
    </section>

    <p v-if="!cargando && !error && productos.length" class="conteo" aria-live="polite" data-test="conteo">
      Mostrando {{ filtrados.length }} de {{ productos.length }} productos
    </p>

    <ProductGrid
      :productos="filtrados"
      :cargando="cargando"
      :error="error"
      :ids-favoritos="idsFavoritos"
      :titulo-vacio="hayFiltros && productos.length ? 'Sin resultados' : 'Aún no hay productos'"
      :texto-vacio="hayFiltros && productos.length ? 'Ningún producto coincide con tu búsqueda. Prueba con otra categoría o palabra.' : 'Vuelve pronto: estamos sumando novedades al catálogo.'"
      :accion-vacio="hayFiltros && productos.length ? 'Limpiar filtros' : ''"
      @agregar="agregar"
      @favorito="alternarFavorito"
      @reintentar="reintentar"
      @vacio-accion="limpiarFiltros"
    />
  </div>
</template>

<style scoped>
.encabezado {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.sello {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 68px;
  height: 68px;
  margin: 0;
  border: 2px solid rgb(var(--v-theme-borde));
  border-radius: 16px;
  background: white;
  box-shadow: 4px 4px 0 rgb(var(--v-theme-sombra));
  overflow: hidden;
}
.bajada {
  margin: 0.35rem 0 0;
  opacity: 0.8;
}
.filtros {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1.25rem;
  background: rgb(var(--v-theme-surface));
}
.chips {
  display: flex;
  flex-wrap: wrap;
  grid-column: 1 / -1;
  gap: 0.5rem;
}
.conteo {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  opacity: 0.75;
}

@media (max-width: 760px) {
  .filtros {
    grid-template-columns: 1fr;
  }
}
</style>
