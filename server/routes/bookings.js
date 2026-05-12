const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { bookings, hospitals, ambulances } = require('../data/seed');

const router = express.Router();

// POST /api/bookings — Create a new booking
router.post('/', (req, res) => {
  try {
    const data = req.body;
    const booking = {
      id: `BKG${Date.now()}`,
      code: `UYR${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pickup: data.pickup,
      hospital: data.hospital || hospitals[0],
      ambulanceType: data.ambulanceType || 'BLS',
      emergencyType: data.emergencyType,
      patientName: data.patientName || 'Unknown',
      patientPhone: data.patientPhone || '',
      contactPhone: data.contactPhone || '',
      fare: data.fare || 0,
      distance: data.distance || 0,
      eta: data.eta || 0,
      ambulance: data.ambulance,
      medicalInfo: data.medicalInfo,
    };
    bookings.unshift(booking);

    // Emit via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.emit('booking_created', booking);
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bookings — Get recent bookings
router.get('/', (req, res) => {
  res.json(bookings);
});

// GET /api/bookings/:id — Get booking by ID
router.get('/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    // Return a default booking for demo purposes
    return res.json({
      id: req.params.id,
      code: 'UYRABC123',
      status: 'ENROUTE',
      pickup: { lat: 13.0527, lng: 80.2511, address: '123 Anna Salai, Chennai' },
      hospital: hospitals[0],
      ambulanceType: 'BLS',
      patientName: 'John Doe',
      patientPhone: '+919876543210',
      contactPhone: '+919876543210',
      fare: 750,
      distance: 5000,
      eta: 600,
      ambulance: ambulances[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  res.json(booking);
});

// PATCH /api/bookings/:id/status — Update booking status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const booking = bookings.find(b => b.id === req.params.id);

  if (booking) {
    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    if (status === 'COMPLETED') {
      booking.completedAt = new Date().toISOString();
    }

    // Broadcast status change via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${booking.id}`).emit('status_changed', {
        bookingId: booking.id,
        status: booking.status,
        updatedAt: booking.updatedAt,
      });
    }

    return res.json(booking);
  }

  // If not found, return a synthetic response
  res.json({
    id: req.params.id,
    status,
    updatedAt: new Date().toISOString(),
  });
});

module.exports = router;
