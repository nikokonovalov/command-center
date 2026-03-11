import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

// If we're in the browser, connect to the exact same host/port that served us.
// If window is undefined (e.g. during SSR), fallback to localhost:3001
const SOCKET_URL = typeof window !== 'undefined'
    ? window.location.origin
    // Connect directly to the backend to bypass Vite proxy flakiness
    : 'http://localhost:3001';

// Create the socket globally so React Strict Mode (which double-mounts components)
// doesn't create multiple connections.
const socketInstance = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    transports: ['polling', 'websocket'],
});

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
    const socket = socketInstance;

    useEffect(() => {

        // Only used for debugging in local development
        function onConnect() {
            console.log(`[Socket.io] Connected to ${SOCKET_URL} with ID: ${socket.id}`);
        }

        function onDisconnect(reason: string) {
            console.log(`[Socket.io] Disconnected: ${reason}`);
        }

        function onConnectError(err: Error) {
            console.error(`[Socket.io] Connection Error: ${err.message}`);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);

            // Do NOT disconnect the socket on unmount because it's a global singleton
            // If we disconnect here, React Strict Mode remounting will break the connection permanently
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket(): Socket {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return socket;
}
