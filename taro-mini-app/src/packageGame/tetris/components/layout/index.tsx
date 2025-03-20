import "./index.scss";

import React, { useState, useEffect, memo, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import useTileMatchContext from "../../context";

const navItems = [
  { label: "游戏", path: "/index", value: "index" },
  { label: "排行榜", path: "/leaderboard", value: "leaderboard" },
  { label: "设置", path: "/settings", value: "settings" },
];

export default function Layout() {
  const { gameVersion } = useTileMatchContext();

  return (
    <View className="tile-match-page-content">
      <Header />
      <GameNav />
      <Outlet />
    </View>
  );
}

// 头部组件
const Header = () => {
  return (
    <View className="tile-match-header">
      <Text className="title">TETRIS</Text>
    </View>
  );
};

// 游戏导航
const GameNav = () => {
  const { gameIsStarted } = useTileMatchContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  console.log("===pathname useLocation", useLocation());

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
