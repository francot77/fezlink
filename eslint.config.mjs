import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: true }],
      'react-hooks/exhaustive-deps': 'warn',
      'sort-imports': ['warn', { ignoreDeclarationSort: true, allowSeparatedGroups: true }],
    },
  },
];

export default eslintConfig;
