const merge = require('webpack-merge');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const commonConfig = require('./webpack.common');

const serverConfig = {
  mode: "production"
};

const clientConfig = {
  mode: "production",
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
};

const devConfig = {
  server: serverConfig,
  client: clientConfig
}

module.exports = merge.multiple(commonConfig, devConfig)
