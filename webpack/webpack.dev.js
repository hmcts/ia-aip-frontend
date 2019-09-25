const merge = require('webpack-merge');
const commonConfig = require('./webpack.common');

console.log('commonConfig', JSON.stringify(commonConfig));

const devConfig = {}

const merged = merge.multiple(commonConfig, devConfig);

console.log('merged', JSON.stringify(merged));

module.exports = merge.multiple(commonConfig, devConfig)