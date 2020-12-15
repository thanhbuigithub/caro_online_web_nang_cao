import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import useStyles from "./muiStyle";
import "./index.css";
import socketManager from "../../socketio/SocketManager";
import jwt_decode from "jwt-decode";
import Auth from "../common/router/auth";

function Home() {
  const classes = useStyles();
  let history = useHistory();
  const [listUserOnline, setListUserOnline] = useState([]);

  useEffect(() => {
    const token = Auth.getAccessToken();
    const user = jwt_decode(token);
    let socket = socketManager.getSocket();
    socket.emit("join", user.username);
    socket.on("new_connect", (list_user_online) => {
      console.log("New Connect");
      setListUserOnline(list_user_online);
    });

    return () => {
      socketManager.closeSocket();
    };
  }, []);

  return (
    <div className="home-container">
      <div>Danh sách người chơi online:</div>
      <ul>
        {listUserOnline.map((user) => (
          <li>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
