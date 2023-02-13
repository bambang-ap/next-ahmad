/**
 * @type {import('@types/tailwindcss/tailwind-config').TailwindConfig}
 */

const colors = require('./tailwind/colors');

module.exports = {
	content: [
		'./node_modules/flowbite/**/*.js',
		'./node_modules/flowbite-react/**/*.js',
		'./public/**/*.html',
		'./app/**/*.{ts,tsx}',
	],
	plugins: [require('flowbite/plugin')],
	theme: {
		extend: {
			colors,
			fontFamily: {
				'noto-sans': ['Noto Sans', 'Noto Sans_bold'],
			},
			fontSize: {
				'app-body': 13,
				'app-header': 28,
			},
		},
	},
};
