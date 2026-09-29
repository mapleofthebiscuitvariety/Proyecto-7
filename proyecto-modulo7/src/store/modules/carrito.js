import { leer } from '@/utils/almacen'

export default {
  namespaced: true,
  state: () => ({
    // [{ id: '1', cantidad: 2 }]
    items: leer('carrito', [])
  }),
  mutations: {
    SET_CANTIDAD(state, { id, cantidad }) {
      const linea = state.items.find(i => i.id === id)
      if (linea) linea.cantidad = cantidad
      else state.items.push({ id, cantidad })
    },
    QUITAR(state, id) {
      state.items = state.items.filter(i => i.id !== id)
    },
    VACIAR(state) {
      state.items = []
    }
  },
  actions: {
    // Devuelve true si se agregó al menos una unidad (respeta el stock disponible)
    agregar({ commit, state, rootGetters }, { id, cantidad = 1 }) {
      const producto = rootGetters['productos/porId'](id)
      if (!producto || producto.stock <= 0) return false
      const sid = String(id)
      const actual = (state.items.find(i => i.id === sid) || { cantidad: 0 }).cantidad
      const nueva = Math.min(actual + cantidad, producto.stock)
      if (nueva <= actual) return false
      commit('SET_CANTIDAD', { id: sid, cantidad: nueva })
      return true
    },
    cambiarCantidad({ commit, rootGetters }, { id, cantidad }) {
      const producto = rootGetters['productos/porId'](id)
      if (!producto) return
      const limitada = Math.max(1, Math.min(cantidad, producto.stock))
      commit('SET_CANTIDAD', { id: String(id), cantidad: limitada })
    }
  },
  getters: {
    items: state => state.items,
    cantidadTotal: state => state.items.reduce((suma, i) => suma + i.cantidad, 0),
    cantidadDe: state => id => (state.items.find(i => i.id === String(id)) || { cantidad: 0 }).cantidad,
    lineas: (state, getters, rootState, rootGetters) =>
      state.items
        .map(i => ({ producto: rootGetters['productos/porId'](i.id), cantidad: i.cantidad }))
        .filter(l => l.producto)
        .map(l => ({ ...l, subtotal: l.producto.precio * l.cantidad })),
    total: (state, getters) => getters.lineas.reduce((suma, l) => suma + l.subtotal, 0)
  }
}
