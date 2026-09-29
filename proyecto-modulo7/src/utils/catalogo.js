export const CATEGORIAS_BASE = ['Novela', 'Ensayo', 'Fantasía', 'Ciencia', 'Biografía', 'Poesía']

export const ORDENES = [
  { value: 'relevancia', title: 'Destacados primero' },
  { value: 'precio-asc', title: 'Precio: menor a mayor' },
  { value: 'precio-desc', title: 'Precio: mayor a menor' },
  { value: 'titulo', title: 'Título (A-Z)' },
  { value: 'rating', title: 'Mejor valorados' }
]

// Sin mayúsculas ni tildes: "fantasia" encuentra "Fantasía"
export function normalizar(texto) {
  return String(texto ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function filtrarProductos(items, filtros = {}, idsFavoritos = []) {
  const { busqueda = '', categoria = '', orden = 'relevancia', soloFavoritos = false } = filtros
  const texto = normalizar(busqueda)
  const favoritos = idsFavoritos.map(String)

  const resultado = items.filter(p =>
    (texto === '' || normalizar(p.titulo).includes(texto) || normalizar(p.autor).includes(texto)) &&
    (categoria === '' || p.categoria === categoria) &&
    (!soloFavoritos || favoritos.includes(String(p.id)))
  )

  const comparadores = {
    'precio-asc': (a, b) => a.precio - b.precio,
    'precio-desc': (a, b) => b.precio - a.precio,
    titulo: (a, b) => a.titulo.localeCompare(b.titulo, 'es'),
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    relevancia: (a, b) => Number(!!b.destacado) - Number(!!a.destacado)
  }
  return resultado.sort(comparadores[orden] || comparadores.relevancia)
}
