const tsEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  // Global ignores
  {
    ignores: ['node_modules/**', '.expo/**', 'android/**', 'ios/**', 'coverage/**'],
  },

  // React flat/recommended (provides plugin + rules via flat config API)
  {
    ...reactPlugin.configs.flat.recommended,
    files: ['**/*.{ts,tsx}'],
  },

  // React hooks flat/recommended-latest
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.flat['recommended-latest'].rules,
  },

  // Main TypeScript + project rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      'react-native': reactNativePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // TypeScript recommended rules
      ...tsEslint.configs.recommended.rules,

      // Prettier config disables conflicting formatting rules
      ...prettierConfig.rules,

      // Custom overrides
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // React Native — catch unused styles and unsafe patterns early
      'react-native/no-unused-styles': 'error',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-single-element-style-arrays': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
