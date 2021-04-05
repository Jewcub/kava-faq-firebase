module.exports = {
 env: {
  browser: true,
  commonjs: true,
  es2021: true,
 },
 plugins: ['@typescript-eslint'],
 extends: [
  'eslint:recommended',
  'plugin:@typescript-eslint/eslint-recommended',
  'plugin:@typescript-eslint/recommended',
  'prettier/@typescript-eslint',
  'plugin:prettier/recommended',
 ],
 parserOptions: {
  ecmaVersion: 12,
 },
 rules: {
  //
 },
};
