import type { Server } from 'socket.io';
import { generateProductionGrowthData, generateMonthlyCostData } from '../mocks/generators.js';

export function registerWidgetEvents(io: Server) {
    // ── Production Growth (Lifecycle): emit every 3 seconds ──
    setInterval(() => {
        io.to('production-growth-update').emit('production-growth-update', generateProductionGrowthData());
    }, 3000);

    // ── Monthly AI Cost (Risk): emit every 3 seconds ──
    setInterval(() => {
        io.to('monthly-cost-update').emit('monthly-cost-update', generateMonthlyCostData());
    }, 3000);

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
