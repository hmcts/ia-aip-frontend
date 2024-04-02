const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');

// HACK: OpenSSL 3 does not support md4 any more, but webpack hardcodes it all over the place: https://github.com/webpack/webpack/issues/13572
 const crypto = require("crypto");
 const crypto_orig_createHash = crypto.createHash;
 crypto.createHash = algorithm => crypto_orig_createHash(algorithm == "md4" ? "sha256" : algorithm);

const serverConfig = {
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
};

const clientConfig = {
        entry: [
            './client/main.ts',
            './app/assets/scss/application.scss'
        ],
  watch: true,
        target: 'web',
        output: {
            path: path.resolve(__dirname, '../build'),
            publicPath: "/build/",
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
        loader: [
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
};

const commonConfig = {
    server: serverConfig,
    client: clientConfig
};

module.exports = commonConfig;
