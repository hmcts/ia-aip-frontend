const { merge } = require('webpack-merge');
const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { serverConfig, clientConfig } = require('./webpack.common.js');

const prodServerConfig = merge(serverConfig, {
    mode: "production",
});

const prodClientConfig = merge(clientConfig, {
    mode: "production",
    optimization: {
        minimize: true,
        minimizer: [new TerserJSPlugin(), new CssMinimizerPlugin()],
    }
});

module.exports = [prodServerConfig, prodClientConfig];
