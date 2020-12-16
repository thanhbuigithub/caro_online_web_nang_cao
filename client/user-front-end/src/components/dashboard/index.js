import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import useStyles from "./muiStyle";
import "./index.css";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import PersonIcon from "@material-ui/icons/Person";
import Brightness1Icon from "@material-ui/icons/Brightness1";
import Container from "@material-ui/core/Container";
import AddGameButton from "../game/AddGameButton";
import JoinGameButton from "../game/JoinGameButton";
import UserContext from "../../contexts/UserContext";

function Home() {
  const classes = useStyles();
  let history = useHistory();
  const { listUserOnline } = useContext(UserContext);

  function generate(element) {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((value) =>
      React.cloneElement(element, {
        key: value,
      })
    );
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={2} style={{ height: "100%" }}>
        <Grid item xs={3} className={classes.box}>
          <Grid container direction="column">
            <Grid item style={{ position: "sticky", top: "0", zIndex: "2" }}>
              <Paper className={classes.paper}>Online</Paper>
            </Grid>
            <Grid item className={classes.list}>
              <List style={{ padding: 0 }}>
                {listUserOnline.map((user) => (
                  <ListItem className={classes.itemUser}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.username} />
                    <Brightness1Icon className={classes.iconOnline} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={9} className={classes.box}>
          <Container className={classes.cardGrid} maxWidth="xl">
            <Grid container spacing={3} component="span">
              <AddGameButton />
              <JoinGameButton />
            </Grid>
          </Container>
        </Grid>
      </Grid>
    </div>
  );
}

export default Home;
