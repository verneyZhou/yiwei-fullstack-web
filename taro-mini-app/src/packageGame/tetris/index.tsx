import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./router";
import "./index.scss";
import { TileMatchContext } from "./context";
import { ScrollView } from "@tarojs/components";

const TARO_ENV = process.env.TARO_ENV;
const prefix = process.env.TARO_APP_PUBLIC_PATH;
const basename =
  TARO_ENV === "h5" ? `${prefix}/packageGame/tetris` : "packageGame/tetris";

// 俄罗斯方块游戏入口
export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <TileMatchPage />
    </BrowserRouter>
  );
}

function TileMatchPage() {
  const elements = useRoutes(routes);
  const tileMatchPageRef = useRef(null);
  const gameVersion = "1.0.0";
  const [highScore, setHighScore] = useState(0);
  const [gameIsStarted, setGameIsStarted] = useState(false); // 游戏是否已经开始

  // 保存最高分到本地存储
  const saveHighScore = (score) => {
    setHighScore(score);
    // if (score > highScore) {
    //   setHighScore(score);
    //   try {
    //     localStorage.setItem("tileMatch_highScore", score.toString());
    //   } catch (e) {
    //     console.error("保存最高分失败", e);
    //   }
    // }
  };
  const updateGameIsStarted = (value) => {
    setGameIsStarted(value);
  };

  // 从本地存储加载最高分
  //   useEffect(() => {
  //     try {
  //       const savedScore = localStorage.getItem('tileMatch_highScore');
  //       if (savedScore) {
  //         setHighScore(parseInt(savedScore, 10));
  //       }
  //     } catch (e) {
  //       console.error('加载最高分失败', e);
  //     }
  //   }, []);

  return (
    <TileMatchContext.Provider
      value={{
        tileMatchPageRef,
        gameVersion,
        highScore,
        saveHighScore,
        gameIsStarted,
        updateGameIsStarted,
      }}
    >
      <ScrollView
        className="tile-match-page-wrapper"
        ref={tileMatchPageRef}
        scrollY
        scrollWithAnimation
      >
        {elements}
      </ScrollView>
    </TileMatchContext.Provider>
  );
}
