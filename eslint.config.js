import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import mochaPlugin from 'eslint-plugin-mocha'
import gitignore from 'eslint-config-flat-gitignore'
import js from '@eslint/js'
import globals from 'globals'

mochaPlugin.configs.recommended.files = ['test/**']
mochaPlugin.configs.recommended.rules['mocha/no-mocha-arrows'] = 'off'
Object.assign(
  mochaPlugin.configs.recommended.languageOptions.globals,
  globals.nodeBuiltin,
)

export default [
  gitignore(),
  js.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  mochaPlugin.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
          arrowParens: 'avoid',
        },
      ],
    },
  },
]
