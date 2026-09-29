import { filtrarProductos, normalizar } from '@/utils/catalogo'
import { formatoPrecio } from '@/utils/formato'

const items = [
  { id: '1', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', categoria: 'Novela', precio: 15000, rating: 4.8, destacado: false },
  { id: '2', titulo: 'Sapiens', autor: 'Yuval Noah Harari', categoria: 'Ensayo', precio: 17000, rating: 4.6, destacado: true },
  { id: '3', titulo: 'Ficciones', autor: 'Jorge Luis Borges', categoria: 'Fantasía', precio: 12000, rating: 4.9, destacado: false }
]
const ids = lista => lista.map(p => p.id)

describe('normalizar', () => {
  test('ignora mayúsculas, tildes y espacios extremos', () => {
    expect(normalizar('  FANTASÍA ')).toBe('fantasia')
    expect(normalizar(null)).toBe('')
  })
})

describe('filtrarProductos', () => {
  test('sin filtros devuelve todo, con los destacados primero', () => {
    expect(ids(filtrarProductos(items))).toEqual(['2', '1', '3'])
  })

  test('filtra por categoría', () => {
    expect(ids(filtrarProductos(items, { categoria: 'Novela' }))).toEqual(['1'])
  })

  test('busca por título o autor sin distinguir tildes', () => {
    expect(ids(filtrarProductos(items, { busqueda: 'garcia' }))).toEqual(['1'])
    expect(ids(filtrarProductos(items, { busqueda: 'SAPIENS' }))).toEqual(['2'])
  })

  test('combina búsqueda y categoría', () => {
    expect(filtrarProductos(items, { busqueda: 'sapiens', categoria: 'Novela' })).toEqual([])
  })

  test('solo favoritos usa los ids guardados (número o texto)', () => {
    expect(ids(filtrarProductos(items, { soloFavoritos: true }, ['3']))).toEqual(['3'])
  })

  test('ordena por precio, título y valoración', () => {
    expect(ids(filtrarProductos(items, { orden: 'precio-asc' }))).toEqual(['3', '1', '2'])
    expect(ids(filtrarProductos(items, { orden: 'precio-desc' }))).toEqual(['2', '1', '3'])
    expect(ids(filtrarProductos(items, { orden: 'titulo' }))).toEqual(['1', '3', '2'])
    expect(ids(filtrarProductos(items, { orden: 'rating' }))).toEqual(['3', '1', '2'])
  })

  test('no modifica el arreglo original', () => {
    const copia = [...items]
    filtrarProductos(items, { orden: 'precio-desc' })

    expect(items).toEqual(copia)
  })
})

describe('formatoPrecio', () => {
  test('da formato de pesos chilenos sin decimales', () => {
    expect(formatoPrecio(14990)).toMatch(/14\.990/)
    expect(formatoPrecio(14990)).toContain('$')
  })

  test('valores inválidos se muestran como 0', () => {
    expect(formatoPrecio('abc')).toMatch(/0/)
    expect(formatoPrecio(undefined)).toMatch(/0/)
  })
})
