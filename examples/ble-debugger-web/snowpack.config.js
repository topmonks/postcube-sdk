// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import('snowpack').SnowpackUserConfig } */
module.exports = {
  workspaceRoot: '../..',
  mount: {
    src: '/',
  },
  plugins: [
    '@snowpack/plugin-postcss',
    '@snowpack/plugin-react-refresh',
  ],
  devOptions: {
    port: 8082,
    open: 'none',
  },
  exclude: [
    // '**/*.node.js',
  ],
  packageOptions: {
    external: [
      'crypto',
    ],
  },
  buildOptions: {
    baseUrl: '/',
    metaUrlPath: 'snowpack',
  },
};
