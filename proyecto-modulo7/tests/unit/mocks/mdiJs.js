// Sustituto de @mdi/js para Jest: cada ícono devuelve su propio nombre
module.exports = new Proxy(
  {},
  {
    get: (objetivo, nombre) => (nombre === '__esModule' ? false : String(nombre))
  }
)
