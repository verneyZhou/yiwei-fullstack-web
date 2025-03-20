

// 全局配置：https://taro-docs.jd.com/docs/app-config
export default defineAppConfig({
  pages: [
    'pages/welcome/index',
    'pages/homeV2/index',
    'pages/login/index',
    // "pages/my/index"
  ],
  subPackages: [
    {
      'root': 'packageMain',
      'pages': [
        'welcome/index',
        'home/index',
      ],
    },
    {
      'root': 'packageUser',
      'pages': [
        'login/index',
        'loginV2/index',
        'user/index',
        'more/index',
        'my/index',
        'chat/index'
      ],
    },
    {
      'root': 'packageGame',
      'pages': [
        'welcome/index',
        'tetris/index',
        'snake/index',
      ],
    },
  ],
  components: [
    'components/picker/index'
  ],
  // tabBar: {
  //   custom: false,
  //   color: '#525252',
  //   selectedColor: '#000000',
  //   backgroundColor: '#ffffff',
  //   list: [
  //     {
  //       pagePath: 'pages/home/index',
  //       selectedIconPath: 'assets/tabbar/tabbar_home_on.png',
  //       iconPath: 'assets/tabbar/tabbar_home.png',
  //       text: '首页',
  //     },
  //     {
  //       pagePath: 'pages/more/index',
  //       selectedIconPath: 'assets/tabbar/tabbar_cate_on.png',
  //       iconPath: 'assets/tabbar/tabbar_cate.png',
  //       text: 'More',
  //     },
  //     {
  //       pagePath: 'pages/my/index',
  //       selectedIconPath: 'assets/tabbar/tabbar_my_on.png',
  //       iconPath: 'assets/tabbar/tabbar_my.png',
  //       text: '我的',
  //     },
  //   ],
  // },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'TaroProject',
    navigationBarTextStyle: 'black',
  },
  requiredPrivateInfos: ['getLocation'], // 微信小程序必填，否则无法使用
  permission: { // 微信小程序必填，否则无法使用
    'scope.userLocation': {
      'desc': '你的位置信息将用于小程序位置接口的效果展示'
    }
  },
});
