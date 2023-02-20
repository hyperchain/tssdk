const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index",
  target: "web",
  output: {
    // filename: "[name].web.js",
    filename: "index.js",
    path: path.resolve(__dirname, "dist/"),
    library: "hyperchain",
    libraryTarget: "umd",
  },
  module: {
    unknownContextCritical: false,
    // exprContextCritical: false,
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          // {
          //   loader: "babel-loader",
          //   options: {
          //     presets: ["@babel/preset-env"],
          //   },
          // },
          "ts-loader",
        ],
        // exclude: /node_modules/,
      },
    ],
  },
  // Attempt to resolve these extensions *in order*.(If multiple files share the same name but have different extensions, webpack will resolve the one with the extension listed first in the array and skip the rest.)
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    // Redirect module requests when normal resolving fails.
    fallback: {
      stream: require.resolve("stream-browserify"),
      // http: false,
      // assert: require.resolve('assert'),
      // buffer: require.resolve('buffer'),
      // console: require.resolve('console-browserify'),
      // constants: require.resolve('constants-browserify'),
      // crypto: require.resolve('crypto-browserify'),
      // domain: require.resolve('domain-browser'),
      // events: require.resolve('events'),
      // http: require.resolve('stream-http'),
      // https: require.resolve('https-browserify'),
      // os: require.resolve('os-browserify/browser'),
      // path: require.resolve('path-browserify'),
      // punycode: require.resolve('punycode'),
      // querystring: require.resolve('querystring-es3'),
      // stream: require.resolve('stream-browserify'),
      // string_decoder: require.resolve('string_decoder'),
      // sys: require.resolve('util'),
      // timers: require.resolve('timers-browserify'),
      // tty: require.resolve('tty-browserify'),
      // url: require.resolve('url'),
      // util: require.resolve('util'),
      // vm: require.resolve('vm-browserify'),
      // zlib: require.resolve('browserify-zlib'),
      // fs: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    // new webpack.ProvidePlugin({
    //   Buffer: ["buffer", "Buffer"],
    // }),
    // new webpack.ProvidePlugin({
    //   process: "process/browser",
    // }),
  ],
  devServer: {
    headers: { "Access-Control-Allow-Origin": "*" },
    compress: true,
    port: 9000,
    historyApiFallback: true,
    hot: true,
  },
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  // },
};
