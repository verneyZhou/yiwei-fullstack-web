import React, { useState } from "react";
import { View, Text, Switch } from "@tarojs/components";
import useSnakeContext from "../../context";
import "./index.scss";

export default function Settings() {
  const { gameVersion } = useSnakeContext();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const toggleSound = (value) => {
    setSoundEnabled(value);
    // 在实际应用中，这里应该保存设置到本地存储
  };

  const toggleVibration = (value) => {
    setVibrationEnabled(value);
    // 在实际应用中，这里应该保存设置到本地存储
  };

  return (
    <View className="settings-container">
      <View className="settings-header">
        <Text className="title">游戏设置</Text>
      </View>

      <View className="settings-list">
        <View className="settings-item">
          <Text className="item-label">音效</Text>
          <Switch
            checked={soundEnabled}
            onChange={(e) => toggleSound(e.detail.value)}
            color="#4a90e2"
          />
        </View>

        <View className="settings-item">
          <Text className="item-label">振动</Text>
          <Switch
            checked={vibrationEnabled}
            onChange={(e) => toggleVibration(e.detail.value)}
            color="#4a90e2"
          />
        </View>
      </View>

      <View className="game-instructions">
        <Text className="section-title">操作说明</Text>
        <View className="instruction-item">
          <Text className="key">←</Text>
          <Text className="action">向左移动蛇</Text>
        </View>
        <View className="instruction-item">
          <Text className="key">→</Text>
          <Text className="action">向右移动蛇</Text>
        </View>
        <View className="instruction-item">
          <Text className="key">↑</Text>
          <Text className="action">向上移动蛇</Text>
        </View>
        <View className="instruction-item">
          <Text className="key">↓</Text>
          <Text className="action">向下移动蛇</Text>
        </View>
      </View>

      <View className="about-section">
        <Text className="section-title">关于游戏</Text>
        <Text className="version-info">版本: {gameVersion}</Text>
        <Text className="copyright">© 2025 贪吃蛇游戏</Text>
      </View>
    </View>
  );
}