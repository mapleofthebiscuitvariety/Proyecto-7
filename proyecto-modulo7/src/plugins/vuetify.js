import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Paleta tomada de los íconos: contorno azul marino, coral, rosa, turquesa y amarillo
const claro = {
  dark: false,
  colors: {
    background: '#FDF6EC',
    surface: '#FFFFFF',
    'surface-variant': '#FFECE2',
    'on-surface-variant': '#4A5688',
    'on-background': '#14286B',
    'on-surface': '#14286B',
    primary: '#CC4019',
    'on-primary': '#FFFFFF',
    secondary: '#14286B',
    'on-secondary': '#FFFFFF',
    error: '#C02C50',
    info: '#3FB6A8',
    success: '#12776F',
    warning: '#FDB827',
    'on-warning': '#14286B',
    turquesa: '#3FB6A8',
    rosa: '#E4507F',
    ambar: '#FDB827',
    // contorno y sombra "sticker" de las tarjetas
    borde: '#14286B',
    sombra: '#FDB827',
    // fondo fijo para ilustraciones (sus contornos son azul marino)
    lienzo: '#FDF6EC'
  }
}

const oscuro = {
  dark: true,
  colors: {
    background: '#0E1430',
    surface: '#172049',
    'surface-variant': '#243070',
    'on-surface-variant': '#C9D0F5',
    'on-background': '#EEF0FF',
    'on-surface': '#EEF0FF',
    primary: '#FF7A55',
    'on-primary': '#0E1430',
    secondary: '#9DB0FF',
    'on-secondary': '#0E1430',
    error: '#FF6B8A',
    info: '#5FD3C4',
    success: '#5FD3C4',
    warning: '#FDB827',
    'on-warning': '#14286B',
    turquesa: '#5FD3C4',
    rosa: '#FF7FA5',
    ambar: '#FFCB52',
    borde: '#8B9CF0',
    sombra: '#E4507F',
    lienzo: '#FDF6EC'
  }
}

// Usa la preferencia guardada; si no existe, la del sistema operativo
export function temaInicial() {
  try {
    const guardado = localStorage.getItem('tema')
    if (guardado === 'claro' || guardado === 'oscuro') return guardado
  } catch (e) {
    // sin almacenamiento: se usa la preferencia del sistema
  }
  const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefiereOscuro ? 'oscuro' : 'claro'
}

export default createVuetify({
  components,
  directives,
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: {
    defaultTheme: temaInicial(),
    themes: { claro, oscuro }
  },
  defaults: {
    VBtn: { rounded: 'lg', style: 'text-transform: none; letter-spacing: 0; font-weight: 700;' },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary' }
  }
})
