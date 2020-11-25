const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

/** @return {webpack.Configuration} */
module.exports = () => {
  return {
    stats: 'errors-warnings',
    resolve: {extensions: ['.js', '.ts']},
    output: {
      library: 'AsepriteAtlas',
      libraryTarget: 'umd',
      // https://github.com/webpack/webpack/issues/6525
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js'
    },
    devtool: 'source-map',
    module: {
      rules: [
        {test: /\.ts$/, loader: 'ts-loader', options: {projectReferences: true}}
      ]
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['**/*', '!*.tsbuildinfo']
      })
    ]
  }
}
