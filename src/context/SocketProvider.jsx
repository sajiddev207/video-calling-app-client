import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";
import { config } from "../config";
console.log('config________', config);
const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => {
    console.log('!!!!!!!');
    return io(config.url)
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
