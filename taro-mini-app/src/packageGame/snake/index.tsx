import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./router";
import "./index.scss";
import { SnakeContext } from "./context";
import { ScrollView } from "@tarojs/components";

const TARO_ENV = process.env.TARO_ENV;
const prefix = process.env.TARO_APP_PUBLIC_PATH;
const basename =
  TARO_ENV === "h5"
    ? `${prefix}/packageGame/snake`
    : "packageGame/snake";

// 贪吃蛇游戏入口
export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <SnakePage />
    </BrowserRouter>
  );
}

function SnakePage() {
  const elements = useRoutes(routes);
  const snakePageRef = useRef(null);
  const gameVersion = "1.0.0";
  const [highScore, setHighScore] = useState(0);
  const [gameIsStarted, setGameIsStarted] = useState(false); // 游戏是否已经开始

  // 保存最高分到本地存储
  const saveHighScore = (score) => {
    setHighScore(score);
  };
  
  const updateGameIsStarted = (value) => {
    setGameIsStarted(value);
  };

  return (
    <SnakeContext.Provider
      value={{
        snakePageRef,
        gameVersion,
        highScore,
        saveHighScore,
        gameIsStarted,
        updateGameIsStarted,
      }}
    >
      <ScrollView
        className="snake-page-wrapper"
        ref={snakePageRef}
        scrollY
        scrollWithAnimation
      >
        {elements}
      </ScrollView>
    </SnakeContext.Provider>
  );
}