const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');
const { NODE_ENV = 'production' } = process.env;

const serverConfig = {
  entry: [
    './app/app.ts',
    './app/assets/scss/application.scss'
  ],
  target: 'node',
  plugins: [
    new CopyWebpackPlugin([
      { from: path.resolve('node_modules/govuk-frontend/govuk/assets/'), to: 'assets' },
      { from: path.resolve('views'), to: 'views' },
    ]),
    new MiniCSSExtractPlugin({
      filename: 'assets/css/[name].css'
    })
  ],
  output: {
    path: path.resolve('build'),
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
  target: 'web',
  output: {
    path: path.resolve('build/assets/js/'),
    filename: 'all.js',
    publicPath: '/assets/js'
  }
};

const commonConfig = {
    server: serverConfig,
    client: clientConfig
}

module.exports = commonConfig;
