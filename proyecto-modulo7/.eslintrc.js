module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    sourceType: 'module'
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off'
  },
  overrides: [
    {
      // Jest: describe, test, expect, jest, beforeEach...
      files: ['**/tests/unit/**/*.{js,jsx}'],
      env: { jest: true }
    }
  ]
}
