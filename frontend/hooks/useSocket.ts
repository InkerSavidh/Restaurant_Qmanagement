// frontend/hooks/useSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

export const useSocket = (events: { [event: string]: (data?: any) => void }) => {
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef(events);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Update events ref when events change
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setConnectionStatus('connected');
      setError(null);
      
      // Refresh data on reconnection (after initial connection)
      if (socket.recovered === false) {
        console.log('🔄 Refreshing data after reconnection...');
        Object.values(eventsRef.current).forEach(handler => {
          try {
            handler();
          } catch (error) {
            console.error('Error refreshing data on reconnect:', error);
          }
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setConnectionStatus('disconnected');
      
      if (reason === 'io server disconnect') {
        setError('Server disconnected the connection');
      } else if (reason === 'transport close') {
        setError('Connection lost. Attempting to reconnect...');
      }
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setConnectionStatus('error');
      setError(`Connection error: ${err.message}`);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
      setConnectionStatus('reconnecting');
      setError(`Reconnecting... (attempt ${attemptNumber})`);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setConnectionStatus('connected');
      setError(null);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts');
      setConnectionStatus('error');
      setError('Failed to reconnect. Please refresh the page.');
    });

    // Register event listeners
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Cleanup on unmount
    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, connectionStatus, error };
};
