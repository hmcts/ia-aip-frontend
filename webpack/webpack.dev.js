const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.common');

const serverConfig = {
  mode: "development",
  devServer: {
    contentBase: 'build',
    overlay: true
  },
  plugins: []
};

const clientConfig = {
  mode: "development",
  plugins: []
};

const devConfig = {
  server: serverConfig,
  client: clientConfig
}

module.exports = merge.multiple(commonConfig, devConfig)