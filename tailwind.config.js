/**
 * @type {import('@types/tailwindcss/tailwind-config').TailwindConfig}
 */

module.exports = {
	mode: "jit",
	content: [
		"./public/**/*.html",
		"./pages/app/**/*.{ts,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				"noto-sans": ["Noto Sans", "Noto Sans_bold"],
			},
			outlineWidth: {
				5: "5px",
			},
		},
	},
};
