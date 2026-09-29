import { reactive } from 'vue'

function leerToken() {
  try {
    return localStorage.getItem('token')
  } catch (e) {
    return null
  }
}

export const sesion = reactive({
  usuario: leerToken()
})

// demo: solo se pide el nombre, sin contraseña
export function iniciarSesion(nombre) {
  const limpio = (nombre || '').trim()
  if (!limpio) return false

  sesion.usuario = limpio.charAt(0).toUpperCase() + limpio.slice(1)
  try {
    localStorage.setItem('token', sesion.usuario)
  } catch (e) {
    // sin almacenamiento: la sesión dura solo mientras la pestaña esté abierta
  }
  return true
}

export function cerrarSesion() {
  sesion.usuario = null
  try {
    localStorage.removeItem('token')
  } catch (e) {
    // nada que limpiar
  }
}
