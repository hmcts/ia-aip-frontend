const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const path = require('path');

// HACK: OpenSSL 3 does not support md4 any more, but webpack hardcodes it all over the place: https://github.com/webpack/webpack/issues/13572
const crypto = require("crypto");
const crypto_orig_createHash = crypto.createHash;
//crypto.createHash = algorithm => crypto_orig_createHash(algorithm == "md4" ? "sha256" : algorithm);
crypto.createHash = algorithm => {
    return crypto_orig_createHash.call(crypto, algorithm === 'md4' ? 'sha256' : algorithm);
};

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
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true
                            }
                        }
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
            filename: 'all.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            fallback: {
                "https": require.resolve("https-browserify"),
                "crypto": require.resolve("crypto-browserify"),
                "http": require.resolve("stream-http"),
                "url": require.resolve("url/")

            }
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
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [MiniCssExtractPlugin.loader, "css-loader", 'sass-loader'],
                }
            ]
        },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve('node_modules/govuk-frontend/govuk/assets/'),
                    to: 'assets'
                },
                {
                    from: path.resolve('app/assets/images/'),
                    to: 'assets/images'
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css' // Optional: For chunked CSS files
        })
    ]
};

const commonConfig = {
    server: serverConfig,
    client: clientConfig
};

const commonConfigMerged = merge(commonConfig.server, commonConfig.client)

module.exports = commonConfigMerged;

