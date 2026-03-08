import { useEffect, useState } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import type { WidgetDataSource } from '@command-center/types';

interface UseWidgetSocketResult<T> {
    data: T | null;
    isConnected: boolean;
}

/**
 * Generic hook for widgets that receive data via WebSocket.
 * Cleanly handles subscriptions, unsubscriptions, and reconnection states.
 */
export function useWidgetSocket<T>(dataSource: WidgetDataSource): UseWidgetSocketResult<T> {
    const socket = useSocket();
    const [data, setData] = useState<T | null>(null);
    const [isConnected, setIsConnected] = useState(socket.connected);

    const room = dataSource.socketEvent;

    useEffect(() => {
        if (!room) return;

        // We keep a local reference to state to avoid using 'socket.connected' directly
        // in the dependencies, which can cause subtle hook issues.
        let isSubscribed = false;

        const joinRoom = () => {
            if (!isSubscribed) {
                console.log(`[Widget] Emitting subscribe for room: ${room}`);
                socket.emit('subscribe', { room });
                isSubscribed = true;
            }
        };

        const handleData = (payload: T) => {
            console.log(`[Widget] Received data for room ${room}`);
            setData(payload);
        };

        const handleConnect = () => {
            setIsConnected(true);
            // Re-join room on connect to handle connection drops
            isSubscribed = false;
            joinRoom();
        };

        const handleDisconnect = () => {
            setIsConnected(false);
            isSubscribed = false;
        };

        // Attach core event listeners
        socket.on(room, handleData);
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        // Initial check: if socket is already connected when widget mounts, join immediately
        if (socket.connected) {
            setIsConnected(true);
            joinRoom();
        }

        // Cleanup phase
        return () => {
            console.log(`[Widget] Emitting unsubscribe for room: ${room}`);
            socket.emit('unsubscribe', { room });

            socket.off(room, handleData);
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, [socket, room]);

    return { data, isConnected };
}
