import { config, RouterLinkStub } from '@vue/test-utils'
import { h } from 'vue'

// Vuetify se registra globalmente en la app real. En los tests unitarios se usan
// componentes "de paso": renderizan sus hijos y dejan pasar atributos y eventos,
// así se prueba la lógica de nuestros componentes sin cargar todo Vuetify en jsdom.
// El renderizado real con Vuetify lo cubren las pruebas E2E de Cypress.
const pasar = (etiqueta = 'div') => ({
  render() {
    return h(etiqueta, {}, this.$slots.default ? this.$slots.default() : [])
  }
})

config.global.components = {
  VCard: pasar('div'),
  VCardText: pasar('div'),
  VCardActions: pasar('div'),
  VChip: pasar('span'),
  VBtn: pasar('button'),
  VIcon: pasar('i'),
  VSpacer: pasar('span'),
  VSkeletonLoader: pasar('div')
}
config.global.stubs = { RouterLink: RouterLinkStub }

beforeEach(() => {
  localStorage.clear()
})
