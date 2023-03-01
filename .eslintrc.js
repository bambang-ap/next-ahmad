const {
	compilerOptions: {paths},
} = require('./tsconfig.json');

const aliasesImportGroups = Object.keys(paths).reduce((ret, pathKey) => {
	const regexEndStar = new RegExp(/\/\*$/);
	const key = pathKey.replace(regexEndStar, '');
	const val = `/^${key}/`;
	if (!ret.includes(val)) ret.push(val);
	return ret;
}, []);

module.exports = {
	root: true,
	env: {
		es6: true,
	},
	extends: ['next/core-web-vitals', 'prettier'],
	parser: '@typescript-eslint/parser',
	plugins: [
		'eslint-plugin-import-helpers',
		'@typescript-eslint',
		'testing-library',
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			rules: {
				'prettier/prettier': 0,
				'max-len': [1, {code: 100}],
				'no-return-await': 1,
				'implicit-arrow-linebreak': 0,
				'@next/next/no-img-element': 0,
				'jsx-a11y/alt-text': 0,
				// 'no-tabs': ['error', {allowIndentationTabs: true}],
				// indent: ['error', 'tab'],
				'no-shadow': 0,
				'@typescript-eslint/no-shadow': [1],
				'no-undef': 'off',
				radix: 0,
				'func-names': 0,
				'class-methods-use-this': 0,
				'@typescript-eslint/naming-convention': [
					0,
					{
						selector: 'default',
						format: ['camelCase', 'UPPER_CASE', 'PascalCase', 'snake_case'],
						leadingUnderscore: 'allow',
					},
				],

				'import/no-extraneous-dependencies': 0,
				'import/prefer-default-export': 0,
				'import/no-named-as-default': 0,
				'import/no-named-as-default-member': 0,
				'react/require-default-props': 0,
				'react/jsx-curly-newline': 0,
				'object-curly-spacing': 0,
				'@typescript-eslint/no-use-before-define': 0,
				'react/jsx-props-no-spreading': [
					0,
					{
						html: 'enforce',
						custom: 'enforce',
						explicitSpread: 'enforce',
						exceptions: ['Image', 'img'],
					},
				],
				'react-hooks/rules-of-hooks': 'error',
				'react/jsx-wrap-multilines': [
					2,
					{
						declaration: 'parens-new-line',
						assignment: 'parens-new-line',
						return: 'parens-new-line',
						arrow: 'ignore',
						condition: 'ignore',
						logical: 'ignore',
						prop: 'ignore',
					},
				],
				'react/destructuring-assignment': 0,
				'react/jsx-filename-extension': 0,

				'react/jsx-boolean-value': 0,
				'react/jsx-closing-tag-location': 0,
				'react/jsx-closing-bracket-location': [
					2,
					{
						selfClosing: 'tag-aligned',
						nonEmpty: 'after-props',
					},
				],
				'react/button-has-type': 0,
				'react/prop-types': 0,
				'react/jsx-tag-spacing': [
					2,
					{
						beforeSelfClosing: 'always',
					},
				],

				'@typescript-eslint/no-explicit-any': 1,
				'@typescript-eslint/no-unused-vars': 1,
				'no-unused-vars': 0,

				'operator-linebreak': 0,

				'react-hooks/exhaustive-deps': 1,
				'consistent-return': 1,
				'default-case': 0,
				'no-underscore-dangle': 0,
				'no-useless-rename': 2,
				'object-shorthand': 2,
				'no-nested-ternary': 0,
				'no-unreachable': 1,
				'no-console': [1, {allow: ['info']}],
				'import-helpers/order-imports': [
					2,
					{
						newlinesBetween: 'always',
						groups: [
							['/^react$/'],
							['/^react/', 'module', 'absolute'],
							aliasesImportGroups,
							['parent', 'index', 'sibling'],
						],
						alphabetize: {order: 'asc', ignoreCase: false},
					},
				],
			},
		},
	],

	settings: {
		react: {
			createClass: 'createReactClass', // Regex for Component Factory to use,
			// default to "createReactClass"
			pragma: 'React', // Pragma to use, default to "React"
			version: 'detect', // React version. "detect" automatically picks the version you have installed.
			// You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
			// default to latest and warns if missing
			// It will default to "detect" in the future
			// "flowVersion": "0.53" // Flow version
		},
		propWrapperFunctions: [
			// The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
			'forbidExtraProps',
			{
				property: 'freeze',
				object: 'Object',
			},
			{
				property: 'myFavoriteWrapper',
			},
		],
		linkComponents: [
			// Components used as alternatives to <a> for linking, eg. <Link to={ url } />
			'Hyperlink',
			{
				name: 'Link',
				linkAttribute: 'to',
			},
		],
	},
};
