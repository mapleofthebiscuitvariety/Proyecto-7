# LibroNova · Librería online (Vue 3 + Vuetify)

Transformación del gestor de libros del Módulo 6 en una tienda e-commerce: catálogo con filtros,
detalle de producto, carrito persistente, favoritos, tema claro/oscuro y un panel de administración
protegido por login para gestionar productos, precios y stock.

## Puesta en marcha

```bash
npm install
npm run mock     # API falsa (json-server) en http://localhost:3001  → terminal 1
npm run serve    # app en http://localhost:8080                       → terminal 2
```

### Si no compila

npm install vuetify@^3.7.0 @mdi/js @fontsource/fredoka @fontsource/nunito | Añade explícitamente las dependencias faltantes al proyecto |

## Scripts de calidad

| Comando               | Qué hace                                       |
| --------------------- | ---------------------------------------------- |
| `npm run lint`        | ESLint (corrige lo que pueda automáticamente)  |
| `npm run lint:check`  | ESLint solo revisando, sin modificar archivos  |
| `npm run test:unit`   | Jest: store, utilidades y componentes          |
| `npm run test:e2e`    | Cypress interactivo (levanta el servidor solo) |
| `npm run test:e2e:ci` | Cypress sin interfaz                           |
| `npm run build`       | Compilación de producción                      |

Las pruebas E2E **no necesitan** `npm run mock`: interceptan la API con `cy.intercept` y un fixture
(`tests/e2e/fixtures/productos.json`).

## Estructura

```
src/
├─ api/            axios (timeout, URL configurable) + mensajeError()
├─ components/
│  ├─ ProductCard.vue     ← tarjeta de producto (portada, precio, stock, favorito, agregar)
│  ├─ ProductGrid.vue     estados cargando / error / vacío / con datos
│  ├─ EstadoVista.vue     bloque reutilizable de error y vacío
│  ├─ ProductoForm.vue    crear/editar producto (validaciones)
│  └─ ThemeToggle.vue     botón claro/oscuro
├─ composables/    useTema, useAviso (snackbar global)
├─ plugins/vuetify.js     temas claro/oscuro, íconos SVG, valores por defecto
├─ store/modules/  productos, carrito, favoritos, filtros
├─ utils/          catalogo (filtrar/ordenar), formato (CLP), almacen (localStorage seguro)
└─ views/          Inicio, Tienda, ProductoDetalle, Carrito, Login, Admin, NoEncontrado
```

## Decisiones de diseño

- **Vuetify 3** con íconos `@mdi/js` (SVG, sin CSS de fuentes externo).
- **Colores**: la paleta sale de las ilustraciones (contorno azul marino, coral, rosa, turquesa y amarillo).
  El modo oscuro usa versiones más claras de esos mismos tonos para mantener el contraste.
- **Tipografía**: Fredoka (títulos, redondeada como las ilustraciones) y Nunito (texto), instaladas con
  `@fontsource`, sin depender de CDNs.
- **Ilustraciones**: tienen contorno azul marino, por eso siempre se apoyan sobre un lienzo crema
  (`.marco-img`), también en modo oscuro.
- **Ciclos de vida**: `onMounted` en `App` (carga inicial), `Tienda` (categoría de la URL + datos),
  `ProductoDetalle` (carga en acceso directo) y `Admin` (datos frescos); `watch` para el título de la
  pestaña y la categoría de la URL.
- **Estados**: cargando (skeletons), error (con "Reintentar") y vacío (con "Limpiar filtros") en todas las listas.
- **Accesibilidad**: `aria-label` en botones de ícono, `role="alert"/"status"` en estados, `aria-live` en
  el conteo, foco visible de Vuetify y `prefers-reduced-motion` respetado.
- La compra es **simulada** (no hay pasarela de pago) y el login es de demostración (solo pide un nombre).

## Nota sobre las pruebas unitarias

Los tests de componentes registran versiones "de paso" de los componentes de Vuetify
(`tests/unit/setup.js`) y sustituyen `@mdi/js` por un mock liviano. Así prueban la lógica de nuestros
componentes con Jest 27 sin cargar todo Vuetify (que es ESM y pesado en jsdom). El renderizado real con
Vuetify lo cubre Cypress.
