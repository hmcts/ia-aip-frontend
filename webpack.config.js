const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');
const { NODE_ENV = 'production' } = process.env;

module.exports = {
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
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: 'node_modules/govuk-frontend/govuk/all.js', to: 'public' }
    ]),
    new MiniCSSExtractPlugin({
      filename: 'public/[name].css'
    })
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js'
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
