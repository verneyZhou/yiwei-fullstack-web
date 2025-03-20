import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import { LEVELS } from "../../config";
import { useAppStore, useSelector } from "@/store";
import officeToast from "@/components/toast";
import useSnakeContext from "../../context";
import "./index.scss";
import { _gameSnakeRank } from "@/services/game";

const mockLeaderboard = [
  { username: "李明", score: 12000 },
  { username: "亚当斯", score: 10500 },
  { username: "雅典娜", score: 9200 },
  { username: "斗士", score: 8700 },
  { username: "王梓", score: 7500 },
  { username: "悠悠", score: 6800 },
  { username: "9527", score: 5400 },
  { username: "可莉", score: 4200 },
  { username: "绝壁", score: 3100 },
  { username: "小王", score: 5 },
  { username: "小枫", score: 50 },
];

export default function Leaderboard() {
  const { userInfo } = useAppStore(useSelector(["userInfo"]));
  const { highScore } = useSnakeContext();
  const [leaderboard, setLeaderboard] = useState<any>([]);
  const [currentLevel, setCurrentLevel] = useState(LEVELS[0]?.level || 0); // 默认简单难度

  // 获取排行榜数据
  useEffect(() => {
    _gameSnakeRank({
      level: currentLevel,
    })
      .then((res) => {
        // 按分数排序
        const sortedLeaderboard = [...mockLeaderboard, ...(res.data || [])]
          .map((item) => {
            return {
              ...item,
              username: item.username,
              score: item.score,
              isCurrentPlayer: item.uid === userInfo?.uid,
            };
          })
          .sort((a, b) => b.score - a.score);

        // 更新排行榜位置
        const rankedLeaderboard = sortedLeaderboard.map((player, index) => ({
          ...player,
          rank: index + 1,
        }));

        setLeaderboard(rankedLeaderboard);
      })
      .catch((err) => {
        console.log(err);
        officeToast.warning("获取排行榜失败");
      });
  }, [currentLevel, userInfo]); // 添加currentLevel依赖

  return (
    <View className="leaderboard-container">
      <View className="leaderboard-header">
        <Text className="title">排行榜</Text>
        <Text className="subtitle">你的最高分: {highScore}</Text>
      </View>

      <View className="level-selector">
        {LEVELS.map((level) => (
          <View
            key={level.level}
            className={`level-item ${
              currentLevel === level.level ? "active" : ""
            }`}
            onClick={() => setCurrentLevel(level.level)}
          >
            <Text>{level.label}</Text>
          </View>
        ))}
      </View>

      <View className="leaderboard-list">
        <View className="list-header">
          <Text className="rank-header">排名</Text>
          <Text className="name-header">玩家</Text>
          <Text className="score-header">分数</Text>
        </View>

        {leaderboard.map((player) => (
          <View
            key={player.rank}
            className={`list-item ${
              player.isCurrentPlayer ? "current-player" : ""
            }`}
          >
            <Text className="rank">{player.rank}</Text>
            <Text className="name">{player.username}</Text>
            <Text className="score">{player.score}</Text>
          </View>
        ))}

        {leaderboard.length === 0 && (
          <View className="empty-message">
            <Text>暂无排行数据</Text>
          </View>
        )}
      </View>
    </View>
  );
}
