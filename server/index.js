require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// ── Express Setup ────────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;

// ── CORS ─────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  'http://localhost:8080',   // Vite dev server
  'http://localhost:3000',   // Docker frontend
  'http://localhost:5173',   // Vite default port
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(null, true); // Be permissive in dev — tighten for production
  },
  credentials: true,
}));

app.use(express.json());

// ── Socket.IO ────────────────────────────────────────────────────────────────

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Store io instance on app for use in route handlers
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // ── Join booking room for real-time tracking
  socket.on('join_booking', (bookingId) => {
    const room = `booking:${bookingId}`;
    socket.join(room);
    console.log(`📋 ${socket.id} joined room ${room}`);
  });

  // ── Join emergency room
  socket.on('join_emergency', (requestId) => {
    const room = `emergency:${requestId}`;
    socket.join(room);
    console.log(`🚨 ${socket.id} joined room ${room}`);
  });

  // ── Driver location update
  socket.on('driver_location', (data) => {
    // data: { bookingId?, lat, lng }
    if (data.bookingId) {
      io.to(`booking:${data.bookingId}`).emit('location_update', {
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString(),
      });
    }
    // Broadcast to all for fleet map
    io.emit('fleet_location_update', {
      driverId: socket.id,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
    });
  });

  // ── Booking status change (from driver app)
  socket.on('booking_status', (data) => {
    // data: { bookingId, status }
    io.to(`booking:${data.bookingId}`).emit('status_changed', {
      bookingId: data.bookingId,
      status: data.status,
      updatedAt: new Date().toISOString(),
    });
    console.log(`📊 Booking ${data.bookingId} → ${data.status}`);
  });

  // ── ETA update
  socket.on('eta_update', (data) => {
    // data: { bookingId, eta }
    if (data.bookingId) {
      io.to(`booking:${data.bookingId}`).emit('eta_update', {
        bookingId: data.bookingId,
        eta: data.eta,
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ── Route Mounting ───────────────────────────────────────────────────────────

const authRoutes         = require('./routes/auth');
const bookingRoutes      = require('./routes/bookings');
const emergencyRoutes    = require('./routes/emergency');
const ambulanceRoutes    = require('./routes/ambulances');
const hospitalRoutes     = require('./routes/hospitals');
const driverRoutes       = require('./routes/drivers');
const dashboardRoutes    = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const aiRoutes           = require('./routes/ai');

app.use('/api/auth',          authRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/emergency',     emergencyRoutes);
app.use('/api/ambulances',    ambulanceRoutes);
app.use('/api/hospitals',     hospitalRoutes);
app.use('/api/drivers',       driverRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai',            aiRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'uyirkappan-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error Handler ────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ─────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log('');
  console.log('  🚑  Uyirkappan Backend API');
  console.log('  ─────────────────────────────');
  console.log(`  🌐  HTTP    → http://localhost:${PORT}`);
  console.log(`  🔌  Socket  → ws://localhost:${PORT}`);
  console.log(`  💚  Health  → http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('  Pre-seeded accounts:');
  console.log('    operator@uyir.com  / password123  (OPERATOR)');
  console.log('    driver@uyir.com    / password123  (DRIVER)');
  console.log('    user@uyir.com      / password123  (USER)');
  console.log('');
});
