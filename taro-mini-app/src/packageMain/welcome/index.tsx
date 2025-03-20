import React, { useCallback } from "react";
import { View, Text, Button, Image } from "@tarojs/components";
import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";
import Taro, {
  useDidShow,
  useDidHide,
  useLoad,
  useUnload,
  useReady,
} from "@tarojs/taro";

import "./index.scss";

const Welcome = () => {
  const toHome = () => {
    Taro.navigateTo({
      url: "/packageMain/home/index",
    });
  };

  const toAIChat = () => {
    Taro.navigateTo({
      url: "/packageUser/chat/index",
    });
  };

  const toGame = () => {
    Taro.navigateTo({
      url: "/packageGame/tetris/index",
      // url: "/packageGame/snake/index",
    });
  };

  return (
    <View className="welcome-page-wrapper flex flex-col items-center">
      <View className="welcome-logo"></View>
      <View className="welcome-desc flex flex-col items-center mt-3">
        <p className="desc-item">欢迎回家！</p>
        <p className="desc-item">作为地球上最优秀的员工，</p>
        <p className="desc-item">快来调教你</p>
        <p className="desc-item">嗷嗷待铺的老板们吧~！</p>
      </View>
      <div className="office-btn big mt-5" onClick={toHome}>
        开始调教
      </div>
    </View>
  );
};

export default Welcome;
