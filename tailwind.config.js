const colors = require('./tailwind/colors')

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    './src/**/*.{js,jsx,ts,tsx}'
  ],
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
  corePlugins: {
    placeholderColor: true,
  },
  plugins: [],
}