const { merge } = require('webpack-merge');
const commonConfigMerged = require('./webpack.common');

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

const mergedDevConfig = merge(devConfig.server, devConfig.client)
module.exports = [commonConfigMerged, mergedDevConfig];
