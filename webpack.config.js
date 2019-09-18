const nodeExternals = require('webpack-node-externals');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const path = require('path');
const { NODE_ENV = 'production' } = process.env;

module.exports = {
  entry: './app/app.ts',
  mode: NODE_ENV,
  target: 'node',
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: ['yarn run:dev']
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: 'node_modules/govuk-frontend/govuk/all.js', to: 'public' },
      { from: 'node_modules/govuk-frontend/govuk/all.css', to: 'public' }
    ])
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
      }
    ]
  },
};
