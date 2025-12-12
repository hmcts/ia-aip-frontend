import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config({
    files: ['**/*.ts'],
    extends: [
        eslint.configs.recommended,
        tseslint.configs.recommendedTypeChecked,
        {
            languageOptions: {
                parserOptions: {
                    projectService: true,
                },
            },
        },
    ],
    plugins: {
        '@stylistic': stylistic
    },
    rules: {
        // port tslint rules
        '@stylistic/quotes': ['warn', 'single', { 'avoidEscape': true }],
        '@stylistic/semi': 'warn',
        'space-before-function-paren': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        'no-console': 'warn',
        'sort-imports': 'warn',
        '@typescript-eslint/no-deprecated': 'off',

        // override unnecessary rules
        '@typescript-eslint/array-type': 'off',
        '@typescript-eslint/no-wrapper-object-types': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-namespace': 'off',
        'prefer-const': 'off',
        'no-useless-escape': 'off',
        'no-case-declarations': 'off',
        'no-constant-binary-expression': 'off',
        '@typescript-eslint/no-redundant-type-constituents': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/prefer-promise-reject-errors': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-base-to-string': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-enum-comparison': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-floating-promises': 'off'
    },
});
