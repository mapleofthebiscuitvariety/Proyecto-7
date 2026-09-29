import { leer } from '@/utils/almacen'

export default {
  namespaced: true,
  state: () => ({
    ids: leer('favoritos', [])
  }),
  mutations: {
    TOGGLE(state, id) {
      const sid = String(id)
      state.ids = state.ids.includes(sid)
        ? state.ids.filter(i => i !== sid)
        : [...state.ids, sid]
    }
  },
  getters: {
    ids: state => state.ids,
    esFavorito: state => id => state.ids.includes(String(id))
  }
}
