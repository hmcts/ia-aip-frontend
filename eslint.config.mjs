import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import chaiFriendly from 'eslint-plugin-chai-friendly'

export default [
  {
    ignores: ["build/", ".yarn/", 'test/coverage/'],
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
      // quotes: ['error', 'single', { avoidEscape: true }],
      'prefer-const': 'off',
      'quotes': 'off',

      semi: ['error', 'always'],
      'space-before-function-paren': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],

      // 'import/order': ['error', {
      //   'alphabetize': {
      //     "order": "asc",
      //     "caseInsensitive": true
      //   }
      // }],

      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'chai-friendly/no-unused-expressions': 'error',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    }
  }
]
