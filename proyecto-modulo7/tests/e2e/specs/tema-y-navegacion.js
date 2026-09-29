describe('Tema claro/oscuro', () => {
  beforeEach(() => {
    cy.mockProductos()
  })

  it('alterna entre claro y oscuro y recuerda la elección', () => {
    cy.visitar('/')
    cy.get('.v-application').should('have.class', 'v-theme--claro')

    cy.get('[data-test=btn-tema]').click()
    cy.get('.v-application').should('have.class', 'v-theme--oscuro')

    cy.reload()
    cy.get('.v-application').should('have.class', 'v-theme--oscuro')
  })

  it('respeta la preferencia del sistema cuando no hay elección guardada', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win, 'matchMedia')
          .callsFake(consulta => ({
            matches: consulta.includes('dark'),
            media: consulta,
            addEventListener() {},
            removeEventListener() {},
            addListener() {},
            removeListener() {}
          }))
      }
    })
    cy.get('.v-application').should('have.class', 'v-theme--oscuro')
  })
})

describe('Navegación y responsive', () => {
  beforeEach(() => {
    cy.mockProductos()
  })

  it('el inicio muestra los destacados y las categorías', () => {
    cy.visitar('/')
    cy.wait('@productos')

    cy.get('h1').should('contain', 'Tu próxima lectura')
    cy.get('[data-test=producto-card]').should('have.length', 4)
    cy.get('[data-test=chip-inicio-categoria]').should('have.length.greaterThan', 0)
  })

  it('una categoría del inicio lleva a la tienda ya filtrada', () => {
    cy.visitar('/')
    cy.wait('@productos')

    cy.contains('[data-test=chip-inicio-categoria]', 'Biografía').click()
    cy.url().should('include', '/tienda')
    cy.get('[data-test=producto-card] [data-test=categoria]').each($etiqueta => {
      expect($etiqueta.text().trim()).to.eq('Biografía')
    })
  })

  it('en móvil el menú se abre desde el botón hamburguesa', () => {
    cy.viewport('iphone-6')
    cy.visitar('/')

    cy.get('[data-test=btn-menu]').click()
    cy.get('.v-navigation-drawer').should('be.visible').and('contain', 'Tienda')
  })

  it('una ruta inexistente muestra la página 404', () => {
    cy.visitar('/esto-no-existe')
    cy.get('[data-test=estado-404]').should('contain', 'Esta página no existe')
  })
})

describe('Acceso al panel de administración', () => {
  beforeEach(() => {
    cy.mockProductos()
  })

  it('redirige al login si no hay sesión', () => {
    cy.visitar('/admin')
    cy.url().should('include', '/login')
  })

  it('permite ingresar y vuelve al panel', () => {
    cy.visitar('/admin')
    cy.get('[data-test=input-nombre] input').type('ana{enter}')

    cy.url().should('include', '/admin')
    cy.contains('h1', 'Hola, Ana')
    cy.get('[data-test=fila-producto]').should('have.length.greaterThan', 0)
  })

  it('valida que el nombre no esté vacío', () => {
    cy.visitar('/login')
    cy.get('[data-test=btn-login]').click()
    cy.contains('Escribe tu nombre para continuar.')
  })
})
