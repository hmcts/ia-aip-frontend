const merge = require('webpack-merge');
const Configuration = require('webpack');
const commonConfig = require('./webpack.common');

const serverConfig = {
  mode: "development",
  devtool: 'inline-source-map',
};

const clientConfig = {
  mode: "development",
  devtool: 'inline-source-map',
};

const devConfig = {
  server: serverConfig,
  client: clientConfig
};

console.debug('DEV')
console.debug(JSON.stringify(devConfig))
console.debug('COMMON')
console.debug(JSON.stringify(commonConfig))

const config = merge<Configuration>(commonConfig, devConfig);

module.exports = config