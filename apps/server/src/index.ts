import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import widgetRoutes from './routes/widgets.js';
import { registerWidgetEvents } from './sockets/widget-events.js';

const PORT = process.env.PORT ?? 3001;

const app = express();
const httpServer = createServer(app);

// ── Middleware ──
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// ── REST Routes ──
app.use(widgetRoutes);

// ── Socket.io ──
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
    },
});

registerWidgetEvents(io);

// ── Health Check ──
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ──
httpServer.listen(PORT, () => {
    console.log(`\n🚀 Command Center API running on http://localhost:${PORT}`);
    console.log(`   REST:   http://localhost:${PORT}/api/dashboard/config`);
    console.log(`   Socket: ws://localhost:${PORT}\n`);
});
