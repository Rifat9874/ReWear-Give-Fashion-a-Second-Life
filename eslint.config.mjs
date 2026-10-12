import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextCoreWebVitals,
  {
    rules: {
      // Sellers paste image links from any HTTPS site, so we use a plain <img>
      // (wrapped in our SafeImage component) instead of next/image, which
      // needs every image host to be listed in advance.
      '@next/next/no-img-element': 'off',
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'docs/**'] },
];

export default config;
