import { createRouter, createWebHistory } from 'vue-router'
import { sesion } from '../data/sesion'
import InicioView from '../views/InicioView.vue'

const routes = [
  { path: '/', name: 'inicio', component: InicioView, meta: { titulo: 'Inicio' } },
  {
    path: '/tienda',
    name: 'tienda',
    component: () => import('../views/TiendaView.vue'),
    meta: { titulo: 'Tienda' }
  },
  {
    path: '/producto/:id',
    name: 'producto',
    component: () => import('../views/ProductoDetalleView.vue'),
    props: true,
    meta: { titulo: 'Producto' }
  },
  {
    path: '/carrito',
    name: 'carrito',
    component: () => import('../views/CarritoView.vue'),
    meta: { titulo: 'Carrito' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { titulo: 'Ingresar' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, titulo: 'Administración' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'no-encontrado',
    component: () => import('../views/NoEncontradoView.vue'),
    meta: { titulo: 'Página no encontrada' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// guard: las rutas privadas piden sesión
router.beforeEach(to => {
  if (to.meta.requiresAuth && !sesion.usuario) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && sesion.usuario) {
    return { name: 'admin' }
  }
  return true
})

router.afterEach(to => {
  // el detalle de producto pone su propio título cuando conoce el libro
  if (to.name === 'producto') return
  document.title = to.meta.titulo ? `${to.meta.titulo} · LibroNova` : 'LibroNova'
})

export default router
