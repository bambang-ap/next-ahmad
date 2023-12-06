/**
 * @type {import('@types/tailwindcss/tailwind-config').TailwindConfig}
 */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	mode: 'jit',
	plugins: [
		function ({addVariant}) {
			addVariant('child', '& > *');
			addVariant('child-hover', '& > *:hover');
		},
	],
	content: [
		'./public/**/*.html',
		'./pages/app/**/*.{ts,tsx}',
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			fontFamily: {
				calibri: ['Calibri', 'sans-serif'],
				bachshrift: ['Bahnschrift'],
				'noto-sans': ['Noto Sans', 'Noto Sans_bold'],
				sans: ['Poppins', ...defaultTheme.fontFamily.sans],
			},
			outlineWidth: {
				5: '5px',
			},
		},
	},
};
