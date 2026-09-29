import { createStore } from 'vuex'
import productos from './modules/productos'
import carrito from './modules/carrito'
import favoritos from './modules/favoritos'
import filtros from './modules/filtros'
import { guardar } from '@/utils/almacen'

// Guarda carrito y favoritos en localStorage cada vez que cambian
const persistencia = store => {
  store.subscribe((mutation, state) => {
    if (mutation.type.startsWith('carrito/')) guardar('carrito', state.carrito.items)
    if (mutation.type.startsWith('favoritos/')) guardar('favoritos', state.favoritos.ids)
  })
}

export default createStore({
  modules: { productos, carrito, favoritos, filtros },
  plugins: [persistencia]
})
