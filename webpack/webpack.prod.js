const { merge } = require('webpack-merge');
//const merge = require('webpack-merge');
const TerserJSPlugin = require('terser-webpack-plugin');
//const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const commonConfigMerged = require('./webpack.common');

const serverConfig = {
  mode: "production"
};

const clientConfig = {
        mode: "production",
        optimization: {
            minimize: true,
            minimizer: [
                new TerserJSPlugin({}),
                new CssMinimizerPlugin({})
            ]
    }
};

const devConfig = {
  server: serverConfig,
  client: clientConfig
};
const devConfigMerged = merge(devConfig.server, devConfig.client)

module.exports = merge(commonConfigMerged, devConfigMerged);
