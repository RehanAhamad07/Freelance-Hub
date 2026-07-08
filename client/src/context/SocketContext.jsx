import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { showToast } from '../services/toast.jsx';
import { useLocation, useNavigate } from 'react-router-dom';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let newSocket;
    if (user) {
      newSocket = io('https://freelance-hub-1vrp.onrender.com');
      
      newSocket.on('connect', () => {
        newSocket.emit('join', user.id || user._id);
      });

      newSocket.on('receiveMessage', (message) => {
        console.log("Global Socket Received:", message, "Current Path:", location.pathname);
        if (!window.location.pathname.includes('/chat')) {
          showToast.info(`${message.senderName} sent you a message. Click to view`, 'New Message');
        }
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
