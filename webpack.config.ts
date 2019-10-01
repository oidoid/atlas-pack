import {CleanWebpackPlugin} from 'clean-webpack-plugin'
import * as webpack from 'webpack'

export default (): webpack.Configuration => {
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
