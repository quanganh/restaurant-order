import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    console.log('SocketContext: Initializing socket connection...');

    let connectionTimeout;

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      timeout: 10000, // 10 second timeout
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Set a timeout for connection
    connectionTimeout = setTimeout(() => {
      if (!isConnected) {
        console.warn('SocketContext: Connection timeout, marking as initialized');
        setIsInitialized(true);
        setConnectionError('Connection timeout');
      }
    }, 15000); // 15 second timeout

    newSocket.on('connect', () => {
      console.log('SocketContext: Connected to server');
      clearTimeout(connectionTimeout);
      setIsConnected(true);
      setIsInitialized(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('SocketContext: Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('SocketContext: Connection error:', error);
      clearTimeout(connectionTimeout);
      setIsConnected(false);
      setIsInitialized(true);
      setConnectionError(error.message || 'Connection failed');
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('SocketContext: Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('SocketContext: Reconnection error:', error);
      setConnectionError('Reconnection failed');
    });

    setSocket(newSocket);

    return () => {
      console.log('SocketContext: Cleaning up socket connection');
      clearTimeout(connectionTimeout);
      newSocket.close();
    };
  }, []);

  // Helper function to safely emit events
  const safeEmit = (event, data) => {
    if (socket && typeof socket.emit === 'function' && isConnected) {
      try {
        socket.emit(event, data);
      } catch (error) {
        console.error(`Error emitting ${event}:`, error);
      }
    } else {
      console.warn(`Socket not ready. Cannot emit ${event}. Socket: ${!!socket}, Socket.emit: ${typeof socket?.emit}, Connected: ${isConnected}`);
    }
  };

  // Helper function to safely add event listeners
  const safeOn = (event, callback) => {
    if (socket && typeof socket.on === 'function' && isConnected) {
      try {
        socket.on(event, callback);
      } catch (error) {
        console.error(`Error adding listener for ${event}:`, error);
      }
    } else {
      console.warn(`Socket not ready. Cannot add listener for ${event}`);
    }
  };

  // Helper function to safely remove event listeners
  const safeOff = (event, callback) => {
    if (socket && typeof socket.off === 'function' && isConnected) {
      try {
        socket.off(event, callback);
      } catch (error) {
        console.error(`Error removing listener for ${event}:`, error);
      }
    }
  };

  const joinTable = (tableNumber) => {
    safeEmit('join-table', tableNumber);
  };

  const joinAdmin = () => {
    safeEmit('join-admin');
  };

  const callService = (tableNumber, message) => {
    safeEmit('call-service', { tableNumber, message });
  };

  const updateOrderStatus = (orderData) => {
    safeEmit('order-update', orderData);
  };

  const value = {
    socket,
    isConnected,
    isInitialized,
    connectionError,
    joinTable,
    joinAdmin,
    callService,
    updateOrderStatus,
    safeEmit,
    safeOn,
    safeOff
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
