import productos from '@/store/modules/productos'
import api from '@/api'

// Se reemplaza axios para no hacer peticiones reales
jest.mock('@/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  mensajeError: (e, porDefecto) => porDefecto
}))

const estado = (extra = {}) => ({ items: [], loading: false, error: '', cargado: false, ...extra })

describe('store/modules/productos', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('mutaciones', () => {
    test('AGREGAR añade un producto', () => {
      const state = estado()
      productos.mutations.AGREGAR(state, { id: '1', titulo: 'Drácula' })

      expect(state.items).toHaveLength(1)
      expect(state.items[0].titulo).toBe('Drácula')
    })

    test('EDITAR reemplaza el producto con el mismo id (aunque el tipo difiera)', () => {
      const state = estado({ items: [{ id: '1', titulo: 'A' }, { id: '2', titulo: 'B' }] })
      productos.mutations.EDITAR(state, { id: 2, titulo: 'B2' })

      expect(state.items[1].titulo).toBe('B2')
      expect(state.items[0].titulo).toBe('A')
    })

    test('ELIMINAR quita el producto', () => {
      const state = estado({ items: [{ id: '1' }, { id: '2' }] })
      productos.mutations.ELIMINAR(state, '1')

      expect(state.items).toEqual([{ id: '2' }])
    })
  })

  describe('getters', () => {
    const state = estado({
      items: [
        { id: '1', titulo: 'A', categoria: 'Novela', destacado: true },
        { id: '2', titulo: 'B', categoria: 'Ciencia', destacado: false },
        { id: '3', titulo: 'C', categoria: 'Novela', destacado: true }
      ]
    })

    test('porId encuentra el producto sin importar si el id es número o texto', () => {
      expect(productos.getters.porId(state)('2').titulo).toBe('B')
      expect(productos.getters.porId(state)(3).titulo).toBe('C')
      expect(productos.getters.porId(state)('99')).toBeUndefined()
    })

    test('categorias devuelve las categorías únicas y ordenadas', () => {
      expect(productos.getters.categorias(state)).toEqual(['Ciencia', 'Novela'])
    })

    test('destacados solo incluye productos destacados', () => {
      expect(productos.getters.destacados(state).map(p => p.id)).toEqual(['1', '3'])
    })
  })

  describe('acción cargar', () => {
    test('carga los productos y apaga el loading', async () => {
      api.get.mockResolvedValue({ data: [{ id: '1' }] })
      const commit = jest.fn()

      await productos.actions.cargar({ commit, state: estado() })

      expect(api.get).toHaveBeenCalledWith('/productos')
      expect(commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(commit).toHaveBeenCalledWith('SET_ITEMS', [{ id: '1' }])
      expect(commit).toHaveBeenCalledWith('SET_CARGADO', true)
      expect(commit).toHaveBeenLastCalledWith('SET_LOADING', false)
    })

    test('ante un error guarda un mensaje y no marca como cargado', async () => {
      api.get.mockRejectedValue(new Error('caído'))
      const commit = jest.fn()

      await productos.actions.cargar({ commit, state: estado() })

      expect(commit).toHaveBeenCalledWith('SET_ERROR', 'No se pudieron cargar los productos.')
      expect(commit).not.toHaveBeenCalledWith('SET_CARGADO', true)
      expect(commit).toHaveBeenLastCalledWith('SET_LOADING', false)
    })

    test('si ya hay una carga en curso no lanza otra petición', async () => {
      const commit = jest.fn()

      await productos.actions.cargar({ commit, state: estado({ loading: true }) })

      expect(api.get).not.toHaveBeenCalled()
      expect(commit).not.toHaveBeenCalled()
    })

    test('si la API no devuelve una lista deja el catálogo vacío', async () => {
      api.get.mockResolvedValue({ data: { mensaje: 'raro' } })
      const commit = jest.fn()

      await productos.actions.cargar({ commit, state: estado() })

      expect(commit).toHaveBeenCalledWith('SET_ITEMS', [])
    })
  })

  describe('acciones de escritura', () => {
    test('agregar hace POST y guarda el producto devuelto por la API', async () => {
      api.post.mockResolvedValue({ data: { id: '9', titulo: 'Nuevo' } })
      const commit = jest.fn()

      await productos.actions.agregar({ commit }, { titulo: 'Nuevo' })

      expect(api.post).toHaveBeenCalledWith('/productos', { titulo: 'Nuevo' })
      expect(commit).toHaveBeenCalledWith('AGREGAR', { id: '9', titulo: 'Nuevo' })
    })

    test('eliminar propaga el error para que la vista lo muestre', async () => {
      api.delete.mockRejectedValue(new Error('500'))
      const commit = jest.fn()

      await expect(productos.actions.eliminar({ commit }, '1')).rejects.toThrow('500')
      expect(commit).not.toHaveBeenCalled()
    })
  })
})
