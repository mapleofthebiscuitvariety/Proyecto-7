import { reactive } from 'vue'

// Estado compartido del snackbar global (se dibuja una sola vez en App.vue)
export const aviso = reactive({ visible: false, texto: '', color: 'success' })

export function mostrarAviso(texto, color = 'success') {
  aviso.texto = texto
  aviso.color = color
  aviso.visible = true
}
