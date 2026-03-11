import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import widgetRoutes from './routes/widgets.js';
import { registerWidgetEvents } from './sockets/widget-events.js';

import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

// Set up global error handlers to prevent the standalone executable from exiting silently
process.on('uncaughtException', (err) => {
    console.error('\n❌ FATAL UNCAUGHT EXCEPTION:', err);
    console.log("Press [Enter] to exit...");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n❌ FATAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT ?? 3001;

const app = express();
const httpServer = createServer(app);

// Get directory name resiliently (supports both ESM and CJS)
const currentDir = typeof __dirname !== 'undefined' 
    ? __dirname 
    : path.dirname(fileURLToPath(import.meta.url));

// ── Middleware ──
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// ── Static Files (React App) ──
// Serve the built client app from the 'public' directory
const publicDir = path.join(currentDir, 'public');
app.use(express.static(publicDir));

// ── REST Routes ──
app.use(widgetRoutes);

// ── Health Check ──
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── React Router Fallback ──
// Any request that isn't an API route or a static file should return the React index.html
app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/socket.io/')) {
        return next();
    }
    res.sendFile(path.join(publicDir, 'index.html'));
});

// ── Socket.io ──
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
    },
});

registerWidgetEvents(io);

// ── Start ──
httpServer.listen(PORT, async () => {
    console.log(`\n🚀 Command Center Server running on http://localhost:${PORT}`);
    console.log(`   REST:   http://localhost:${PORT}/api/health`);
    console.log(`   Socket: ws://localhost:${PORT}\n`);
    
    // Auto-open browser in production demo mode if not running under Vite
    try {
        // Handle ESM/CJS interop for the 'open' package when bundled
        const opener = (open as any).default || open;
        if (typeof opener === 'function') {
            await opener(`http://localhost:${PORT}`);
        } else {
            console.error('The "open" package did not provide a function. You can manually visit http://localhost:' + PORT);
        }
    } catch (err) {
        console.error('Failed to open browser automatically:', err);
    }
}).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERROR: Port ${PORT} is already in use.`);
        console.error(`   Is the demo or the dev server already running in another window?\n`);
    } else {
        console.error(`\n❌ Server failed to start:`, err.message);
    }
    
    console.log("Press [Enter] to exit...");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
});
