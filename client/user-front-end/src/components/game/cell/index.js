import React, { useContext } from "react";
import { useState } from "react";
import "./index.css";
import config from "../../../config/Config";
import GameContext from "../../../contexts/GameContext";
import SocketManager from "../../../socketio/SocketManager";

function checkWinCell(winCells, row, col) {
  if (winCells == null) {
    return false;
  }

  for (let i = 0; i < winCells.length; i += 1) {
    const curCell = winCells[i];
    if (curCell[0] === row && curCell[1] === col) {
      return true;
    }
  }
  return false;
}

function Cell({ value, row, col }) {
  const { playerType, turn, handleClick, winCells } = useContext(GameContext);
  const socket = SocketManager.getSocket();

  const needToDisable = false;
  const isPlayerX = playerType === config.playerX;
  const isTurnX = turn === config.playerX;
  const isWinnerCell = checkWinCell(winCells, row, col);

  const onClick = () => {
    // Prevent user click if rival is disconnected
    if (needToDisable) {
      return;
    }

    // Prevent user click if not his turn
    if ((isPlayerX && !isTurnX) || (!isPlayerX && isTurnX)) {
      return;
    }

    // Send move to server if it is valid
    if (handleClick(row, col)) {
      console.log(`Socket: emit: move ${row} ${col}`);
      socket.emit("move", { row: row, col: col });
    }

    console.log(`Cell: OnClick ${row} ${col}`);
  };

  return (
    <div
      className={`cell ${isWinnerCell ? "winner-cell" : ""}`}
      onClick={onClick}
      row={row}
      col={col}
    >
      {value}
    </div>
  );
}

export default Cell;
