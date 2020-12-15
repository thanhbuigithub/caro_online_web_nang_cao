import { io } from "socket.io-client";

let socket;

let socketManager = {
  openSocket: function () {
    socket = io(process.env.REACT_APP_ENDPOINT);
    return socket;
  },
  getSocket: function () {
    if (socket === undefined) {
      this.openSocket();
    }
    return socket;
  },
  closeSocket: function () {
    socket.disconnect();
    socket.off();
    console.log(socket);
  },
};

export default socketManager;
