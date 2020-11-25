const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

/** @return {webpack.Configuration} */
module.exports = () => {
  return {
    stats: 'errors-warnings',
    resolve: {extensions: ['.js', '.ts']},
    output: {path: path.resolve(__dirname, 'dist'), filename: 'index.js'},
    devtool: 'source-map',
    module: {
      rules: [
        {test: /\.ts$/, loader: 'ts-loader', options: {projectReferences: true}}
      ]
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['**/*', '!*.tsbuildinfo'],
        cleanStaleWebpackAssets: false // Don't delete files under ../lib/dist.
      }),
      new CopyPlugin({patterns: [{context: 'src', from: '*.{html,json,png}'}]})
    ],
    devServer: {
      publicPath: '/', // https://github.com/webpack/webpack-dev-server/issues/2745
      clientLogLevel: 'warning',
      overlay: {warnings: true, errors: true},
      stats: 'errors-warnings'
    }
  }
}
