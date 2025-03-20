import { View, Image } from "@tarojs/components";
import { navigateTo } from "@tarojs/taro";
import { FC } from "react";
import "./index.scss";

import tetrisIcon from "@/assets/svg/chart-cohort.svg";
import snakeIcon from "@/assets/svg/monkeybar.svg";

interface GameItem {
  id: string;
  name: string;
  icon: string;
  path: string;
}

const gameList: GameItem[] = [
  {
    id: "1",
    name: "贪吃蛇",
    icon: snakeIcon,
    path: "/packageGame/snake/index",
  },
  {
    id: "2",
    name: "俄罗斯方块",
    icon: tetrisIcon,
    path: "/packageGame/tetris/index",
  },
  {
    id: "3",
    name: "2048",
    icon: tetrisIcon,
    path: "/packageGame/tetris/index",
  },
];

const Welcome: FC = () => {
  const handleGameClick = (game: GameItem) => {
    navigateTo({
      url: game.path,
    });
  };

  return (
    <View className="welcome-container">
      <View className="welcome-title">小游戏</View>
      <View className="game-grid">
        {gameList.map((game) => (
          <View
            key={game.id}
            className="game-item"
            onClick={() => handleGameClick(game)}
          >
            <Image className="game-icon" src={game.icon} mode="aspectFit" />
            <View className="game-name">{game.name}</View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Welcome;
