import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // 忽略依赖、构建产物与第三方库
    ignores: ['node_modules/**', 'dist/**', 'src/component/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        layui: 'readonly',
      },
    },
    rules: {
      // 站点沿用全局/IIFE 风格，先放开这些规则，避免既有代码被误报
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-useless-assignment': 'off',
    },
  },
];
