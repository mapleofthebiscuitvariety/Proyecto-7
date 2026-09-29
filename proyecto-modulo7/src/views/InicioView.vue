<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiCreditCardOutline, mdiShieldCheckOutline, mdiTruckDeliveryOutline } from '@mdi/js'
import ProductGrid from '@/components/ProductGrid.vue'
import { mostrarAviso } from '@/composables/useAviso'
import imagenHero from '@/assets/img/hero-cohete.png'
import imagenLector from '@/assets/img/lector-libro.png'
import imagenIdea from '@/assets/img/organiza-libro.png'
import imagenRegistro from '@/assets/img/registra-libro.png'

const store = useStore()

const destacados = computed(() => store.getters['productos/destacados'])
const categorias = computed(() => store.getters['productos/categorias'])
const cargando = computed(() => store.getters['productos/loading'])
const error = computed(() => store.getters['productos/error'])
const idsFavoritos = computed(() => store.getters['favoritos/ids'])

const beneficios = [
  {
    imagen: imagenLector,
    alt: 'Lector caminando mientras lee',
    icono: mdiTruckDeliveryOutline,
    titulo: 'Despacho a todo Chile',
    texto: 'Recibe tus libros en la puerta de tu casa en 2 a 5 días hábiles.'
  },
  {
    imagen: imagenIdea,
    alt: 'Lectora con una idea',
    icono: mdiCreditCardOutline,
    titulo: 'Paga como prefieras',
    texto: 'Tarjetas de débito, crédito y transferencia, siempre con pago seguro.'
  },
  {
    imagen: imagenRegistro,
    alt: 'Persona registrando libros',
    icono: mdiShieldCheckOutline,
    titulo: 'Compra protegida',
    texto: '10 días para cambios y devoluciones si el libro no era lo que esperabas.'
  }
]

function reintentar() {
  store.dispatch('productos/cargar')
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
  <div>
    <section class="hero-fondo">
      <div class="pagina hero">
        <div class="hero-texto">
          <span class="insignia">Librería online</span>
          <h1 class="titulo-xl">Tu próxima lectura está a un clic</h1>
          <p class="hero-parrafo">
            Novelas, ensayos, ciencia y poesía con despacho a todo el país.
            Encuentra tu siguiente historia favorita en LibroNova.
          </p>
          <v-btn :to="{ name: 'tienda' }" color="primary" size="large" variant="flat" data-test="btn-explorar">
            Explorar la tienda
          </v-btn>
        </div>
        <div class="marco-img hero-img">
          <img :src="imagenHero" alt="Cohete de libros despegando de un libro abierto">
        </div>
      </div>
    </section>

    <div class="pagina">
      <section aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias" class="titulo-lg">Explora por categoría</h2>
        <div class="categorias">
          <v-chip
            v-for="categoria in categorias"
            :key="categoria"
            :to="{ name: 'tienda', query: { categoria } }"
            size="large"
            color="primary"
            variant="outlined"
            data-test="chip-inicio-categoria"
          >
            {{ categoria }}
          </v-chip>
        </div>
      </section>

      <section class="bloque" aria-labelledby="titulo-destacados">
        <h2 id="titulo-destacados" class="titulo-lg">Libros destacados</h2>
        <ProductGrid
          :productos="destacados"
          :cargando="cargando"
          :error="error"
          :ids-favoritos="idsFavoritos"
          :esqueletos="4"
          titulo-vacio="Pronto tendremos destacados"
          texto-vacio="Estamos preparando la selección de la semana."
          @agregar="agregar"
          @favorito="alternarFavorito"
          @reintentar="reintentar"
        />
      </section>

      <section class="bloque" aria-labelledby="titulo-beneficios">
        <h2 id="titulo-beneficios" class="titulo-lg">¿Por qué comprar en LibroNova?</h2>
        <div class="beneficios">
          <article v-for="b in beneficios" :key="b.titulo" class="beneficio sticker">
            <div class="marco-img beneficio-img">
              <img :src="b.imagen" :alt="b.alt">
            </div>
            <h3 class="titulo-md">
              <v-icon :icon="b.icono" color="primary" class="mr-1" />
              {{ b.titulo }}
            </h3>
            <p>{{ b.texto }}</p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hero-fondo {
  border-bottom: 3px solid rgb(var(--v-theme-borde));
  background: rgb(var(--v-theme-surface-variant));
}
.hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  gap: 2.5rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
}
.insignia {
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.25rem 0.8rem;
  border-radius: 8px;
  background: rgb(var(--v-theme-ambar));
  color: #14286b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.hero-parrafo {
  max-width: 480px;
  margin: 1rem 0 1.75rem;
  font-size: 1.1rem;
  line-height: 1.6;
}
.hero-img {
  max-width: 380px;
  justify-self: center;
  box-shadow: 6px 6px 0 rgb(var(--v-theme-primary));
}
.categorias {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}
.bloque {
  margin-top: 3rem;
}
.bloque .titulo-lg {
  margin-bottom: 1.25rem;
}
.beneficios {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.beneficio {
  padding: 1.25rem;
  background: rgb(var(--v-theme-surface));
  text-align: center;
}
.beneficio-img {
  max-width: 170px;
  margin: 0 auto 1rem;
}
.beneficio p {
  margin: 0.4rem 0 0;
  line-height: 1.5;
  opacity: 0.85;
}

@media (max-width: 860px) {
  .beneficios {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .hero {
    grid-template-columns: 1fr;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  .hero-img {
    order: -1;
    max-width: 240px;
  }
}
</style>
