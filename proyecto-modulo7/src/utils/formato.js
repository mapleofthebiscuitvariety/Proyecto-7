const formateador = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
})

export function formatoPrecio(valor) {
  const numero = Number(valor)
  return formateador.format(Number.isFinite(numero) ? numero : 0)
}
