import carrito from '@/store/modules/carrito'

const catalogo = {
  1: { id: '1', titulo: 'A', precio: 1000, stock: 3 },
  2: { id: '2', titulo: 'B', precio: 2500, stock: 0 }
}
const rootGetters = { 'productos/porId': id => catalogo[id] }

const estado = (items = []) => ({ items })

describe('store/modules/carrito', () => {
  describe('mutaciones', () => {
    test('SET_CANTIDAD crea la línea si no existe y la actualiza si existe', () => {
      const state = estado()
      carrito.mutations.SET_CANTIDAD(state, { id: '1', cantidad: 1 })
      carrito.mutations.SET_CANTIDAD(state, { id: '1', cantidad: 3 })

      expect(state.items).toEqual([{ id: '1', cantidad: 3 }])
    })

    test('QUITAR y VACIAR eliminan líneas', () => {
      const state = estado([{ id: '1', cantidad: 1 }, { id: '2', cantidad: 1 }])
      carrito.mutations.QUITAR(state, '1')
      expect(state.items).toEqual([{ id: '2', cantidad: 1 }])

      carrito.mutations.VACIAR(state)
      expect(state.items).toEqual([])
    })
  })

  describe('acción agregar', () => {
    test('suma unidades y devuelve true', () => {
      const commit = jest.fn()
      const ok = carrito.actions.agregar({ commit, state: estado([{ id: '1', cantidad: 1 }]), rootGetters }, { id: '1' })

      expect(ok).toBe(true)
      expect(commit).toHaveBeenCalledWith('SET_CANTIDAD', { id: '1', cantidad: 2 })
    })

    test('respeta el stock máximo', () => {
      const commit = jest.fn()
      carrito.actions.agregar({ commit, state: estado([{ id: '1', cantidad: 2 }]), rootGetters }, { id: '1', cantidad: 10 })

      expect(commit).toHaveBeenCalledWith('SET_CANTIDAD', { id: '1', cantidad: 3 })
    })

    test('no agrega si ya se alcanzó el stock', () => {
      const commit = jest.fn()
      const ok = carrito.actions.agregar({ commit, state: estado([{ id: '1', cantidad: 3 }]), rootGetters }, { id: '1' })

      expect(ok).toBe(false)
      expect(commit).not.toHaveBeenCalled()
    })

    test('no agrega productos agotados ni inexistentes', () => {
      const commit = jest.fn()

      expect(carrito.actions.agregar({ commit, state: estado(), rootGetters }, { id: '2' })).toBe(false)
      expect(carrito.actions.agregar({ commit, state: estado(), rootGetters }, { id: '99' })).toBe(false)
      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('acción cambiarCantidad', () => {
    test('limita la cantidad entre 1 y el stock', () => {
      const commit = jest.fn()

      carrito.actions.cambiarCantidad({ commit, rootGetters }, { id: '1', cantidad: 0 })
      carrito.actions.cambiarCantidad({ commit, rootGetters }, { id: '1', cantidad: 50 })

      expect(commit).toHaveBeenNthCalledWith(1, 'SET_CANTIDAD', { id: '1', cantidad: 1 })
      expect(commit).toHaveBeenNthCalledWith(2, 'SET_CANTIDAD', { id: '1', cantidad: 3 })
    })
  })

  describe('getters', () => {
    const state = estado([{ id: '1', cantidad: 2 }, { id: '404', cantidad: 1 }])

    test('cantidadTotal suma todas las unidades', () => {
      expect(carrito.getters.cantidadTotal(state)).toBe(3)
    })

    test('cantidadDe devuelve las unidades de un producto (0 si no está)', () => {
      expect(carrito.getters.cantidadDe(state)(1)).toBe(2)
      expect(carrito.getters.cantidadDe(state)('7')).toBe(0)
    })

    test('lineas calcula subtotales e ignora productos que ya no existen', () => {
      const lineas = carrito.getters.lineas(state, {}, {}, rootGetters)

      expect(lineas).toHaveLength(1)
      expect(lineas[0].subtotal).toBe(2000)
    })

    test('total suma los subtotales', () => {
      const lineas = carrito.getters.lineas(state, {}, {}, rootGetters)

      expect(carrito.getters.total(state, { lineas })).toBe(2000)
    })
  })
})
