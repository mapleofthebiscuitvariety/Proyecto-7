import { mount } from '@vue/test-utils'
import EstadoVista from '@/components/EstadoVista.vue'

describe('EstadoVista.vue', () => {
  test('el estado de error usa role="alert" y muestra título y texto', () => {
    const wrapper = mount(EstadoVista, {
      props: { tipo: 'error', titulo: 'Algo falló', texto: 'Intenta de nuevo' }
    })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.attributes('data-test')).toBe('estado-error')
    expect(wrapper.text()).toContain('Algo falló')
    expect(wrapper.text()).toContain('Intenta de nuevo')
  })

  test('el estado vacío usa role="status"', () => {
    const wrapper = mount(EstadoVista, { props: { tipo: 'vacio', titulo: 'Nada por aquí' } })

    expect(wrapper.attributes('role')).toBe('status')
  })

  test('sin etiqueta de acción no dibuja el botón', () => {
    const wrapper = mount(EstadoVista, { props: { titulo: 'Nada por aquí' } })

    expect(wrapper.find('[data-test="btn-accion"]').exists()).toBe(false)
  })

  test('emite "accion" al pulsar el botón', async () => {
    const wrapper = mount(EstadoVista, {
      props: { tipo: 'error', titulo: 'Falló', etiquetaAccion: 'Reintentar' }
    })

    const boton = wrapper.get('[data-test="btn-accion"]')
    expect(boton.text()).toBe('Reintentar')

    await boton.trigger('click')
    expect(wrapper.emitted('accion')).toHaveLength(1)
  })
})
