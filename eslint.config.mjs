import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import chaiFriendly from 'eslint-plugin-chai-friendly'

export default [
  {
    ignores: ["build/", ".yarn/"],
  },

  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ['**/*.ts']
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      import: importPlugin,
      'chai-friendly': chaiFriendly
    },
    rules: {
      /* your old tslint rules */
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'space-before-function-paren': 'off',
      'no-console': 'error',

      'import/order': ['error', { 'newlines-between': 'always' }],

      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'chai-friendly/no-unused-expressions': 'error'
    }
  }
]
