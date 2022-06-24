const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const config = [
    {
        name: "server",
        mode: "production",
        entry: [
            './app/server.ts'
        ],
        target: 'node',
        output: {
            path: path.resolve(__dirname, '../build'),
            filename: '[name].js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        externals: [nodeExternals()],
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        'ts-loader',
                    ]
                }
            ]
        },
    },
    {
        name: "client",
        mode: "production",
        optimization: {
            minimizer: [
                new TerserJSPlugin({}),
                new OptimizeCSSAssetsPlugin({})
            ]
        },
        entry: [
            './client/main.ts',
            './app/assets/scss/application.scss'
        ],
        target: 'web',
        output: {
            path: path.resolve(__dirname, '../build'),
            filename: 'all.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        },
                        {
                            loader: 'ts-loader'
                        }
                    ]
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCSSExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                }
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                {from: path.resolve('node_modules/govuk-frontend/govuk/assets/'), to: 'assets'},
                {from: path.resolve('app/assets/images/'), to: 'assets/images'}
            ]),
            new MiniCSSExtractPlugin({
                filename: '[name].css'
            })
        ],
    }
];

console.debug('PROD CONFIG MERGED')
console.debug(JSON.stringify(config))

module.exports = config;




