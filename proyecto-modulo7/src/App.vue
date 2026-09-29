<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {
  mdiCartOutline,
  mdiHomeOutline,
  mdiLogin,
  mdiLogout,
  mdiStorefrontOutline,
  mdiViewDashboardOutline
} from '@mdi/js'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { sesion, cerrarSesion } from '@/data/sesion'
import { aviso, mostrarAviso } from '@/composables/useAviso'

const router = useRouter()
const store = useStore()

const menuAbierto = ref(false)

const enlaces = [
  { texto: 'Inicio', ruta: { name: 'inicio' }, icono: mdiHomeOutline },
  { texto: 'Tienda', ruta: { name: 'tienda' }, icono: mdiStorefrontOutline }
]

const cantidadCarrito = computed(() => store.getters['carrito/cantidadTotal'])
const etiquetaCarrito = computed(() =>
  cantidadCarrito.value === 1 ? 'Carrito, 1 producto' : `Carrito, ${cantidadCarrito.value} productos`
)

// Ciclo de vida: al montar la app se carga el catálogo una sola vez
onMounted(() => {
  store.dispatch('productos/cargar')
})

function salir() {
  cerrarSesion()
  menuAbierto.value = false
  mostrarAviso('Cerraste sesión')
  router.push({ name: 'inicio' })
}
</script>

<template>
  <v-app>
    <v-app-bar flat class="barra">
      <v-app-bar-nav-icon class="d-md-none" aria-label="Abrir menú" data-test="btn-menu" @click="menuAbierto = !menuAbierto" />

      <router-link :to="{ name: 'inicio' }" class="marca enlace-limpio" aria-label="LibroNova, ir al inicio">
        <span class="sello">
          <img src="@/assets/img/icono-libros.gif" alt="" width="26" height="26">
        </span>
        <span class="marca-texto">LibroNova</span>
      </router-link>

      <v-spacer />

      <nav class="d-none d-md-flex" aria-label="Principal">
        <v-btn v-for="enlace in enlaces" :key="enlace.texto" :to="enlace.ruta" variant="text" exact>
          {{ enlace.texto }}
        </v-btn>
      </nav>

      <v-spacer />

      <ThemeToggle />

      <v-btn icon variant="text" :to="{ name: 'carrito' }" :aria-label="etiquetaCarrito" data-test="btn-carrito">
        <v-badge :content="cantidadCarrito" :model-value="cantidadCarrito > 0" color="primary">
          <v-icon :icon="mdiCartOutline" />
        </v-badge>
      </v-btn>

      <template v-if="sesion.usuario">
        <v-btn class="d-none d-sm-inline-flex" variant="tonal" color="primary" :to="{ name: 'admin' }" :prepend-icon="mdiViewDashboardOutline">
          Admin
        </v-btn>
        <v-btn icon variant="text" aria-label="Cerrar sesión" data-test="btn-salir" @click="salir">
          <v-icon :icon="mdiLogout" />
        </v-btn>
      </template>
      <v-btn v-else class="d-none d-sm-inline-flex" variant="tonal" color="primary" :to="{ name: 'login' }" :prepend-icon="mdiLogin" data-test="btn-ingresar">
        Ingresar
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="menuAbierto" temporary>
      <v-list nav>
        <v-list-item v-for="enlace in enlaces" :key="enlace.texto" :to="enlace.ruta" :prepend-icon="enlace.icono" :title="enlace.texto" exact />
        <v-list-item v-if="sesion.usuario" :to="{ name: 'admin' }" :prepend-icon="mdiViewDashboardOutline" title="Administración" />
        <v-list-item v-if="sesion.usuario" :prepend-icon="mdiLogout" title="Cerrar sesión" @click="salir" />
        <v-list-item v-else :to="{ name: 'login' }" :prepend-icon="mdiLogin" title="Ingresar" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <v-footer class="pie">
      <small>© 2026 LibroNova · Librería online · Proyecto Módulo 7</small>
    </v-footer>

    <v-snackbar v-model="aviso.visible" :color="aviso.color" :timeout="2600" location="bottom">
      {{ aviso.texto }}
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.barra {
  border-bottom: 3px solid rgb(var(--v-theme-borde));
  background: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}
.marca {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
}
/* El GIF tiene fondo blanco: se enmarca en un sello */
.sello {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 2px solid rgb(var(--v-theme-borde));
  border-radius: 12px;
  background: white;
  box-shadow: 3px 3px 0 rgb(var(--v-theme-sombra));
  overflow: hidden;
}
.pie {
  justify-content: center;
  border-top: 3px solid rgb(var(--v-theme-borde));
  background: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  text-align: center;
}
</style>
