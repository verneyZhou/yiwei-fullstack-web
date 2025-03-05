import "./index.scss";

import { useRef } from "react";
import UserInfo from "@/packageMain/home/components/userInfo";
import HomeCard from "@/packageMain/home/components/card";
import Taro from "@tarojs/taro";

import { Icon, Button } from "@antmjs/vantui";

export default function Home() {
  const onFireIcon = () => {
    Taro.navigateTo({
      url: "/packageUser/more/index",
    });
  };

  return (
    <div className="home-index-content">
      <UserInfo />
      <HomeCard title="办公桌" btnTxt="道具" desc="办公桌道具摆放">
        <div className="office-btn big">去工作</div>
      </HomeCard>
      <HomeCard title="便利贴" btnTxt="更多" />
      <HomeCard title="我的访客" btnTxt="更多" />
      <Icon
        name="fire"
        color="red"
        size="32px"
        className="home-fixed-btn"
        onClick={onFireIcon}
      />
    </div>
  );
}
