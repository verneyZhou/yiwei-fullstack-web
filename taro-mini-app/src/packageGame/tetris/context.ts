import React, { createContext, useContext } from 'react';

export const TileMatchContext = createContext<{
  tileMatchPageRef: any;
  gameVersion: string;
  highScore: number;
  gameIsStarted: boolean;
  saveHighScore: (score: number) => void;
  updateGameIsStarted: (gameIsStarted: boolean) => void;
    }>({ 
      tileMatchPageRef: null,
      gameVersion: '',
      highScore: 0,
      saveHighScore: () => {},
      gameIsStarted: false,
      updateGameIsStarted: () => {},
    });

export default function useTileMatchContext() {
  return useContext(TileMatchContext);
}