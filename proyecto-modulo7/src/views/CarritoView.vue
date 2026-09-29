<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { mdiDelete, mdiMinus, mdiPlus } from '@mdi/js'
import EstadoVista from '@/components/EstadoVista.vue'
import { mostrarAviso } from '@/composables/useAviso'
import { formatoPrecio } from '@/utils/formato'
import imagenError from '@/assets/img/nerviosa-libro.png'
import imagenVacio from '@/assets/img/organiza-libro.png'

const router = useRouter()
const store = useStore()

const lineas = computed(() => store.getters['carrito/lineas'])
const total = computed(() => store.getters['carrito/total'])
const hayItems = computed(() => store.getters['carrito/items'].length > 0)
const cargando = computed(() => store.getters['productos/loading'])
const error = computed(() => store.getters['productos/error'])

const confirmando = ref(false)

function cambiar(linea, delta) {
  store.dispatch('carrito/cambiarCantidad', { id: linea.producto.id, cantidad: linea.cantidad + delta })
}

function quitar(linea) {
  store.commit('carrito/QUITAR', String(linea.producto.id))
  mostrarAviso(`Quitaste «${linea.producto.titulo}» del carrito`, 'info')
}

function reintentar() {
  store.dispatch('productos/cargar')
}

// Compra simulada: no hay pasarela de pago real en este proyecto
function finalizarCompra() {
  confirmando.value = false
  store.commit('carrito/VACIAR')
  mostrarAviso('¡Gracias por tu compra! Te enviamos el detalle por correo.')
  router.push({ name: 'inicio' })
}
</script>

<template>
  <div class="pagina">
    <h1 class="titulo-xl mb-6">Tu carrito</h1>

    <div v-if="cargando && hayItems" data-test="cargando" role="status" aria-label="Cargando carrito">
      <v-skeleton-loader type="list-item-avatar-two-line, list-item-avatar-two-line" class="sticker" />
    </div>

    <EstadoVista
      v-else-if="error && hayItems"
      tipo="error"
      titulo="No pudimos cargar tu carrito"
      :texto="error"
      :imagen="imagenError"
      etiqueta-accion="Reintentar"
      @accion="reintentar"
    />

    <EstadoVista
      v-else-if="!hayItems"
      tipo="vacio"
      titulo="Tu carrito está vacío"
      texto="Agrega algunos libros y aparecerán aquí."
      :imagen="imagenVacio"
      etiqueta-accion="Ir a la tienda"
      @accion="router.push({ name: 'tienda' })"
    />

    <div v-else class="carrito">
      <ul class="lineas">
        <li v-for="linea in lineas" :key="linea.producto.id" class="linea sticker" data-test="linea-carrito">
          <div class="linea-info">
            <router-link :to="{ name: 'producto', params: { id: linea.producto.id } }" class="linea-titulo enlace-limpio">
              {{ linea.producto.titulo }}
            </router-link>
            <span class="linea-autor">{{ linea.producto.autor }}</span>
            <span class="linea-unitario">{{ formatoPrecio(linea.producto.precio) }} c/u</span>
          </div>

          <div class="cantidad" role="group" :aria-label="`Cantidad de ${linea.producto.titulo}`">
            <v-btn icon size="x-small" variant="outlined" aria-label="Disminuir cantidad" :disabled="linea.cantidad <= 1" @click="cambiar(linea, -1)">
              <v-icon :icon="mdiMinus" />
            </v-btn>
            <span class="cantidad-valor" data-test="linea-cantidad">{{ linea.cantidad }}</span>
            <v-btn icon size="x-small" variant="outlined" aria-label="Aumentar cantidad" :disabled="linea.cantidad >= linea.producto.stock" @click="cambiar(linea, 1)">
              <v-icon :icon="mdiPlus" />
            </v-btn>
          </div>

          <strong class="linea-subtotal">{{ formatoPrecio(linea.subtotal) }}</strong>

          <v-btn icon variant="text" color="error" :aria-label="`Quitar ${linea.producto.titulo} del carrito`" data-test="btn-quitar" @click="quitar(linea)">
            <v-icon :icon="mdiDelete" />
          </v-btn>
        </li>
      </ul>

      <aside class="resumen sticker" aria-label="Resumen del pedido">
        <h2 class="titulo-md">Resumen</h2>
        <div class="resumen-fila">
          <span>Total</span>
          <strong class="resumen-total" data-test="total">{{ formatoPrecio(total) }}</strong>
        </div>
        <v-btn color="primary" variant="flat" block size="large" data-test="btn-finalizar" @click="confirmando = true">
          Finalizar compra
        </v-btn>
        <v-btn variant="text" block :to="{ name: 'tienda' }">Seguir comprando</v-btn>
      </aside>
    </div>

    <v-dialog v-model="confirmando" max-width="420">
      <v-card class="sticker">
        <v-card-title class="titulo-md pt-4">Confirmar compra</v-card-title>
        <v-card-text>
          Vas a pagar <strong>{{ formatoPrecio(total) }}</strong>. Es una demostración: no se realizará ningún cobro.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmando = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" data-test="btn-confirmar" @click="finalizarCompra">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.carrito {
  display: grid;
  grid-template-columns: 1fr 320px;
  align-items: start;
  gap: 1.5rem;
}
.lineas {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.linea {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgb(var(--v-theme-surface));
}
.linea-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.linea-titulo {
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
}
.linea-autor,
.linea-unitario {
  font-size: 0.85rem;
  opacity: 0.75;
}
.cantidad {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.cantidad-valor {
  min-width: 2ch;
  font-weight: 800;
  text-align: center;
}
.linea-subtotal {
  min-width: 90px;
  text-align: right;
}
.resumen {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: rgb(var(--v-theme-surface));
}
.resumen-fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0 1rem;
  border-bottom: 2px dotted rgb(var(--v-theme-borde));
}
.resumen-total {
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 1.6rem;
  color: rgb(var(--v-theme-primary));
}

@media (max-width: 860px) {
  .carrito {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 560px) {
  .linea {
    grid-template-columns: 1fr auto;
  }
  .linea-subtotal {
    text-align: left;
  }
}
</style>
