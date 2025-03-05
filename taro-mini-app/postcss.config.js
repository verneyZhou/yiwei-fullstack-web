// const process = require("process");

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // tailwindcss 里面工具类的长度单位，默认都是 rem, 在 h5 环境下自适应良好。但小程序里面，我们大部分情况都是使用 rpx 这个单位来进行自适应，所以就需要把默认的 rem 单位转化成 rpx。
    "postcss-rem-to-responsive-pixel": {
      // H5环境下1rem = 16px，小程序环境下1rem = 32rpx
      rootValue: process.env.TARO_ENV === "h5" ? 16 : 32,
      // 默认所有属性都转化
      propList: ["*"],
      // 转化的单位,可以变成 px / rpx
      transformUnit: "rpx",
    },
  },
};
