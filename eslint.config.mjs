import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';


/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^type$' }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-parens': ['error', 'always'],
      'arrow-spacing': 'error',
      'block-spacing': 'error',
      'brace-style': 'error',
      'comma-spacing': 'error',
      'func-call-spacing': 'error',
      'rest-spread-spacing': 'error',
      'object-curly-spacing': ['error', 'always'],
      'indent': ['error', 2, { 'SwitchCase': 1 }],
      'key-spacing': 'error',
      'keyword-spacing': 'error',
      'space-before-function-paren': 'error',
      'new-parens': 'error',
      'quotes': ['error', 'single'],
      'space-before-blocks': 'error',
      'space-in-parens': 'error',
      'eqeqeq': ['error', 'smart'],
    },
  },
];
