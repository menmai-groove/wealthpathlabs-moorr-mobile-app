module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['react', 'react-native', 'import', 'prettier'],
  rules: {
    // Format
    quotes: [2, 'single'],
    semi: [2, 'always'],
    'no-console': [2, { allow: ['info', 'warn', 'error'] }],
    'no-alert': 2,
    // 'no-unused-vars': ['warn', { vars: 'all' }],
    // 'no-use-before-define': [2, { variables: false }],
    // 'no-shadow': [2, { 'builtinGlobals': false, 'hoist': 'functions', 'allow': [] }],

    // react native
    'react-native/no-unused-styles': 2,
    'react-native/no-inline-styles': 2,
    'react-native/no-color-literals': 2,

    // import
    'import/order': [
      2,
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        'newlines-between': 'always-and-inside-groups',
      },
    ],
    'react/no-unstable-nested-components': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'off',
  },
};
