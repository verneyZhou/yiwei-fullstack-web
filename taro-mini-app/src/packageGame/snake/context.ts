import React, { createContext, useContext } from 'react';

export const SnakeContext = createContext<{
  snakePageRef: any;
  gameVersion: string;
  highScore: number;
  gameIsStarted: boolean;
  saveHighScore: (score: number) => void;
  updateGameIsStarted: (gameIsStarted: boolean) => void;
}>({ 
  snakePageRef: null,
  gameVersion: '',
  highScore: 0,
  saveHighScore: () => {},
  gameIsStarted: false,
  updateGameIsStarted: () => {},
});

export default function useSnakeContext() {
  return useContext(SnakeContext);
}