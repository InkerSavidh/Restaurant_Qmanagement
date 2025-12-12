// frontend/hooks/useSocketManager.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Singleton WebSocket Manager
class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data?: any) => void>> = new Map();
  private connectionStatus: ConnectionStatus = 'disconnected';
  private error: string | null = null;
  private statusCallbacks: Set<(status: ConnectionStatus, error?: string | null) => void> = new Set();

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    if (this.socket) return; // Already initialized

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
      timeout: 20000,
      forceNew: false,
      // Match backend settings
      upgrade: true,
      rememberUpgrade: true,
      // Connection stability
      autoConnect: true,
      closeOnBeforeunload: false,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.setConnectionStatus('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        this.setConnectionStatus('disconnected', 'Server disconnected the connection');
      } else if (reason === 'transport close') {
        this.setConnectionStatus('disconnected', 'Connection lost. Attempting to reconnect...');
      } else {
        this.setConnectionStatus('disconnected');
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      this.setConnectionStatus('error', `Connection error: ${err.message}`);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
      this.setConnectionStatus('reconnecting', `Reconnecting... (attempt ${attemptNumber})`);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.setConnectionStatus('connected');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts');
      this.setConnectionStatus('error', 'Failed to reconnect. Please refresh the page.');
    });

    // Handle connection confirmation
    this.socket.on('connection:confirmed', (data) => {
      console.log('🤝 Connection confirmed:', data);
    });

    // Heartbeat mechanism to keep connection alive
    this.socket.on('pong', () => {
      // Connection is alive
    });

    // Send periodic heartbeat
    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Every 30 seconds
  }

  private setConnectionStatus(status: ConnectionStatus, error?: string | null) {
    this.connectionStatus = status;
    this.error = error || null;
    this.statusCallbacks.forEach(callback => callback(status, this.error));
  }

  // Subscribe to connection status changes
  onStatusChange(callback: (status: ConnectionStatus, error?: string | null) => void) {
    this.statusCallbacks.add(callback);
    // Immediately call with current status
    callback(this.connectionStatus, this.error);
    
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  // Add event listener
  addEventListener(event: string, handler: (data?: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
      // Register with socket only once per event type
      this.socket?.on(event, (data) => {
        const handlers = this.listeners.get(event);
        handlers?.forEach(h => {
          try {
            h(data);
          } catch (error) {
            console.error(`Error in ${event} handler:`, error);
          }
        });
      });
    }
    
    this.listeners.get(event)?.add(handler);
    
    // Return cleanup function
    return () => {
      const handlers = this.listeners.get(event);
      handlers?.delete(handler);
      
      // If no more handlers, remove socket listener
      if (handlers?.size === 0) {
        this.socket?.off(event);
        this.listeners.delete(event);
      }
    };
  }

  // Get current status
  getStatus(): { status: ConnectionStatus; error: string | null } {
    return { status: this.connectionStatus, error: this.error };
  }

  // Get socket instance (for direct access if needed)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Hook to use the singleton socket manager
export const useSocket = (events: { [event: string]: (data?: any) => void }) => {
  const manager = SocketManager.getInstance();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const cleanupFunctions = useRef<(() => void)[]>([]);

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = manager.onStatusChange((status, err) => {
      setConnectionStatus(status);
      setError(err || null);
    });
    
    return unsubscribe;
  }, [manager]);

  // Register event listeners
  useEffect(() => {
    // Clean up previous listeners
    cleanupFunctions.current.forEach(cleanup => cleanup());
    cleanupFunctions.current = [];

    // Register new listeners
    Object.entries(events).forEach(([event, handler]) => {
      const cleanup = manager.addEventListener(event, handler);
      cleanupFunctions.current.push(cleanup);
    });

    // Cleanup on unmount or events change
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, [events, manager]);

  return { 
    socket: manager.getSocket(), 
    connectionStatus, 
    error 
  };
};