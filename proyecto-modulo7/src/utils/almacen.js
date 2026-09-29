// Acceso seguro a localStorage (puede fallar en modo privado o estar bloqueado)
export function leer(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(clave)
    return crudo === null ? porDefecto : JSON.parse(crudo)
  } catch (e) {
    return porDefecto
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch (e) {
    // sin almacenamiento disponible: la app sigue funcionando en memoria
  }
}
