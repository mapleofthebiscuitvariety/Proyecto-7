describe('Carrito de compras', () => {
  beforeEach(() => {
    cy.mockProductos()
  })

  it('agrega un producto, lo ve en el carrito y lo quita', () => {
    cy.visitar('/tienda')
    cy.wait('@productos')

    cy.get('[data-test=btn-carrito]').should('have.attr', 'aria-label').and('include', '0 productos')

    cy.contains('[data-test=producto-card]', 'Cien años de soledad').find('[data-test=btn-agregar]').click()
    cy.get('[data-test=btn-carrito]').should('have.attr', 'aria-label').and('include', '1 producto')

    cy.get('[data-test=btn-carrito]').click()
    cy.url().should('include', '/carrito')
    cy.get('[data-test=linea-carrito]').should('have.length', 1).and('contain', 'Cien años de soledad')
    cy.get('[data-test=total]').should('contain', '14.990')

    cy.get('[data-test=btn-quitar]').click()
    cy.get('[data-test=estado-vacio]').should('contain', 'Tu carrito está vacío')
  })

  it('actualiza el total al cambiar la cantidad', () => {
    cy.visitar('/tienda')
    cy.wait('@productos')
    cy.contains('[data-test=producto-card]', 'Cien años de soledad').find('[data-test=btn-agregar]').click()

    cy.get('[data-test=btn-carrito]').click()
    cy.get('[aria-label="Aumentar cantidad"]').click()

    cy.get('[data-test=linea-cantidad]').should('have.text', '2')
    cy.get('[data-test=total]').should('contain', '29.980')
  })

  it('el carrito se conserva al recargar la página', () => {
    cy.visitar('/tienda')
    cy.wait('@productos')
    cy.contains('[data-test=producto-card]', 'Sapiens').find('[data-test=btn-agregar]').click()

    cy.reload()
    cy.wait('@productos')
    cy.get('[data-test=btn-carrito]').should('have.attr', 'aria-label').and('include', '1 producto')
  })

  it('completa la compra simulada y vacía el carrito', () => {
    cy.visitar('/tienda')
    cy.wait('@productos')
    cy.contains('[data-test=producto-card]', 'Sapiens').find('[data-test=btn-agregar]').click()

    cy.get('[data-test=btn-carrito]').click()
    cy.get('[data-test=btn-finalizar]').click()
    cy.get('[data-test=btn-confirmar]').click()

    cy.url().should('not.include', '/carrito')
    cy.get('[data-test=btn-carrito]').should('have.attr', 'aria-label').and('include', '0 productos')
  })
})

describe('Detalle de producto', () => {
  beforeEach(() => {
    cy.mockProductos()
  })

  it('muestra el detalle y permite agregarlo al carrito', () => {
    cy.visitar('/producto/2')
    cy.wait('@productos')

    cy.get('[data-test=detalle-titulo]').should('contain', 'Sapiens')
    cy.get('[data-test=detalle-precio]').should('contain', '16.990')

    cy.get('[data-test=btn-agregar-detalle]').click()
    cy.get('[data-test=btn-carrito]').should('have.attr', 'aria-label').and('include', '1 producto')
  })

  it('muestra un mensaje si el producto no existe', () => {
    cy.visitar('/producto/999')
    cy.wait('@productos')

    cy.get('[data-test=estado-no-encontrado]').should('contain', 'No encontramos ese producto')
  })
})
