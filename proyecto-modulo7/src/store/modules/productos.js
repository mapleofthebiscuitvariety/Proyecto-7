import api, { mensajeError } from '@/api'

export default {
  namespaced: true,
  state: () => ({
    items: [],
    loading: false,
    error: '',
    cargado: false
  }),
  mutations: {
    SET_ITEMS(state, items) {
      state.items = items
    },
    AGREGAR(state, producto) {
      state.items.push(producto)
    },
    EDITAR(state, actualizado) {
      const i = state.items.findIndex(p => String(p.id) === String(actualizado.id))
      if (i !== -1) state.items.splice(i, 1, actualizado)
    },
    ELIMINAR(state, id) {
      state.items = state.items.filter(p => String(p.id) !== String(id))
    },
    SET_LOADING(state, valor) {
      state.loading = valor
    },
    SET_ERROR(state, valor) {
      state.error = valor
    },
    SET_CARGADO(state, valor) {
      state.cargado = valor
    }
  },
  actions: {
    // Idempotente: si ya hay una carga en curso no lanza otra petición
    async cargar({ commit, state }) {
      if (state.loading) return
      commit('SET_LOADING', true)
      commit('SET_ERROR', '')
      try {
        const { data } = await api.get('/productos')
        commit('SET_ITEMS', Array.isArray(data) ? data : [])
        commit('SET_CARGADO', true)
      } catch (e) {
        commit('SET_ERROR', mensajeError(e, 'No se pudieron cargar los productos.'))
      } finally {
        commit('SET_LOADING', false)
      }
    },
    // Las acciones de escritura propagan el error para que la vista muestre el aviso
    async agregar({ commit }, datos) {
      const { data } = await api.post('/productos', datos)
      commit('AGREGAR', data)
      return data
    },
    async editar({ commit }, producto) {
      const { data } = await api.put(`/productos/${producto.id}`, producto)
      commit('EDITAR', data)
      return data
    },
    async eliminar({ commit }, id) {
      await api.delete(`/productos/${id}`)
      commit('ELIMINAR', id)
    }
  },
  getters: {
    todos: state => state.items,
    loading: state => state.loading,
    error: state => state.error,
    cargado: state => state.cargado,
    porId: state => id => state.items.find(p => String(p.id) === String(id)),
    categorias: state =>
      [...new Set(state.items.map(p => p.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
    destacados: state => state.items.filter(p => p.destacado).slice(0, 4)
  }
}
