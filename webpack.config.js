const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');
const { NODE_ENV = 'production' } = process.env;

const serverConfig = {
  entry: [
    './app/app.ts',
    './app/assets/scss/application.scss'
  ],
  mode: NODE_ENV,
  target: 'node',
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: ['yarn run:dev']
    }),
    new CopyWebpackPlugin([
      { from: path.resolve('node_modules/govuk-frontend/govuk/assets/'), to: 'assets' },
    ]),
    new MiniCSSExtractPlugin({
      filename: 'assets/css/[name].css'
    })
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: [ nodeExternals() ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader',
        ]
      },
      { 
        test: /\.(sa|sc|c)ss$/, 
        loader: [
          MiniCSSExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  },
};

const clientConfig = {
  entry: './client/main.ts',
  mode: NODE_ENV,
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'build/assets/js/'),
    filename: 'all.js'
  }
};

module.exports = [ serverConfig, clientConfig ];
