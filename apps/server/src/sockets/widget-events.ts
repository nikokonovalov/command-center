import type { Server } from 'socket.io';
import { generateLiveUsersData, generateActivityFeedData } from '../mocks/generators.js';

export function registerWidgetEvents(io: Server) {
    // ── Live Users: emit to all subscribers every 2 seconds ──
    setInterval(() => {
        io.to('live-users-update').emit('live-users-update', generateLiveUsersData());
    }, 2000);

    // ── Activity Feed: emit a new activity item every 5 seconds ──
    setInterval(() => {
        const activities = generateActivityFeedData();
        io.to('activity-update').emit('activity-update', activities);
    }, 5000);

    // ── Handle client connections ──
    io.on('connection', (socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);

        // Room-based subscription
        socket.on('subscribe', ({ room }: { room: string }) => {
            socket.join(room);
            console.log(`[Socket.io] ${socket.id} joined room: ${room}`);
        });

        socket.on('unsubscribe', ({ room }: { room: string }) => {
            socket.leave(room);
            console.log(`[Socket.io] ${socket.id} left room: ${room}`);
        });

        socket.on('disconnect', (reason) => {
            console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
        });
    });
}
