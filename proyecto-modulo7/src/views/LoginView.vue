<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { iniciarSesion } from '@/data/sesion'
import imagenLogin from '@/assets/img/entusiasta-libro.png'

const router = useRouter()
const route = useRoute()

const nombre = ref('')
const error = ref('')

function ingresar() {
  if (!iniciarSesion(nombre.value)) {
    error.value = 'Escribe tu nombre para continuar.'
    return
  }
  // vuelve a la página que quería ver
  router.push(route.query.redirect || { name: 'admin' })
}
</script>

<template>
  <div class="pagina login">
    <section class="caja sticker">
      <div class="marco-img login-img">
        <img :src="imagenLogin" alt="Persona entusiasmada leyendo un libro">
      </div>

      <p class="sobretitulo">Acceso del equipo</p>
      <h1 class="titulo-lg">Panel de administración</h1>
      <p class="bajada">Ingresa tu nombre para gestionar el catálogo, los precios y el stock.</p>

      <v-text-field
        v-model="nombre"
        label="Nombre"
        placeholder="Ej: Javi"
        :error-messages="error"
        autofocus
        data-test="input-nombre"
        @update:model-value="error = ''"
        @keyup.enter="ingresar"
      />

      <v-btn color="primary" variant="flat" block size="large" data-test="btn-login" @click="ingresar">
        Ingresar al panel
      </v-btn>

      <p class="aclaracion">Es una demo: no necesitas contraseña.</p>
      <v-btn variant="text" block :to="{ name: 'inicio' }">← Volver a la tienda</v-btn>
    </section>
  </div>
</template>

<style scoped>
.login {
  display: grid;
  place-items: center;
  padding-top: 2.5rem;
}
.caja {
  width: 100%;
  max-width: 460px;
  padding: 2rem;
  background: rgb(var(--v-theme-surface));
}
.login-img {
  max-width: 180px;
  margin: 0 auto 1.25rem;
}
.sobretitulo {
  margin: 0 0 0.35rem;
  color: rgb(var(--v-theme-primary));
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.bajada {
  margin: 0.5rem 0 1.5rem;
  opacity: 0.85;
}
.aclaracion {
  margin: 1rem 0 0.25rem;
  font-size: 0.85rem;
  text-align: center;
  opacity: 0.7;
}
</style>
