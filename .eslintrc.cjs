module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:solid/typescript',
    'plugin:storybook/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'solid',
    // 'prettier'
  ],
  root: true,
  rules: {
    '@typescript-eslint/no-unused-vars': [
      1,
      { args: 'none', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/no-namespace': 0,
  },
};
