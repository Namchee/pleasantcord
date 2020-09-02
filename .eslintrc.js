module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'plugins': [
    'jsdoc',
  ],
  'rules': {
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1,
      },
    ],
    'linebreak-style': [ // change this accordingly
      'warn',
      'windows',
    ],
    'object-curly-spacing': [
      'error',
      'always',
    ],
    'arrow-parens': [
      'error',
      'as-needed',
      {
        'requireForBlockBody': true,
      },
    ],
    'require-jsdoc': 'off', // favor eslint-plugin-jsdoc
    'valid-jsdoc': 'off', // favor eslint-plugin-jsdoc
    'new-cap': 'off', // prevent decorator issues
    'no-invalid-this': 'off', // prevent `this` false alarm on arrow functions
    'require-atomic-updates': 'off', // prevent async false alarm
    '@typescript-eslint/no-var-requires': 'off', // enforce ES6 import style
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/camelcase': 'off' // prevent camelCase false alarm
  },
};
