import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // 忽略的文件
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.vite/**',
      '.backup/**',
      '*.config.js',
      '*.config.ts',
      '.claude/**',
      'assets/**',
      'data/**',
    ],
  },
  // 基础配置
  js.configs.recommended,
  // TypeScript 文件配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-this-alias': [
        'error',
        {
          allowDestructuring: true,
          allowedNames: ['context'],
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // TypeScript 已经检查未定义的变量，禁用 ESLint 的 no-undef
      'no-undef': 'off',
    },
  },
];
