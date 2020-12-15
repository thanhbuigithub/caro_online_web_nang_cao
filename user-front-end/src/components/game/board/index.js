import React, { useContext } from "react";
import { useState } from "react";
import "./index.css";
import Cell from "../cell";
import GameContext from "../../../contexts/GameContext";
import Config from "../../../config/Config";
//-------------- Board --------------

function Board({}) {
  const { history, stepNumber } = useContext(GameContext);
  const cells = history[stepNumber].cells;
  const cellsDiv = [];

  for (let i = 0; i < cells.length; i += 1) {
    for (let j = 0; j < cells[i].length; j += 1) {
      const key = i * Config.boardSize.col + j;

      cellsDiv.push(<Cell value={cells[i][j]} row={i} col={j} key={key} />);
    }
  }

  return <div className="board">{cellsDiv}</div>;
}

export default Board;
