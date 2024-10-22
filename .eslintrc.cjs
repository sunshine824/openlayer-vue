module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:vue/vue3-essential',
		'prettier',
		'plugin:prettier/recommended'
	],
	overrides: [
		{
			env: {
				node: true
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script'
			}
		}
	],
	parserOptions: {
		ecmaVersion: 'latest',
		parser: '@typescript-eslint/parser',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		}
	},
	plugins: ['vue', '@typescript-eslint', 'prettier'],
	rules: {
		'prettier/prettier': 'error',
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/no-explicit-any': 'off',
		'vue/multi-word-component-names': 'off'
	}
};
