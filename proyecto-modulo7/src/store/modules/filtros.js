const inicial = () => ({
  busqueda: '',
  categoria: '',
  orden: 'relevancia',
  soloFavoritos: false
})

export default {
  namespaced: true,
  state: inicial,
  mutations: {
    SET_BUSQUEDA(state, valor) {
      state.busqueda = valor || ''
    },
    SET_CATEGORIA(state, valor) {
      state.categoria = valor || ''
    },
    SET_ORDEN(state, valor) {
      state.orden = valor || 'relevancia'
    },
    SET_SOLO_FAVORITOS(state, valor) {
      state.soloFavoritos = !!valor
    },
    RESET(state) {
      Object.assign(state, inicial())
    }
  },
  getters: {
    busqueda: state => state.busqueda,
    categoria: state => state.categoria,
    orden: state => state.orden,
    soloFavoritos: state => state.soloFavoritos,
    hayFiltros: state => state.busqueda !== '' || state.categoria !== '' || state.soloFavoritos
  }
}
