import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useAppStore, useSelector } from "@/store";
import officeDialog from "@/components/dialog";
import { LEVELS } from "../../config";
import useTileMatchContext from "../../context";
import "./index.scss";
import { _gameTetrisScore, _updateTetrisScore } from "@/services/game";

// 方块形状定义
const SHAPES = [
  // I形
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  // J形
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // L形
  [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // O形
  [
    [1, 1],
    [1, 1],
  ],
  // S形
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  // T形
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // Z形
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
];

// 方块颜色
const COLORS = [
  "#FF0D72", // I形 - 红色
  "#0DC2FF", // J形 - 蓝色
  "#0DFF72", // L形 - 绿色
  "#F538FF", // O形 - 粉色
  "#FF8E0D", // S形 - 橙色
  "#FFE138", // T形 - 黄色
  "#3877FF", // Z形 - 深蓝色
];

// 游戏区域大小
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 25;

export default function Game() {
  const { userInfo } = useAppStore(useSelector(["userInfo"]));
  const { highScore, saveHighScore, updateGameIsStarted } =
    useTileMatchContext(); // 高分记录
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0); // 当前分数
  const [level, setLevel] = useState(1); // 默认简单难度
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameBoardStyl, setGameBoardStyl] = useState({
    width: 300,
    height: 600,
  });

  const gameLoopRef = useRef(null);
  const boardRef = useRef(null);

  useEffect(() => {
    console.log("userInfo", userInfo);
    setGameBoardStyl({
      width: BOARD_WIDTH * BLOCK_SIZE,
      height: BOARD_HEIGHT * BLOCK_SIZE,
    });
  }, []);

  //   获取历史成绩
  useEffect(() => {
    console.log("====level", level);
    _gameTetrisScore({ level })
      .then((res) => {
        console.log("res", res);
        saveHighScore(res.data?.score || 0);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, [level]);

  useEffect(() => {
    updateGameIsStarted(gameStarted);
  }, [gameStarted, updateGameIsStarted]);

  // 创建空游戏板
  function createEmptyBoard() {
    return Array(BOARD_HEIGHT)
      .fill()
      .map(() => Array(BOARD_WIDTH).fill(0));
  }

  // 生成随机方块
  const generateRandomPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[shapeIndex],
      color: COLORS[shapeIndex],
      x:
        Math.floor(BOARD_WIDTH / 2) -
        Math.floor(SHAPES[shapeIndex][0].length / 2),
      y: 0,
    };
  }, []);

  // 检查碰撞
  const checkCollision = useCallback((piece, x, y, board) => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        // 如果方块的这一部分不是空的
        if (piece.shape[row][col] !== 0) {
          const newX = x + col;
          const newY = y + row;

          // 检查是否超出边界或与已有方块重叠
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX] !== 0)
          ) {
            return true; // 发生碰撞
          }
        }
      }
    }
    return false; // 没有碰撞
  }, []);

  // 旋转方块
  const rotatePiece = useCallback(() => {
    if (!currentPiece || isPaused) return;

    const rotated = [];
    const shape = currentPiece.shape;

    // 转置矩阵
    for (let i = 0; i < shape[0].length; i++) {
      const row = [];
      for (let j = shape.length - 1; j >= 0; j--) {
        row.push(shape[j][i]);
      }
      rotated.push(row);
    }

    const newPiece = {
      ...currentPiece,
      shape: rotated,
    };

    // 检查旋转后是否会发生碰撞
    if (!checkCollision(newPiece, position.x, position.y, board)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, position, board, checkCollision, isPaused]);

  // 移动方块
  const movePiece = useCallback(
    (direction) => {
      if (!currentPiece || isPaused) return;

      let newX = position.x;
      let newY = position.y;

      switch (direction) {
        case "left":
          newX -= 1;
          break;
        case "right":
          newX += 1;
          break;
        case "down":
          newY += 1;
          break;
        default:
          return;
      }

      // 检查移动后是否会发生碰撞
      if (!checkCollision(currentPiece, newX, newY, board)) {
        setPosition({ x: newX, y: newY });
        return true;
      }

      // 如果向下移动发生碰撞，则固定方块
      if (direction === "down") {
        placePiece();
        return false;
      }

      return false;
    },
    [currentPiece, position, board, checkCollision, isPaused]
  );

  // 快速下落
  const dropPiece = useCallback(() => {
    if (!currentPiece || isPaused) return;

    let newY = position.y;
    while (!checkCollision(currentPiece, position.x, newY + 1, board)) {
      newY += 1;
    }

    setPosition({ ...position, y: newY });
    placePiece();
  }, [currentPiece, position, board, checkCollision, isPaused]);

  // 将方块固定到游戏板上
  const placePiece = useCallback(() => {
    if (!currentPiece) return;

    // 创建新的游戏板
    const newBoard = [...board];

    // 将当前方块添加到游戏板
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col] !== 0) {
          const boardY = position.y + row;
          const boardX = position.x + col;
          console.log("=====boardY, boardX", boardY, boardX);

          // 如果方块超出顶部，游戏结束
          if (boardY <= 0) {
            setGameOver(true);
            return;
          }

          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }

    // 检查是否有完整的行
    let linesCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every((cell) => cell !== 0)) {
        // 移除该行
        newBoard.splice(row, 1);
        // 在顶部添加新行
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        row++; // 重新检查当前行，因为上面的行已经下移
      }
    }

    // 更新分数
    if (linesCleared > 0) {
      const points = [0, 40, 100, 300, 1200][linesCleared] * level;
      const newScore = score + points;
      setScore(newScore);
      // 更新最高分
      if (newScore > highScore) {
        handleUpateHighScore(newScore);
        saveHighScore(newScore);
      }
    }

    setBoard(newBoard);

    // 生成新方块
    setCurrentPiece(nextPiece);
    setNextPiece(generateRandomPiece());
    setPosition({
      x:
        Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPiece.shape[0].length / 2),
      y: 0,
    });
  }, [
    currentPiece,
    nextPiece,
    position,
    board,
    score,
    level,
    generateRandomPiece,
    saveHighScore,
  ]);

  // 游戏循环
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const gameLoop = () => {
      movePiece("down");
    };

    const curLevel = LEVELS.find((item) => item.level === level);
    if (!curLevel) return;
    gameLoopRef.current = setInterval(gameLoop, curLevel.speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused, level, movePiece]);

  // 键盘控制
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyDown = (e) => {
      switch (e.keyCode) {
        case 37: // 左箭头
          movePiece("left");
          break;
        case 39: // 右箭头
          movePiece("right");
          break;
        case 40: // 下箭头
          movePiece("down");
          break;
        case 38: // 上箭头
          rotatePiece();
          break;
        case 32: // 空格
          dropPiece();
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
  }, [gameStarted, gameOver, movePiece, rotatePiece, dropPiece]);

  const handleUpateHighScore = async (_score: number) => {
    try {
      await _updateTetrisScore({
        score: _score,
        level,
      });
    } catch (err) {}
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
    setBoard(createEmptyBoard());
    setCurrentPiece(generateRandomPiece());
    setNextPiece(generateRandomPiece());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);
  };

  //   结束游戏
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
    // 创建一个临时游戏板的副本
    const tempBoard = board.map((row) => [...row]);

    // 将当前方块添加到临时游戏板
    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col] !== 0) {
            const boardY = position.y + row;
            const boardX = position.x + col;

            if (
              boardY >= 0 &&
              boardY < BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < BOARD_WIDTH
            ) {
              tempBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return (
      <View
        className="game-board"
        ref={boardRef}
        style={{ width: gameBoardStyl.width, height: gameBoardStyl.height }}
      >
        {tempBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              className="game-piece"
              style={{
                backgroundColor: cell || "transparent",
                width: `${BLOCK_SIZE}px`,
                height: `${BLOCK_SIZE}px`,
                top: `${rowIndex * BLOCK_SIZE}px`,
                left: `${colIndex * BLOCK_SIZE}px`,
              }}
            />
          ))
        )}
      </View>
    );
  };

  // 渲染下一个方块
  //   const renderNextPiece = () => {
  //     if (!nextPiece) return null;

  //     return (
  //       <View className="next-piece-container">
  //         <Text className="next-piece-title">下一个</Text>
  //         <View className="next-piece-board">
  //           {nextPiece.shape.map((row, rowIndex) =>
  //             row.map((cell, colIndex) =>
  //               cell ? (
  //                 <View
  //                   key={`next-${rowIndex}-${colIndex}`}
  //                   style={{
  //                     position: "absolute",
  //                     width: "20px",
  //                     height: "20px",
  //                     backgroundColor: nextPiece.color,
  //                     top: `${rowIndex * 20}px`,
  //                     left: `${colIndex * 20}px`,
  //                     border: "1px solid rgba(255,255,255,0.2)",
  //                   }}
  //                 />
  //               ) : null
  //             )
  //           )}
  //         </View>
  //       </View>
  //     );
  //   };

  // 渲染游戏难度选择
  const renderLevelSelect = () => {
    return (
      <View className="level-select">
        {LEVELS.map((levelItem, index) => (
          <View
            key={index}
            className={`level-button ${
              level === levelItem.level ? "active" : ""
            }`}
            onClick={() => changeLevel(levelItem)}
          >
            {levelItem.label}
          </View>
        ))}
      </View>
    );
  };

  // 渲染游戏结束模态框
  const renderGameOverModal = () => {
    console.log("gameOver", gameOver);
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
            {/* {renderNextPiece()} */}
            {renderGameOverModal()}
          </View>

          <View className="game-controls">
            <View className="control-row">
              <View className="control-button" onClick={dropPiece}>
                ⤓
              </View>
              <View
                className="control-button"
                onClick={() => movePiece("left")}
              >
                ←
              </View>
              <View
                className="control-button"
                onClick={() => movePiece("down")}
              >
                ↓
              </View>
              <View
                className="control-button"
                onClick={() => movePiece("right")}
              >
                →
              </View>
              <View className="control-button" onClick={rotatePiece}>
                ↻
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
