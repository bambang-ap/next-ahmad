const withImages = require('next-images');

const redirects = {
	experimental: {
		appDir: false
	},
	async redirects() {
		return [
			{
				source: '/app',
				destination: '/app',
				permanent: true
			}
		];
	}
};

module.exports = withImages(redirects);
