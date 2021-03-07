const { name } = require('../package.json')

module.exports = {
  publicPath: '/subapp/sub-vue',
  //由于common是不经过babel和pollfy的，所以引用者需要在webpack打包时显性指定该模块需要编译
  transpileDependencies: ['common'],
  chainWebpack: config => config.resolve.symlinks(false),
  configureWebpack: {
    output: {
      // 把子应用打包成 umd 库格式
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`
    }
  },
  devServer: {
    port: process.env.VUE_APP_PORT,//与父应用配置一致
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
