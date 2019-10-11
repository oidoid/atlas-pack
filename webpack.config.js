const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const webpack = require('webpack')

/** @return {webpack.Configuration} */
module.exports = () => {
  return {
    stats: 'errors-warnings',
    resolve: {extensions: ['.js', '.ts']},
    output: {
      libraryTarget: 'umd',
      // https://github.com/webpack/webpack/issues/6525
      globalObject: 'this'
    },
    module: {rules: [{test: /\.ts$/, use: 'ts-loader'}]},
    plugins: [new CleanWebpackPlugin()]
  }
}
