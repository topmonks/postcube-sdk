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
    "@snowpack/plugin-react-refresh",
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    baseUrl: "/examples/cubes-react",
    metaUrlPath: "snowpack",
  },
};
