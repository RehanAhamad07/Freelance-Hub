import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
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
      newSocket = io('http://localhost:5002');
      
      newSocket.on('connect', () => {
        newSocket.emit('join', user.id || user._id);
      });

      newSocket.on('receiveMessage', (message) => {
        console.log("Global Socket Received:", message, "Current Path:", location.pathname);
        if (!window.location.pathname.includes('/chat')) {
          toast.info(`New Message from ${message.senderName}`, {
             onClick: () => navigate('/chat'),
             style: { cursor: 'pointer' }
          });
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
