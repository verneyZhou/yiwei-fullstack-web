// import { Component, PropsWithChildren } from 'react'
import "./app.scss";
import { View, Text, Button, Image } from "@tarojs/components";

import "@/utils/EncoderDecoderTogether.min.js"; // 解决真机调试报错：TextEncoder is not defined

// hooks: https://docs.taro.zone/docs/hooks
import Taro, {
  useLaunch,
  useDidShow,
  useLoad,
  useReady,
  useUnload,
  useError,
  usePageNotFound,
  useUnhandledRejection,
} from "@tarojs/taro";

// 根据环境变量判断是否引入Mock数据文件
console.log("====process.env.TARO_APP_ENV", process.env.TARO_APP_ENV);
if (process.env.TARO_APP_ENV === "mock") {
  require("../mock");
}

// // class写法
// class App extends Component<PropsWithChildren>  {
//   componentDidMount() {
//     console.log('====process.env.TARO_APP_API', process.env.TARO_APP_API, PROJECT_NAME)
//   }

//   componentDidShow() { }

//   componentDidHide() { }

//   // this.props.children 是将要会渲染的页面
//   render() {
//     return this.props.children
//   }
// }
// export default App

// hooks写法
export default function App({ children }) {
  // 等同于 App 入口的 onLaunch 生命周期钩子。
  useLaunch((res) => {
    console.log("Taro App launched.", res);
    console.log(
      "====process.env.TARO_APP_API",
      process.env.TARO_APP_API,
      PROJECT_NAME
    );
  });

  useDidShow((res: any) => {
    console.log("Taro App===useDidShow", res);
    Taro.setStorageSync("shareTicket", res?.shareTicket || "");
  });

  // 等同于页面的 onLoad 生命周期钩子。
  useLoad(() => {
    console.log("===Taro app onLoad");
  });

  // 等同于页面的 onReady 生命周期钩子。
  useReady(() => {
    console.log("=====Taro app useReady");
  });

  useUnload(() => {
    console.log("====Taro app onUnload");
  });

  // 等同于 App 入口的 onError 生命周期钩子。
  useError((error) => {
    console.log("=====Taro app useError", JSON.stringify(error));
  });

  // 等同于 App 入口的 onUnhandledRejection 生命周期钩子。
  useUnhandledRejection((res) => {
    console.log(
      "====Taro app useUnhandledRejection",
      JSON.stringify(res.reason),
      JSON.stringify(res.promise)
    );
  });

  // 等同于 App 入口的 onPageNotFound 生命周期钩子。
  usePageNotFound((res) => {
    console.log("====Taro page not found", JSON.stringify(res));
    // Taro.redirectTo({
    //   url: 'pages/...',
    // }) // 如果是 tabbar 页面，请使用 Taro.switchTab
    Taro.switchTab({
      url: "pages/welcome/index",
    });
  });

  return children;
}
