const path = require("path");
const webpack = require("webpack");

const commonConfig = {
  context: path.resolve(__dirname, "./"),
  entry: {
    index: "./src/index",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

const browserConfig = {
  ...commonConfig,
  target: "web",
  output: {
    filename: "index.browser.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    globalObject: "this",
    library: "hyperchain",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      http: false,
      stream: false,
      os: false,
      https: false,
      zlib: false,
      fs: false,
      path: false,
      crypto: false,
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};

const nodeConfig = {
  ...commonConfig,
  target: "node",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    globalObject: "this",
    library: "hyperchain",
  },
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
    ignored: /node_modules/,
  },
};

module.exports = [browserConfig, nodeConfig];

// {
//   context: path.resolve(__dirname, "./"),
//   entry: {
//     index: "./src/index",
//   },
//   output: {
//     filename: "index.js",
//     path: path.resolve(__dirname, "dist"),
//     libraryTarget: "umd",
//     globalObject: "this",
//     library: "hyperchain",
//     clean: true,
//   },
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         use: ["ts-loader"],
//         exclude: /node_modules/,
//       },
//     ],
//   },
//   resolve: {
//     extensions: [".tsx", ".ts", ".js"],
//   },
//   externals: {
//     "http": "http",
//   },
//   watchOptions: {
//     aggregateTimeout: 200,
//     poll: 1000,
//     ignored: /node_modules/,
//   },
// };
