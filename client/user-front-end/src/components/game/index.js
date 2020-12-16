import React, { useEffect } from "react";
import { useState, useContext } from "react";
// import "./index.css";
import Board from "./board";
import Grid from "@material-ui/core/grid";
import { makeStyles } from "@material-ui/core/styles";
import GameContext from "../../contexts/GameContext";
import SocketManager from "../../socketio/SocketManager";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}));

function Game({ match }) {
  const classes = useStyles();
  const { setRoomId, handleClick } = useContext(GameContext);
  const socket = SocketManager.getSocket();

  useEffect(() => {
    setRoomId(match.params.id);

    socket.on("new-player-join-room", (username) => {
      console.log(username + " has joined");
    });

    socket.on("move", ({ row, col }) => {
      console.log(`Socket: on: move ${row} ${col}`);
      handleClick(row, col);
    });
  }, []);

  return (
    <div className="game">
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Grid item xs={2} justify="center">
              User
            </Grid>
            <Grid item xs={8} justify="center">
              <Board />
            </Grid>
            <Grid item xs={2} justify="center">
              Chat
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default Game;
