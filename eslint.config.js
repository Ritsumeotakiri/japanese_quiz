import tsParser from '@typescript-eslint/parser'
import tseslint from '@typescript-eslint/eslint-plugin'
import svelte from 'eslint-plugin-svelte'

export default [
  ...svelte.configs['flat/recommended'],
  { ignores: ['.svelte-kit/**', 'dist/**', 'node_modules/**', '**/*.svelte'] },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser, parserOptions: { sourceType: 'module', ecmaVersion: 'latest' } },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'variable', format: ['snake_case', 'UPPER_CASE'], leadingUnderscore: 'allow' },
        { selector: 'parameter', format: ['snake_case'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'property', format: null },
      ],
    },
  },
]
