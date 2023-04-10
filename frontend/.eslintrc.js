module.exports = {
  parserOptions: {
    ecmaVersion: 12
  },

  env: {
    es2021: true,
    node: true
  },

  extends: ['plugin:vue/vue3-essential', 'plugin:vue/vue3-recommended', 'plugin:vue/vue3-strongly-recommended', 'eslint:recommended'],

  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'require-atomic-updates': 'off',
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 1, body: 1 },
        FunctionExpression: { parameters: 1, body: 1 },
        CallExpression: { arguments: 1 },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        ignoreComments: false
      }
    ],
    'comma-dangle': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/prop-name-casing': 'error',
    'vue/max-attributes-per-line': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'arrow-body-style': [2, 'as-needed'],
    'arrow-spacing': [2, { before: true, after: true }],
    'no-class-assign': 'error',
    'no-confusing-arrow': 'error',
    'no-const-assign': 'error',
    'no-dupe-class-members': 'error',
    'object-shorthand': [2, 'always'],
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error'
  },

  root: true
};
