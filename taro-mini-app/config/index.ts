import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'

const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const path = require('path')

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  console.log('======defineConfig', command, mode, process.env.NODE_ENV, process.env.TARO_ENV, process.env.TARO_APP_ENV);
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'taro-mini-app',
    date: '2024-12-5',
    // designWidth: 750,
    designWidth(input: any) {
      let file = input?.file?.replace(/\+/g, '/');
      if (file?.indexOf('@antmjs/vantui') > -1) {
        return 750
      }
      return 375
    },
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot:`dist/${process.env.TARO_ENV}`,
    plugins: [
      '@taro-hooks/plugin-react',
      "@tarojs/plugin-http",
      [
        "@tarojs/plugin-html", // https://docs.taro.zone/docs/use-h5
        {pxtransformBlackList: [/demo-/, /^body/, /^van-/]} //  包含 `demo-` 的类名选择器中的 px 单位不会被解析
      ],
    ],
    alias: { // 路径别名配置
      '@': path.resolve(__dirname, '..', 'src'),
    },
    defineConstants: {
      PROJECT_NAME: '"TARO_MINI_APP"',
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: {
      type: "webpack5",
      prebundle: {
        enable: false, // 解决本地开发提示：WARNING in external "taro_app_library@/remoteEntry.js
      },
    },
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    sass: {
      resource: ['src/styles/variables.scss', 'src/styles/global.scss'],
      projectDirectory: path.resolve(__dirname, '..'),
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            selectorBlackList: ['rich-text', /^.rich-text/],
            propList: ['*']
          }
        },
        url: {
          enable: true,
          config: {
            maxSize: 4, // 设定转换尺寸上限（单位 kbytes）
          },
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true
      },
      webpackChain(chain) {
        chain.merge({
          plugin: {
            install: {
              plugin: UnifiedWebpackPluginV5,
              args: [
                {
                  appType: 'taro',
                  // disabled: WeappTailwindcssDisabled,
                  rem2rpx: true, // 是用来开启 CSS rem -> rpx 单位的转化的，可以不传值来关闭这个转化行为。1rem 转化为 32rpx。可通过传入配置进行修改
                },
              ],
            },
          },
        })
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      devServer: {
        port: 10087,
        https: false,
        proxy: [
          {
            context: ['/douban'],
            target: 'http://movie.douban.com',
            changeOrigin: true,
            pathRewrite: { '^/douban': '' }
          },
          {
            context: ['/api'],
            target: 'http://localhost:9527',
            changeOrigin: true,
          },
        ],
      },
      router: {
        mode: process.env.TARO_ENV === 'harmony-hybrid' ? 'hash' : 'browser', // 路由模式，支持 hash、browser
      },
      esnextModules: ['@antmjs/vantui'], // 由于引用 `node_modules` 的模块，默认不会编译，所以需要额外给 H5 配置 `esnextModules`
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        pxtransform: {
          enable: true,
          config: {
            baseFontSize: 32, // 修改为32，与小程序端保持一致 // https://docs.taro.zone/docs/size
            selectorBlackList: ['rich-text', /^.rich-text/],
            propList: ['*']
          },
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
