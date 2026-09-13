import tsParser from '@typescript-eslint/parser'
import svelte from 'eslint-plugin-svelte'

export default [
  ...svelte.configs['flat/recommended'],
  { ignores: ['.svelte-kit/**', 'dist/**', 'node_modules/**', '**/*.svelte'] },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser, parserOptions: { sourceType: 'module', ecmaVersion: 'latest' } },
  },
]
