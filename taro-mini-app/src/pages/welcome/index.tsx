import { View, Image, Text } from "@tarojs/components";
import "./index.scss";
import Taro from "@tarojs/taro";

import aiChatIcon from "@/assets/svg/input-ai.svg";
import gameIcon from "@/assets/svg/device-gamepad-2.svg";
import toolsIcon from "@/assets/svg/tool.svg";
import bossIcon from "@/assets/svg/swords.svg";

interface TabItem {
  icon: string;
  label: string;
  path: string;
}

const tabList: TabItem[] = [
  {
    icon: gameIcon,
    label: "小游戏",
    path: "/packageGame/welcome/index",
  },
  {
    icon: toolsIcon,
    label: "工具",
    path: "/packageMain/home/index",
  },
  {
    icon: aiChatIcon,
    label: "AI Chat",
    path: "/packageUser/chat/index",
  },
  {
    icon: bossIcon,
    label: "调教老板",
    path: "/packageMain/welcome/index",
  },
];

export default function Welcome() {
  const handleTabClick = (path: string) => {
    Taro.navigateTo({
      url: path,
    });
  };

  return (
    <View className="welcome-page">
      <View className="welcome-header">
        <Text className="welcome-title">OFFUN</Text>
        <Text className="welcome-subtitle">智享办公乐趣！</Text>
      </View>
      <View className="tab-container">
        {tabList.map((tab, index) => (
          <View
            key={index}
            className="tab-item"
            onClick={() => handleTabClick(tab.path)}
          >
            <Image className="tab-icon" src={tab.icon} />
            <Text className="tab-label">{tab.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
