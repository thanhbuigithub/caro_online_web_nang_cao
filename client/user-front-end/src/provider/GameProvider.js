import React from "react";
import { useState } from "react";
import GameContext from "../contexts/GameContext";
import config from "../config/Config";

export default (props) => {
  const [history, setHistory] = useState([
    {
      x: null,
      y: null,
      cells: Array(config.boardSize.row)
        .fill(null)
        .map(() => {
          return Array(config.boardSize.col).fill(null);
        }),
    },
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const [turn, setTurn] = useState(config.playerX);
  const [isAscending, setIsAscending] = useState(true);
  const [gameover, setGameover] = useState(false);
  const [winCells, setWinCells] = useState(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [roomInfo, setRoomInfo] = useState({});
  const [playerType, setPlayerType] = useState(config.playerX);
  const [roomId, setRoomId] = useState("");
  const [chatHistory, setChatHistory] = useState({});

  function handleClick(row, col) {
    console.log("GameProvider: handleClick");
    const curHistory = history.slice(0, stepNumber + 1);
    const current = curHistory[curHistory.length - 1];
    const cells = JSON.parse(JSON.stringify(current.cells));

    if (gameover || cells[row][col]) {
      return false;
    }

    cells[row][col] = turn;

    let _winCells = checkWin(row, col, turn, curHistory.length - 1);

    if (_winCells !== null) {
      setWinCells(_winCells);
      setGameover(true);
    }

    setHistory(
      curHistory.concat([
        {
          cells: cells,
          x: row,
          y: col,
          turn: turn,
        },
      ])
    );

    setStepNumber(curHistory.length);
    console.log(curHistory[curHistory.length - 1]);

    let nextTurn = turn === config.playerX ? config.playerO : config.playerX;
    setTurn(nextTurn);

    return true;
  }

  function checkWin(row, col, user, stepNumber) {
    if (stepNumber === 0) {
      return null;
    }

    const current = history[stepNumber];
    const cells = current.cells.slice();

    // Get coordinates
    let coorX = row;
    let coorY = col;

    let countCol = 1;
    let countRow = 1;
    let countMainDiagonal = 1;
    let countSkewDiagonal = 1;
    let isBlock;
    const rival = user === config.xPlayer ? config.oPlayer : config.xPlayer;

    // Check col
    isBlock = true;
    let winCells = [];
    coorX -= 1;
    while (coorX >= 0 && cells[coorX][coorY] === user) {
      countCol += 1;
      winCells.push([coorX, coorY]);
      coorX -= 1;
    }
    if (coorX >= 0 && cells[coorX][coorY] !== rival) {
      isBlock = false;
    }
    coorX = row;
    winCells.push([coorX, coorY]);
    coorX += 1;
    while (coorX <= config.brdSize - 1 && cells[coorX][coorY] === user) {
      countCol += 1;
      winCells.push([coorX, coorY]);
      coorX += 1;
    }
    if (coorX <= config.brdSize - 1 && cells[coorX][coorY] !== rival) {
      isBlock = false;
    }
    coorX = row;
    if (isBlock === false && countCol >= 5) return winCells;

    // Check row
    isBlock = true;
    winCells = [];
    coorY -= 1;
    while (coorY >= 0 && cells[coorX][coorY] === user) {
      countRow += 1;
      winCells.push([coorX, coorY]);
      coorY -= 1;
    }
    if (coorY >= 0 && cells[coorX][coorY] !== rival) {
      isBlock = false;
    }
    coorY = col;
    winCells.push([coorX, coorY]);
    coorY += 1;
    while (coorY <= config.brdSize - 1 && cells[coorX][coorY] === user) {
      countRow += 1;
      winCells.push([coorX, coorY]);
      coorY += 1;
    }
    if (coorY <= config.brdSize - 1 && cells[coorX][coorY] !== rival) {
      isBlock = false;
    }
    coorY = col;
    if (isBlock === false && countRow >= 5) return winCells;

    // Check main diagonal
    isBlock = true;
    winCells = [];
    coorX -= 1;
    coorY -= 1;
    while (coorX >= 0 && coorY >= 0 && cells[coorX][coorY] === user) {
      countMainDiagonal += 1;
      winCells.push([coorX, coorY]);
      coorX -= 1;
      coorY -= 1;
    }
    if (coorX >= 0 && coorY >= 0 && cells[coorX][coorY] !== rival) {
      isBlock = false;
    }
    coorX = row;
    coorY = col;
    winCells.push([coorX, coorY]);
    coorX += 1;
    coorY += 1;
    while (
      coorX <= config.brdSize - 1 &&
      coorY <= config.brdSize - 1 &&
      cells[coorX][coorY] === user
    ) {
      countMainDiagonal += 1;
      winCells.push([coorX, coorY]);
      coorX += 1;
      coorY += 1;
    }
    if (
      coorX <= config.brdSize - 1 &&
      coorY <= config.brdSize - 1 &&
      cells[coorX][coorY] !== rival
    ) {
      isBlock = false;
    }
    coorX = row;
    coorY = col;
    if (isBlock === false && countMainDiagonal >= 5) return winCells;

    // Check skew diagonal
    isBlock = true;
    winCells = [];
    coorX -= 1;
    coorY += 1;
    while (coorX >= 0 && coorY >= 0 && cells[coorX][coorY] === user) {
      countSkewDiagonal += 1;
      winCells.push([coorX, coorY]);
      coorX -= 1;
      coorY += 1;
    }
    if (coorX >= 0 && coorY >= 0 && cells[coorX][coorY] !== rival) {
      isBlock = false;
    }
    coorX = row;
    coorY = col;
    winCells.push([coorX, coorY]);
    coorX += 1;
    coorY -= 1;
    while (
      coorX <= config.brdSize - 1 &&
      coorY <= config.brdSize - 1 &&
      cells[coorX][coorY] === user
    ) {
      countSkewDiagonal += 1;
      winCells.push([coorX, coorY]);
      coorX += 1;
      coorY -= 1;
    }
    if (
      coorX <= config.brdSize - 1 &&
      coorY <= config.brdSize - 1 &&
      cells[coorX][coorY] !== rival
    ) {
      isBlock = false;
    }
    if (isBlock === false && countSkewDiagonal >= 5) return winCells;

    return null;
  }

  return (
    <GameContext.Provider
      value={{
        history,
        stepNumber,
        turn,
        gameover,
        winCells,
        isWaiting,
        roomInfo,
        playerType,
        handleClick,
        setRoomId,
        setPlayerType,
      }}
    >
      {props.children}
    </GameContext.Provider>
  );
};
