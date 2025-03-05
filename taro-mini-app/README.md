# taro-mini-app

- [小程序管理平台](https://mp.weixin.qq.com/wxamp/home/guide?lang=zh_CN&token=310304702)
- [微信开发者平台](https://developers.weixin.qq.com/console)

## 开发流程

> node v20+

## TODO

- eslint 代码规范，代码格式化
- mock 接口
- 模块搭建
- 瀑布流、虚拟滚动 https://docs.taro.zone/docs/virtual-list
- toast、dialog 封装
- 登录、注册、获取用户信息
- 工具：投票、文件转换、图片压缩、裁剪、二维码生成
- git hooks、自动化部署

## UI 组件库

- @antmjs/vantui
  > https://antmjs.github.io/vantui/main/#/home

## 接口

### home

-

### 用户模块

- 登录/注册/获取用户信息/验证码

## 备注

- taro 里面普通的`div`绑定`addEventListener`事件无效，需要用`ScrollView`组件进行绑定

- 使用 tailwindcss 的样式有时不生效，微信开发者工具`styles`里有，但预览没效果，暂时无解~

- taro 中使用 scrollIntoView 无效，换成`ScrollView`组件的`scrollIntoView`

- 小程序本地调接口：
  1. 添加安全域名：[参考](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
  - https 域名如果证书过期了，需要`重新购买证书 =》下载证书 =》登录服务器 =》替换服务器原证书 =》重启nginx =》替换node服务的证书 =》重启node服务`
  2. 配置 whistle 代理：
  - whistle 开启，配置：`127.0.0.1:9527 www.verneyzhou-code.cn`
  - 开发者工具 =》设置 =》代理设置 =》手动设置代理 =》输入`127.0.0.1:8899`
  - `开发者工具 =》详情 =》本地设置 =》勾选不校验TLS版本`
  3. 重新编译

### mock

- mockjs：[mock](https://github.com/NervJS/taro-plugin-mock)、[Mock.js 超全 超详细总结 保姆级别的教程](https://blog.csdn.net/Mme061300/article/details/130343270)

### 登录流程

[小程序登录](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)

- button:`open-type`，微信开发能力，https://developers.weixin.qq.com/miniprogram/dev/component/button.html

  - `getUserInfo`: 获取用户信息，可以从 bindgetuserinfo 回调中获取到用户匿名数据：`encryptedData、iv、signature、userInfo（不包含昵称头像）`

  - `getPhoneNumber`: getPhoneNumber 手机号快速验证，向用户申请，并在用户同意后，快速填写和验证手机；但**需完成企业认证才能用**

- `wx.getUserProfile(Object object)`: 若开发者需要获取用户的个人信息（头像、昵称、性别与地区），可以通过`wx.getUserProfile`接口进行获取，该接口从基础库`2.10.4`版本开始支持，该接口只返回用户个人信息，不包含用户身份标识符; **开发者每次通过该接口获取用户个人信息均需用户确认**。https://developers.weixin.qq.com/miniprogram/dev/api/open-api/user-info/wx.getUserProfile.html

  - [小程序登录、用户信息相关接口调整说明官方说明](https://developers.weixin.qq.com/community/develop/doc/000cacfa20ce88df04cb468bc52801)

  - 2021 年 4 月 28 日 24 时后发布的新版本小程序，开发者调用`wx.getUserInfo`或`<button open-type="getUserInfo"/>`将不再弹出弹窗，直接返回匿名的用户个人信息（不会返回用户昵称头像）

  - 自 2022 年 10 月 25 日 24 时起，小程序 `wx.getUserProfile` 接口将被收回：生效期后发布的小程序新版本，通过 wx.getUserProfile 接口获取用户头像将统一返回默认灰色头像，昵称将统一返回 “微信用户”。https://developers.weixin.qq.com/community/develop/doc/00022c683e8a80b29bed2142b56c01

  - `chooseAvatar`: https://developers.weixin.qq.com/community/develop/doc/00022c683e8a80b29bed2142b56c01

### 名词解释

服务端调用 `auth.code2Session` 接口会返回：

- `openid`: 服务端调用 `auth.code2Session` 接口，换取 用户唯一标识 `OpenID`
- `unionId`: 用户在微信开放平台账号下的唯一标识 UnionID, `想获取unionId需要在微信开放平台进行绑定`~ https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/union-id.html
- `session_key`: 标识当前用户在微信上使用你的小程序的 session 信息；

- `access_token`: 小程序全局唯一后台接口调用凭据，后端调用绝大多数后台接口时都需使用。开发者可以通过 `getAccessToken` 接口获取并进行妥善保存。；https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/backend-api.html#access_token

两种登录方式：

### openid 登录

- 静默登录：`wx.login（前端） + jscode2session（后端）`获取`openid、session_key、unionid`
- 后端：`jwt + openid`生成 token 返回给前端，以 openid 为 key，新增用户；
- 前端：本地缓存`token`，以后需要鉴权的接口请求带上 token 信息；
- 前端：调微信提供的`头像昵称填写能力`获取头像昵称（需要弹窗授权），更新用户信息；

### 手机号快捷登录（需企业认证）

- 通过过 button 按钮的`bindgetphonenumber`事件，弹出手机号授权，获取到加密数据后，向后端换取 token

## 参考

- [讨论微信小程序的 session_key 和 access_token 的作用](https://juejin.cn/post/7409704996550459426)
- [微信小程序登录流程（详细+图解）](https://juejin.cn/post/7212074532340908091)
- [彻底搞懂小程序登录流程-附小程序和服务端代码](https://github.com/75team/w3c/blob/master/articles/20181001_chunpu_%E5%BD%BB%E5%BA%95%E6%90%9E%E6%87%82%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%99%BB%E5%BD%95%E6%B5%81%E7%A8%8B-%E9%99%84%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%92%8C%E6%9C%8D%E5%8A%A1%E7%AB%AF%E4%BB%A3%E7%A0%81.md)
- [详解小程序常见的登录方式](https://blog.csdn.net/qq_16593939/article/details/134807040)
- [微信小程序授权登录三种实现方式](https://blog.csdn.net/weixin_45559449/article/details/129398318)

- [在 Taro 项目上配置 ESLint 和 Git Hooks](https://juejin.cn/post/7095266488361156638)

## 报错记录

- npm run dev:h5 报错：`Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.`

  > https://blog.csdn.net/weixin_68340504/article/details/144019029

- 小程序真机调试报错：

```
Error during evaluating file "pages/home/index.js":
ReferenceError: TextEncoder is not defined
```

> TextDecoder 是浏览器自带的 API，在微信开发者工具中可以使用，在真机小程序环境没有这个方法，所以会报错的。

下载`https://github.com/anonyco/FastestSmallestTextEncoderDecoder/blob/master/EncoderDecoderTogether.min.js`放到目录里，在`app.jsx`文件直接引入；[参考](https://developers.weixin.qq.com/community/develop/doc/000ca85023ce78c8484e0d1d256400)

- 小程序开发报错：

```sh
Error: Minified React error #321; visit https://reactjs.org/docs/error-decoder.html?invariant=321 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
    at Object.N (._node_modules_react-reconciler_cjs_react-reconciler.production.min.js:80)

react-dom.development.js:15408 Uncaught Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
```

> 把 `useLocation`这些 hooks 放在函数组件顶部，不要放在条件语句类

- 提示：`[taro warn] 元素 img 的 src 属性值数据量过大，可能会影响渲染性能。考虑降低图片转为 base64 的阈值或在 CSS 中使用 base64。`

- 小程序开发报错：`TypeError: (0 , _packageMain_home_index__WEBPACK_IMPORTED_MODULE_5__.useHomePageContext) is not a function`

- `TypeError: Cannot read property '__wxWebviewId__' of undefined`

  > ` Taro.createSelectorQuery().in(this)`报错

- 报错：`找不到模块“@/types/common”或其相应的类型声明。ts(2307)`, 参考：https://blog.csdn.net/weixin_43801036/article/details/142524266

  > `tsconfig.json`中配置：

  ```json
  "paths": {
        "@/*": [
            "src/*"
        ]
    },
  ```

- 报错: `TypeError: Cannot read property 'length' of undefined at clearContainer (.._src_reconciler.ts:179)`

  > toast 组件初始化需要在页面初始化完成后调用

- 引入@tarojs/plugin-mock 报错：`TypeError: helper.createBabelRegister is not a function`

- 微信开发者工具接口请求报错：`响应异常:>>  TypeError: Cannot read property 'match' of undefined`

  > 本地调接口，需要配置代理~

- `Error: MiniProgramError {"errMsg":"request:fail 小程序要求的 TLS 版本必须大于等于 1.2"}`
  > [阿里云服务器如何更新 tls1.2](https://worktile.com/kb/ask/1289308.html)
