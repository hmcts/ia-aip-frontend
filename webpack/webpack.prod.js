const merge = require('webpack-merge');
const commonConfig = require('./webpack.common');

const serverConfig = {
  mode: "production"
};

const clientConfig = {
  mode: "production"
};

const devConfig = {
  server: serverConfig,
  client: clientConfig
}

module.exports = merge.multiple(commonConfig, devConfig)
