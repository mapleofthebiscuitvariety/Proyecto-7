describe('Tienda: catálogo de productos', () => {
  beforeEach(() => {
    cy.mockProductos()
  })

  it('muestra el catálogo completo con su conteo', () => {
    cy.fixture('productos.json').then(productos => {
      cy.visitar('/tienda')
      cy.wait('@productos')

      cy.get('[data-test=producto-card]').should('have.length', productos.length)
      cy.get('[data-test=conteo]').should('contain', `Mostrando ${productos.length} de ${productos.length}`)
    })
  })

  it('muestra un estado de carga mientras llegan los datos', () => {
    cy.intercept('GET', '**/productos', { fixture: 'productos.json', delay: 800 }).as('lento')

    cy.visitar('/tienda')
    cy.get('[data-test=cargando]').should('exist')
    cy.wait('@lento')
    cy.get('[data-test=cargando]').should('not.exist')
    cy.get('[data-test=producto-card]').should('exist')
  })

  it('muestra el error y permite reintentar', () => {
    cy.intercept('GET', '**/productos', { statusCode: 500, body: {} }).as('falla')

    cy.visitar('/tienda')
    cy.wait('@falla')
    cy.get('[data-test=estado-error]').should('be.visible').and('contain', 'No pudimos cargar')

    // ahora la API responde bien
    cy.mockProductos()
    cy.contains('[data-test=btn-accion]', 'Reintentar').click()

    cy.get('[data-test=estado-error]').should('not.exist')
    cy.get('[data-test=producto-card]').should('exist')
  })

  it('muestra el estado vacío cuando no hay productos', () => {
    cy.intercept('GET', '**/productos', []).as('vacio')

    cy.visitar('/tienda')
    cy.wait('@vacio')
    cy.get('[data-test=estado-vacio]').should('contain', 'Aún no hay productos')
  })

  it('filtra por categoría', () => {
    cy.visitar('/tienda')
    cy.wait('@productos')

    cy.contains('[data-test=chip-categoria]', 'Ciencia').click()

    cy.get('[data-test=producto-card]').should('have.length.greaterThan', 0)
    cy.get('[data-test=producto-card] [data-test=categoria]').each($etiqueta => {
      expect($etiqueta.text().trim()).to.eq('Ciencia')
    })

    cy.contains('[data-test=chip-categoria]', 'Todas').click()
    cy.fixture('productos.json').then(productos => {
      cy.get('[data-test=producto-card]').should('have.length', productos.length)
    })
  })

  it('aplica la categoría que llega por la URL', () => {
    cy.visitar('/tienda?categoria=Poes%C3%ADa')
    cy.wait('@productos')

    cy.get('[data-test=producto-card] [data-test=categoria]').each($etiqueta => {
      expect($etiqueta.text().trim()).to.eq('Poesía')
    })
  })

  it('busca por texto y muestra "sin resultados" con opción de limpiar', () => {
    cy.visitar('/tienda')
    cy.wait('@productos')

    cy.get('[data-test=input-busqueda] input').type('zzzzzz')
    cy.get('[data-test=estado-vacio]').should('contain', 'Sin resultados')

    cy.contains('[data-test=btn-accion]', 'Limpiar filtros').click()
    cy.get('[data-test=producto-card]').should('have.length.greaterThan', 0)
  })

  it('la búsqueda ignora tildes y mayúsculas', () => {
    cy.visitar('/tienda')
    cy.wait('@productos')

    cy.get('[data-test=input-busqueda] input').type('GARCIA')
    cy.get('[data-test=producto-card]').should('have.length', 1).and('contain', 'Cien años de soledad')
  })

  it('los productos agotados no se pueden agregar', () => {
    cy.visitar('/tienda')
    cy.wait('@productos')

    cy.contains('[data-test=producto-card]', 'Breve historia del tiempo')
      .find('[data-test=btn-agregar]')
      .should('be.disabled')
  })
})
