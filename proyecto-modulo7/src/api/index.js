import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3001',
  timeout: 8000
})

// Convierte cualquier error de axios en un mensaje entendible para la persona usuaria
export function mensajeError(error, porDefecto = 'Ocurrió un error inesperado.') {
  if (!error) return porDefecto
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'El servidor tardó demasiado en responder. Inténtalo otra vez.'
  }
  if (error.response) {
    return `El servidor respondió con un error (${error.response.status}).`
  }
  if (error.request) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión o que la API esté encendida (npm run mock).'
  }
  return porDefecto
}

export default api
