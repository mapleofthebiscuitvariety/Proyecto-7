<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { mdiDelete, mdiPencil, mdiPlus } from '@mdi/js'
import EstadoVista from '@/components/EstadoVista.vue'
import ProductoForm from '@/components/ProductoForm.vue'
import { sesion } from '@/data/sesion'
import { mensajeError } from '@/api'
import { mostrarAviso } from '@/composables/useAviso'
import { formatoPrecio } from '@/utils/formato'
import iconoLibros from '@/assets/img/icono-libros.gif'
import iconoLibro from '@/assets/img/icono-libro.gif'
import iconoLeer from '@/assets/img/icono-leer.gif'
import imagenError from '@/assets/img/nerviosa-libro.png'
import imagenVacio from '@/assets/img/registra-libro.png'

const store = useStore()

const productos = computed(() => store.getters['productos/todos'])
const cargando = computed(() => store.getters['productos/loading'])
const error = computed(() => store.getters['productos/error'])

const unidades = computed(() => productos.value.reduce((suma, p) => suma + Number(p.stock || 0), 0))
const valorInventario = computed(() => productos.value.reduce((suma, p) => suma + Number(p.precio || 0) * Number(p.stock || 0), 0))
const agotados = computed(() => productos.value.filter(p => Number(p.stock) <= 0).length)

const metricas = computed(() => [
  { icono: iconoLibros, valor: productos.value.length, etiqueta: 'Productos en catálogo' },
  { icono: iconoLibro, valor: unidades.value, etiqueta: `Unidades en stock (${agotados.value} agotados)` },
  { icono: iconoLeer, valor: formatoPrecio(valorInventario.value), etiqueta: 'Valor del inventario' }
])

const formAbierto = ref(false)
const editando = ref(null)
const porEliminar = ref(null)
const eliminando = ref(false)

// Ciclo de vida: el panel siempre muestra datos frescos al entrar
onMounted(() => {
  store.dispatch('productos/cargar')
})

function nuevo() {
  editando.value = null
  formAbierto.value = true
}

function editar(producto) {
  editando.value = producto
  formAbierto.value = true
}

async function confirmarEliminar() {
  eliminando.value = true
  try {
    await store.dispatch('productos/eliminar', porEliminar.value.id)
    mostrarAviso('Producto eliminado', 'info')
    porEliminar.value = null
  } catch (e) {
    mostrarAviso(mensajeError(e, 'No se pudo eliminar el producto.'), 'error')
  } finally {
    eliminando.value = false
  }
}
</script>

<template>
  <div class="pagina">
    <header class="cabecera">
      <div>
        <p class="sobretitulo">Panel de administración</p>
        <h1 class="titulo-xl">Hola, {{ sesion.usuario }} 👋</h1>
      </div>
      <v-btn color="primary" variant="flat" size="large" :prepend-icon="mdiPlus" data-test="btn-nuevo" @click="nuevo">
        Nuevo producto
      </v-btn>
    </header>

    <section class="metricas" aria-label="Métricas">
      <article v-for="m in metricas" :key="m.etiqueta" class="metrica sticker">
        <span class="metrica-icono"><img :src="m.icono" alt="" width="44" height="44"></span>
        <div>
          <p class="metrica-valor">{{ m.valor }}</p>
          <p class="metrica-etiqueta">{{ m.etiqueta }}</p>
        </div>
      </article>
    </section>

    <div v-if="cargando" data-test="cargando" role="status" aria-label="Cargando productos">
      <v-skeleton-loader type="table-thead, table-row@4" class="sticker" />
    </div>

    <EstadoVista
      v-else-if="error"
      tipo="error"
      titulo="No pudimos cargar los productos"
      :texto="error"
      :imagen="imagenError"
      etiqueta-accion="Reintentar"
      @accion="store.dispatch('productos/cargar')"
    />

    <EstadoVista
      v-else-if="productos.length === 0"
      tipo="vacio"
      titulo="Todavía no hay productos"
      texto="Crea el primero para que aparezca en la tienda."
      :imagen="imagenVacio"
      etiqueta-accion="Crear producto"
      @accion="nuevo"
    />

    <div v-else class="tabla-caja sticker">
      <v-table>
        <thead>
          <tr>
            <th scope="col">Título</th>
            <th scope="col">Categoría</th>
            <th scope="col" class="text-right">Precio</th>
            <th scope="col" class="text-right">Stock</th>
            <th scope="col" class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productos" :key="p.id" data-test="fila-producto">
            <td>
              <router-link :to="{ name: 'producto', params: { id: p.id } }" class="enlace-limpio fila-titulo">{{ p.titulo }}</router-link>
              <div class="fila-autor">{{ p.autor }}</div>
            </td>
            <td>{{ p.categoria }}</td>
            <td class="text-right">{{ formatoPrecio(p.precio) }}</td>
            <td class="text-right">
              <v-chip v-if="Number(p.stock) <= 0" size="small" color="error" variant="flat" label>Agotado</v-chip>
              <span v-else>{{ p.stock }}</span>
            </td>
            <td class="text-right acciones">
              <v-btn icon size="small" variant="text" :aria-label="`Editar ${p.titulo}`" data-test="btn-editar" @click="editar(p)">
                <v-icon :icon="mdiPencil" />
              </v-btn>
              <v-btn icon size="small" variant="text" color="error" :aria-label="`Eliminar ${p.titulo}`" data-test="btn-eliminar" @click="porEliminar = p">
                <v-icon :icon="mdiDelete" />
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <ProductoForm v-model="formAbierto" :producto="editando" />

    <v-dialog :model-value="!!porEliminar" max-width="420" @update:model-value="porEliminar = null">
      <v-card class="sticker">
        <v-card-title class="titulo-md pt-4">Eliminar producto</v-card-title>
        <v-card-text>
          ¿Seguro que quieres eliminar <strong>{{ porEliminar && porEliminar.titulo }}</strong>? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="eliminando" @click="porEliminar = null">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="eliminando" data-test="btn-confirmar-eliminar" @click="confirmarEliminar">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 3px solid rgb(var(--v-theme-borde));
}
.sobretitulo {
  margin: 0 0 0.35rem;
  color: rgb(var(--v-theme-primary));
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.metricas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}
.metrica {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgb(var(--v-theme-surface));
}
.metrica:nth-child(2) { box-shadow: 4px 4px 0 rgb(var(--v-theme-rosa)) !important; }
.metrica:nth-child(3) { box-shadow: 4px 4px 0 rgb(var(--v-theme-turquesa)) !important; }
/* El GIF trae fondo blanco: va dentro de un sello blanco */
.metrica-icono {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border: 2px solid rgb(var(--v-theme-borde));
  border-radius: 14px;
  background: white;
  overflow: hidden;
}
.metrica-valor {
  margin: 0;
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 1.7rem;
  font-weight: 600;
  line-height: 1.1;
}
.metrica-etiqueta {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  opacity: 0.8;
}
.tabla-caja {
  overflow-x: auto;
  background: rgb(var(--v-theme-surface));
}
.fila-titulo {
  font-weight: 800;
}
.fila-autor {
  font-size: 0.85rem;
  opacity: 0.75;
}
.acciones {
  white-space: nowrap;
}

@media (max-width: 760px) {
  .metricas {
    grid-template-columns: 1fr;
  }
}
</style>
