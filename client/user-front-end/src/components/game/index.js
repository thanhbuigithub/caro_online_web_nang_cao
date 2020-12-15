import React from "react";
import { useState } from "react";
// import "./index.css";
import Board from "./board";
import Grid from "@material-ui/core/grid";
import { makeStyles } from "@material-ui/core/styles";
import GameProvider from "../../provider/GameProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}));

function Game({}) {
  const classes = useStyles();
  return (
    <GameProvider>
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
    </GameProvider>
  );
}

export default Game;
