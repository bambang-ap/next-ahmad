/**
 * @type {import('@types/tailwindcss/tailwind-config').TailwindConfig}
 */

module.exports = {
	content: [
		'./node_modules/flowbite/**/*.js',
		'./node_modules/flowbite-react/**/*.js',
		'./public/**/*.html',
		'./app/**/*.{ts,tsx}',
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	plugins: [require('flowbite/plugin')],
	theme: {
		extend: {
			fontFamily: {
				'noto-sans': ['Noto Sans', 'Noto Sans_bold'],
			},
		},
	},
};
