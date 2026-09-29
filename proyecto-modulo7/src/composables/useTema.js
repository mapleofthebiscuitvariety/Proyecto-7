import { computed } from 'vue'
import { useTheme } from 'vuetify'

export function useTema() {
  const theme = useTheme()
  const esOscuro = computed(() => theme.global.name.value === 'oscuro')

  function alternar() {
    const nuevo = esOscuro.value ? 'claro' : 'oscuro'
    if (typeof theme.change === 'function') theme.change(nuevo)
    else theme.global.name.value = nuevo
    try {
      localStorage.setItem('tema', nuevo)
    } catch (e) {
      // sin almacenamiento: el cambio dura hasta recargar
    }
  }

  return { esOscuro, alternar }
}
