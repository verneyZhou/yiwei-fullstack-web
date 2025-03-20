import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useAppStore, useSelector } from "@/store";
import officeDialog from "@/components/dialog";
import { LEVELS } from "../../config";
import useSnakeContext from "../../context";
import "./index.scss";
import { _gameSnakeScore, _updateSnakeScore } from "@/services/game";

// 游戏区域大小
const BOARD_WIDTH = 20; // 横向单元格数量
const BOARD_HEIGHT = 20; // 纵向单元格数量
const BLOCK_SIZE = 16; // 每个单元格的大小

// 方向定义
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// 食物颜色
const FOOD_COLORS = ["#FF0D72", "#0DC2FF", "#0DFF72", "#F538FF", "#FF8E0D"];

export default function Game() {
  const { userInfo } = useAppStore(useSelector(["userInfo"]));
  const { highScore, saveHighScore, updateGameIsStarted } = useSnakeContext();

  // 游戏状态
  const [board, setBoard] = useState(createEmptyBoard());
  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState([]);
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1); // 默认简单难度
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameBoardStyle, setGameBoardStyle] = useState({
    width: BOARD_WIDTH * BLOCK_SIZE,
    height: BOARD_HEIGHT * BLOCK_SIZE,
  });

  const gameLoopRef = useRef(null);
  const boardRef = useRef(null);
  const lastDirectionRef = useRef(DIRECTIONS.RIGHT);

  // 初始化游戏板尺寸
  useEffect(() => {
    setGameBoardStyle({
      width: BOARD_WIDTH * BLOCK_SIZE,
      height: BOARD_HEIGHT * BLOCK_SIZE,
    });
  }, []);

  // 获取历史成绩
  useEffect(() => {
    _gameSnakeScore({ level })
      .then((res) => {
        saveHighScore(res.data?.score || 0);
      })
      .catch((err) => {
        console.log("获取历史成绩失败", err);
      });
  }, [level, saveHighScore]);

  // 更新游戏状态
  useEffect(() => {
    updateGameIsStarted(gameStarted);
  }, [gameStarted, updateGameIsStarted]);

  // 创建空游戏板
  function createEmptyBoard() {
    return Array(BOARD_HEIGHT)
      .fill()
      .map(() => Array(BOARD_WIDTH).fill(0));
  }

  // 初始化蛇
  const initSnake = useCallback(() => {
    return [
      { x: 3, y: 7 },
      { x: 2, y: 7 },
      { x: 1, y: 7 },
    ];
  }, []);

  // 生成食物
  const generateFood = useCallback(
    (snakeBody, currentFood = []) => {
      const currentLevel = LEVELS.find((l) => l.level === level);
      const foodCount = currentLevel?.foodCount || 1;
      const newFood = [...currentFood];

      while (newFood.length < foodCount) {
        const foodPosition = {
          x: Math.floor(Math.random() * BOARD_WIDTH),
          y: Math.floor(Math.random() * BOARD_HEIGHT),
          color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)],
        };

        // 确保食物不会出现在蛇身上
        const isOnSnake = snakeBody.some(
          (segment) =>
            segment.x === foodPosition.x && segment.y === foodPosition.y
        );

        // 确保食物不会出现在其他食物上
        const isOnFood = newFood.some(
          (f) => f.x === foodPosition.x && f.y === foodPosition.y
        );

        if (!isOnSnake && !isOnFood) {
          newFood.push(foodPosition);
        }
      }

      return newFood;
    },
    [level]
  );

  // 移动蛇
  const moveSnake = useCallback(() => {
    if (!gameStarted || gameOver || isPaused) return;

    setSnake((prevSnake) => {
      // 获取蛇头
      const head = prevSnake[0];

      // 计算新的蛇头位置
      const newHead = {
        x: head.x + lastDirectionRef.current.x,
        y: head.y + lastDirectionRef.current.y,
      };

      // 检查是否吃到食物
      let newFood = [...food];
      let newScore = score;
      let ateFood = false;

      const foodIndex = newFood.findIndex(
        (f) => f.x === newHead.x && f.y === newHead.y
      );

      if (foodIndex !== -1) {
        // 吃到食物，加分
        ateFood = true;
        newScore = score + 10 * level;
        setScore(newScore);

        // 移除被吃掉的食物
        newFood.splice(foodIndex, 1);

        // 生成新的食物
        newFood = generateFood(prevSnake, newFood);
        setFood(newFood);

        // 更新最高分
        if (newScore > highScore) {
          handleUpdateHighScore(newScore);
          saveHighScore(newScore);
        }
      }

      // 创建新的蛇身
      const newSnake = [newHead, ...prevSnake];
      if (!ateFood) {
        // 如果没有吃到食物，移除尾部
        newSnake.pop();
      }

      // 检查游戏是否结束
      if (checkCollision(newHead, newSnake.slice(1))) {
        setGameOver(true);
        return prevSnake; // 保持蛇不变
      }

      return newSnake;
    });
  }, [
    gameStarted,
    gameOver,
    isPaused,
    food,
    score,
    level,
    highScore,
    generateFood,
    saveHighScore,
  ]);

  // 检查碰撞
  const checkCollision = useCallback((head, body) => {
    // 检查是否撞墙
    if (
      head.x < 0 ||
      head.x >= BOARD_WIDTH ||
      head.y < 0 ||
      head.y >= BOARD_HEIGHT
    ) {
      return true;
    }

    // 检查是否撞到自己
    return body.some((segment) => segment.x === head.x && segment.y === head.y);
  }, []);

  // 改变方向
  const changeDirection = useCallback(
    (newDirection) => {
      if (!gameStarted || gameOver || isPaused) return;

      // 防止180度转向
      const isOpposite =
        (newDirection === DIRECTIONS.UP &&
          lastDirectionRef.current === DIRECTIONS.DOWN) ||
        (newDirection === DIRECTIONS.DOWN &&
          lastDirectionRef.current === DIRECTIONS.UP) ||
        (newDirection === DIRECTIONS.LEFT &&
          lastDirectionRef.current === DIRECTIONS.RIGHT) ||
        (newDirection === DIRECTIONS.RIGHT &&
          lastDirectionRef.current === DIRECTIONS.LEFT);

      if (!isOpposite) {
        setDirection(newDirection);
        lastDirectionRef.current = newDirection;
      }
    },
    [gameStarted, gameOver, isPaused]
  );

  // 游戏循环
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const currentLevel = LEVELS.find((l) => l.level === level);
    if (!currentLevel) return;

    gameLoopRef.current = setInterval(moveSnake, currentLevel.speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused, level, moveSnake]);

  // 键盘控制
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyDown = (e) => {
      switch (e.keyCode) {
        case 37: // 左箭头
          changeDirection(DIRECTIONS.LEFT);
          break;
        case 38: // 上箭头
          changeDirection(DIRECTIONS.UP);
          break;
        case 39: // 右箭头
          changeDirection(DIRECTIONS.RIGHT);
          break;
        case 40: // 下箭头
          changeDirection(DIRECTIONS.DOWN);
          break;
        case 80: // P键
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted, gameOver, changeDirection]);

  // 更新最高分
  const handleUpdateHighScore = async (_score) => {
    try {
      await _updateSnakeScore({
        score: _score,
        level,
      });
    } catch (err) {
      console.error("更新最高分失败", err);
    }
  };

  // 开始游戏
  const startGame = () => {
    const token = Taro.getStorageSync("token");
    if (!userInfo || !token) {
      officeDialog({
        title: "温馨提示",
        content: "亲，请先登录才可以开始游戏哦~",
        confirmText: "确定",
        textCenter: true,
        confirm: () => {
          Taro.navigateTo({
            url: "/pages/login/index",
          });
        },
      });
      return;
    }

    // 初始化游戏
    setBoard(createEmptyBoard());
    const initialSnake = initSnake();
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection(DIRECTIONS.RIGHT);
    lastDirectionRef.current = DIRECTIONS.RIGHT;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);

    // 清除之前的游戏循环
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };

  // 结束游戏
  const endGame = () => {
    setGameOver(true);
  };

  // 暂停/继续游戏
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // 改变游戏难度
  const changeLevel = (item) => {
    if (item.level === level) return;
    setLevel(item.level);
  };

  // 渲染游戏板
  const renderBoard = () => {
    // 创建一个空的游戏板
    const boardDisplay = createEmptyBoard();

    // 在游戏板上标记蛇的位置
    snake.forEach((segment, index) => {
      if (
        segment.y >= 0 &&
        segment.y < BOARD_HEIGHT &&
        segment.x >= 0 &&
        segment.x < BOARD_WIDTH
      ) {
        boardDisplay[segment.y][segment.x] = index === 0 ? 2 : 1; // 2表示蛇头，1表示蛇身
      }
    });

    // 在游戏板上标记食物的位置
    food.forEach((foodItem) => {
      if (
        foodItem.y >= 0 &&
        foodItem.y < BOARD_HEIGHT &&
        foodItem.x >= 0 &&
        foodItem.x < BOARD_WIDTH
      ) {
        boardDisplay[foodItem.y][foodItem.x] = {
          type: "food",
          color: foodItem.color,
        };
      }
    });

    return (
      <View
        className="game-board"
        ref={boardRef}
        style={{ width: gameBoardStyle.width, height: gameBoardStyle.height }}
      >
        {boardDisplay.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let cellClass = "game-piece";
            let cellStyle = {
              width: `${BLOCK_SIZE}px`,
              height: `${BLOCK_SIZE}px`,
              top: `${rowIndex * BLOCK_SIZE}px`,
              left: `${colIndex * BLOCK_SIZE}px`,
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              position: "absolute",
            };

            if (cell === 1) {
              // 蛇身
              cellClass += " snake-body";
              cellStyle.backgroundColor = "#4a90e2";
              cellStyle.borderRadius = "3px";
            } else if (cell === 2) {
              // 蛇头
              cellClass += " snake-head";
              cellStyle.backgroundColor = "#0056b3";
              cellStyle.borderRadius = "5px";

              // 根据方向添加眼睛效果
              if (direction === DIRECTIONS.RIGHT) {
                cellStyle.transform = "rotate(0deg)";
              } else if (direction === DIRECTIONS.DOWN) {
                cellStyle.transform = "rotate(90deg)";
              } else if (direction === DIRECTIONS.LEFT) {
                cellStyle.transform = "rotate(180deg)";
              } else if (direction === DIRECTIONS.UP) {
                cellStyle.transform = "rotate(270deg)";
              }
            } else if (
              cell &&
              typeof cell === "object" &&
              cell.type === "food"
            ) {
              // 食物
              cellClass += " food";
              cellStyle.backgroundColor = cell.color;
              cellStyle.borderRadius = "50%";
              cellStyle.boxShadow = "0 0 5px rgba(255,255,255,0.5)";
            }

            return (
              <View
                key={`${rowIndex}-${colIndex}`}
                className={cellClass}
                style={cellStyle}
              />
            );
          })
        )}
      </View>
    );
  };

  // 渲染控制按钮
  const renderControls = () => {
    return (
      <View className="game-controls">
        <View className="control-row">
          <View
            className="control-button"
            onClick={() => changeDirection(DIRECTIONS.UP)}
          >
            ↑
          </View>
        </View>
        <View className="control-row">
          <View
            className="control-button"
            onClick={() => changeDirection(DIRECTIONS.LEFT)}
          >
            ←
          </View>
          <View
            className="control-button"
            onClick={() => changeDirection(DIRECTIONS.DOWN)}
          >
            ↓
          </View>
          <View
            className="control-button"
            onClick={() => changeDirection(DIRECTIONS.RIGHT)}
          >
            →
          </View>
        </View>
      </View>
    );
  };

  // 渲染游戏信息
  const renderGameInfo = () => {
    return (
      <View className="game-info">
        <Text className="info-text">分数: {score}</Text>
        <Text className="info-text">最高分: {highScore}</Text>
        <Text className="info-text">
          难度: {LEVELS.find((l) => l.level === level)?.name || "简单"}
        </Text>
      </View>
    );
  };

  // 渲染难度选择
  const renderLevelSelect = () => {
    return (
      <View className="level-select">
        <Text className="level-title">选择难度:</Text>
        <View className="level-buttons">
          {LEVELS.map((item) => (
            <View
              key={item.level}
              className={`level-button ${level === item.level ? "active" : ""}`}
              onClick={() => changeLevel(item)}
            >
              {item.name}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // 渲染游戏状态按钮
  const renderGameStateButtons = () => {
    if (!gameStarted) {
      return (
        <View className="game-buttons">
          <View className="game-button start" onClick={startGame}>
            开始游戏
          </View>
        </View>
      );
    }

    if (gameOver) {
      return (
        <View className="game-buttons">
          <View className="game-button restart" onClick={startGame}>
            重新开始
          </View>
        </View>
      );
    }

    return (
      <View className="game-buttons">
        <View className="game-button pause" onClick={togglePause}>
          {isPaused ? "继续" : "暂停"}
        </View>
        <View className="game-button end" onClick={endGame}>
          结束游戏
        </View>
      </View>
    );
  };

  // 渲染游戏结束模态框
  const renderGameOverModal = () => {
    if (!gameOver) return null;

    return (
      <View className="game-over-modal">
        <Text className="modal-title">游戏结束</Text>
        <Text className="final-score">得分: {score}</Text>
        <View className="restart-button" onClick={startGame}>
          再来一局
        </View>
        <View
          className="restart-button mt-2"
          onClick={() => setGameStarted(false)}
        >
          狠心离开
        </View>
      </View>
    );
  };

  return (
    <View className="game-container">
      <View className="game-header">
        <View className="level-container">
          <Text className="label">难度</Text>
          <Text className="value">
            {LEVELS.find((v) => v.level === level)?.label || "未知"}
          </Text>
        </View>
        <View className="high-score-container">
          <Text className="label">当前得分</Text>
          <Text className="value">{score}</Text>
        </View>
        <View className="high-score-container">
          <Text className="label">最高分</Text>
          <Text className="value">{highScore}</Text>
        </View>
      </View>

      {!gameStarted ? (
        <>
          {renderLevelSelect()}
          <View className="office-btn mini" onClick={startGame}>
            开始游戏
          </View>
        </>
      ) : (
        <>
          <View className="game-board-container">
            {renderBoard()}
            {renderGameOverModal()}
          </View>

          <View className="game-controls">
            <View className="control-row">
              <View
                className="control-button"
                onClick={() => changeDirection(DIRECTIONS.UP)}
              >
                ↑
              </View>
              <View
                className="control-button"
                onClick={() => changeDirection(DIRECTIONS.LEFT)}
              >
                ←
              </View>
              <View
                className="control-button"
                onClick={() => changeDirection(DIRECTIONS.DOWN)}
              >
                ↓
              </View>
              <View
                className="control-button"
                onClick={() => changeDirection(DIRECTIONS.RIGHT)}
              >
                →
              </View>
              <View
                className="pause-button control-button"
                onClick={togglePause}
              >
                {isPaused ? "继续" : "暂停"}
              </View>
              <View className="control-button pause-button" onClick={startGame}>
                重开
              </View>
            </View>
            <View className="office-btn mini" onClick={endGame}>
              结束游戏
            </View>
          </View>
        </>
      )}
    </View>
  );
}
