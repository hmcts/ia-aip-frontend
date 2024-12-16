const { merge } = require('webpack-merge');
const { serverConfig, clientConfig } = require('./webpack.common.js');

const devServerConfig = merge(serverConfig, {
    mode: "development",
    devtool: 'inline-source-map',
});

const devClientConfig = merge(clientConfig, {
    mode: "development",
    devtool: 'inline-source-map',
});

module.exports = [devServerConfig, devClientConfig];
