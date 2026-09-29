// Comandos personalizados de Cypress

// Responde el catálogo con el fixture (sin necesitar json-server encendido)
Cypress.Commands.add('mockProductos', () => {
  cy.intercept('GET', '**/productos', { fixture: 'productos.json' }).as('productos')
})

// Visita una ruta con el tema claro fijado, para que las pruebas no dependan del sistema operativo
Cypress.Commands.add('visitar', (ruta = '/') => {
  cy.visit(ruta, {
    onBeforeLoad(win) {
      win.localStorage.setItem('tema', 'claro')
    }
  })
})
