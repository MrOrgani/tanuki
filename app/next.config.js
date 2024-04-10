module.exports = {
  distDir: 'build',
  images: {
    domains: ['storage.googleapis.com'],
  },
  i18n: {
    locales: ['fr'],
    defaultLocale: 'fr',
  },
  webpack: config => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};
