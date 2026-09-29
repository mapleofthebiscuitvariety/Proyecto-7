import { mount, RouterLinkStub } from '@vue/test-utils'
import ProductCard from '@/components/ProductCard.vue'

const base = {
  id: '1',
  titulo: 'Cien años de soledad',
  autor: 'Gabriel García Márquez',
  categoria: 'Novela',
  precio: 12990,
  stock: 12,
  rating: 4.8,
  imagen: ''
}

const montar = (producto = {}, props = {}) =>
  mount(ProductCard, { props: { producto: { ...base, ...producto }, ...props } })

describe('ProductCard.vue', () => {
  test('muestra título, autor, categoría y precio formateado', () => {
    const wrapper = montar()

    expect(wrapper.get('[data-test="titulo"]').text()).toBe('Cien años de soledad')
    expect(wrapper.get('[data-test="autor"]').text()).toBe('Gabriel García Márquez')
    expect(wrapper.get('[data-test="categoria"]').text()).toBe('Novela')
    expect(wrapper.get('[data-test="precio"]').text()).toMatch(/12\.990/)
  })

  test('enlaza al detalle del producto', () => {
    const wrapper = montar()

    const enlaces = wrapper.findAllComponents(RouterLinkStub)
    expect(enlaces.length).toBeGreaterThan(0)
    expect(enlaces[0].props('to')).toEqual({ name: 'producto', params: { id: '1' } })
  })

  test('emite "agregar" con el id al pulsar el botón', async () => {
    const wrapper = montar()

    await wrapper.get('[data-test="btn-agregar"]').trigger('click')

    expect(wrapper.emitted('agregar')).toHaveLength(1)
    expect(wrapper.emitted('agregar')[0]).toEqual(['1'])
  })

  test('emite "favorito" con el id', async () => {
    const wrapper = montar()

    await wrapper.get('[data-test="btn-favorito"]').trigger('click')

    expect(wrapper.emitted('favorito')[0]).toEqual(['1'])
  })

  test('el aria-label del favorito cambia según el estado', () => {
    const normal = montar()
    const favorito = montar({}, { esFavorito: true })

    expect(normal.get('[data-test="btn-favorito"]').attributes('aria-label')).toContain('Agregar')
    expect(favorito.get('[data-test="btn-favorito"]').attributes('aria-label')).toContain('Quitar')
  })

  test('sin stock: muestra "Agotado" y no permite agregar', async () => {
    const wrapper = montar({ stock: 0 })
    const boton = wrapper.get('[data-test="btn-agregar"]')

    expect(wrapper.get('[data-test="etiqueta-stock"]').text()).toBe('Agotado')
    expect(boton.attributes('disabled')).toBeDefined()

    await boton.trigger('click')
    expect(wrapper.emitted('agregar')).toBeUndefined()
  })

  test('con poco stock avisa cuántas unidades quedan', () => {
    const wrapper = montar({ stock: 3 })

    expect(wrapper.get('[data-test="etiqueta-stock"]').text()).toContain('Últimas 3')
  })

  test('con stock suficiente no muestra etiqueta de stock', () => {
    expect(montar({ stock: 12 }).find('[data-test="etiqueta-stock"]').exists()).toBe(false)
  })

  test('usa la portada si existe y una genérica si no hay imagen', () => {
    const conImagen = montar({ imagen: 'https://ejemplo.cl/portada.jpg' })
    const sinImagen = montar({ imagen: '' })

    expect(conImagen.find('img').attributes('src')).toBe('https://ejemplo.cl/portada.jpg')
    expect(conImagen.find('[data-test="portada-generica"]').exists()).toBe(false)
    expect(sinImagen.find('img').exists()).toBe(false)
    expect(sinImagen.find('[data-test="portada-generica"]').exists()).toBe(true)
  })

  test('si la imagen falla al cargar vuelve a la portada genérica', async () => {
    const wrapper = montar({ imagen: 'https://ejemplo.cl/rota.jpg' })

    await wrapper.get('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('[data-test="portada-generica"]').exists()).toBe(true)
  })
})
