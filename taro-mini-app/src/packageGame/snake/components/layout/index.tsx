import "./index.scss";

import React, { useState, useEffect, memo, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import useSnakeContext from "../../context";

const navItems = [
  { label: "游戏", path: "/index", value: "index" },
  { label: "排行榜", path: "/leaderboard", value: "leaderboard" },
  { label: "设置", path: "/settings", value: "settings" },
];

export default function Layout() {
  const { gameVersion } = useSnakeContext();

  return (
    <View className="snake-page-content">
      <Header />
      <GameNav />
      <Outlet />
    </View>
  );
}

// 头部组件
const Header = () => {
  return (
    <View className="snake-header">
      <Text className="title">贪吃蛇</Text>
    </View>
  );
};

// 游戏导航
const GameNav = () => {
  const { gameIsStarted } = useSnakeContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentNav = useMemo(() => {
    return navItems.find((item) => pathname.indexOf(item.path) === 0) || null;
  }, [pathname]);

  const onNavClick = (item) => {
    if (currentNav && item.value === currentNav.value) return;
    navigate(item.path);
  };

  if (gameIsStarted) return null;

  return (
    <View className="game-nav-container">
      {navItems.map((item) => (
        <View
          key={item.value}
          className={`nav-item ${
            currentNav && currentNav.value === item.value ? "active" : ""
          }`}
          onClick={() => onNavClick(item)}
        >
          <Text>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};