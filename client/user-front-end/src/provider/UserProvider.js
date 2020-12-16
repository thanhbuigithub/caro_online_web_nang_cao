import React from "react";
import { useState } from "react";
import UserContext from "../contexts/UserContext";
import config from "../config/Config";

export default (props) => {
  const [listUserOnline, setListUserOnline] = useState([]);
  return (
    <UserContext.Provider
      value={{
        listUserOnline,
        setListUserOnline,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};
