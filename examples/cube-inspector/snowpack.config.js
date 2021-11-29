// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  workspaceRoot: '../..',
  mount: {
    src: "/",
  },
  plugins: [
    "@snowpack/plugin-typescript",
    '@snowpack/plugin-postcss',
    "@snowpack/plugin-react-refresh",
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    port: 8082,
  },
  buildOptions: {
    baseUrl: "/examples/cubes-react",
    metaUrlPath: "snowpack",
  },
};
