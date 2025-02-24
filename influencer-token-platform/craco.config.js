// craco.config.js
const webpack = require('webpack');

module.exports = {
  babel: {
    // Add Babel plugins to support class properties and private methods
    plugins: [
      ["@babel/plugin-proposal-class-properties", { "loose": false }],
      ["@babel/plugin-proposal-private-methods", { "loose": false }],
      ["@babel/plugin-proposal-private-property-in-object", { "loose": false }]
    ]
  },
  webpack: {
    configure: (webpackConfig) => {
      // Alias any "react-router/dom" imports to "react-router-dom"
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "react-router/dom": require.resolve("react-router-dom")
      };

      // Provide a fallback for Node’s "process" global (Webpack 5 no longer polyfills this)
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: require.resolve("process/browser")
      };

      // Automatically provide "process" globally in your modules
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser"
        })
      );

      // Ensure that .mjs files in the ethers library are handled correctly
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules\/ethers/,
        type: "javascript/auto"
      });

      return webpackConfig;
    }
  }
};
