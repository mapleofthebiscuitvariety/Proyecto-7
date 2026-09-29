module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // axios 1.x publica ESM en "main"; Jest 27 necesita el build CommonJS
    '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs',
    // @mdi/js pesa ~2 MB y es ESM: en los tests basta con devolver el nombre del ícono
    '^@mdi/js$': '<rootDir>/tests/unit/mocks/mdiJs.js'
  },
  collectCoverageFrom: [
    'src/components/**/*.vue',
    'src/store/**/*.js',
    'src/utils/**/*.js'
  ]
}
