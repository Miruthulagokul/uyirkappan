const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { emergencyRequests, ambulances, hospitals, bookings } = require('../data/seed');

const router = express.Router();

// POST /api/emergency — Create emergency request
router.post('/', (req, res) => {
  try {
    const { location, emergencyType, patientName, patientPhone, medicalInfo } = req.body;

    if (!location || !emergencyType) {
      return res.status(400).json({ error: 'Location and emergencyType are required' });
    }

    const request = {
      id: `EMR${Date.now()}`,
      location,
      emergencyType,
      patientName: patientName || undefined,
      patientPhone: patientPhone || undefined,
      medicalInfo: medicalInfo || undefined,
      status: 'SEARCHING',
      offers: [],
      createdAt: new Date().toISOString(),
    };

    emergencyRequests.push(request);

    // Notify operators via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new_emergency', request);
    }

    res.status(201).json(request);
  } catch (err) {
    console.error('Create emergency error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/emergency — Get all pending emergency requests
router.get('/', (req, res) => {
  try {
    const pending = emergencyRequests.filter(e => e.status === 'PENDING' || e.status === 'SEARCHING');
    res.json(pending);
  } catch (err) {
    console.error('Get emergencies error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/emergency/:id/offers — Get offers for emergency request
router.get('/:id/offers', (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }

    const onlineAmbulances = ambulances.filter(a => a.status === 'ONLINE');

    const offers = onlineAmbulances.map((amb, i) => {
      const dx = amb.location.lat - lat;
      const dy = amb.location.lng - lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111000; // Approximate meters

      const baseFare = amb.type === 'BLS' ? 500 : amb.type === 'ALS' ? 800 : 1200;
      const perKm = amb.type === 'BLS' ? 15 : amb.type === 'ALS' ? 20 : 25;

      return {
        id: `OFR${Date.now()}_${i}`,
        ambulance: amb,
        distance: Math.round(dist),
        eta: Math.round(dist / 500) * 60,
        fare: Math.round(baseFare + (dist / 1000) * perKm),
      };
    }).sort((a, b) => a.eta - b.eta);

    // Update emergency request status
    const emReq = emergencyRequests.find(e => e.id === req.params.id);
    if (emReq) {
      emReq.status = 'OFFERS_RECEIVED';
      emReq.offers = offers;
    }

    // Broadcast offers via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`emergency:${req.params.id}`).emit('offer_created', { requestId: req.params.id, offers });
    }

    res.json(offers);
  } catch (err) {
    console.error('Get offers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/emergency/:id/accept — Accept an offer
router.post('/:id/accept', (req, res) => {
  try {
    const { offerId } = req.body;
    const emReq = emergencyRequests.find(e => e.id === req.params.id);

    // Create a booking from the accepted offer
    const booking = {
      id: `BKG${Date.now()}`,
      code: `UYR${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'ACCEPTED',
      pickup: emReq ? emReq.location : { lat: 13.0527, lng: 80.2511, address: 'Auto-detected location' },
      hospital: hospitals[0],
      ambulanceType: 'BLS',
      emergencyType: emReq ? emReq.emergencyType : undefined,
      patientName: emReq?.patientName || 'Emergency Patient',
      patientPhone: emReq?.patientPhone || '+919876543210',
      contactPhone: emReq?.patientPhone || '+919876543210',
      fare: 750,
      distance: 5000,
      eta: 480,
      ambulance: ambulances[0],
      medicalInfo: emReq?.medicalInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Try to use the actual offer data
    if (emReq && emReq.offers) {
      const offer = emReq.offers.find(o => o.id === offerId);
      if (offer) {
        booking.ambulance = offer.ambulance;
        booking.ambulanceType = offer.ambulance.type;
        booking.fare = offer.fare;
        booking.distance = offer.distance;
        booking.eta = offer.eta;
      }
    }

    bookings.unshift(booking);

    if (emReq) {
      emReq.status = 'DISPATCHED';
    }

    // Broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('booking_created', booking);
      io.to(`emergency:${req.params.id}`).emit('status_changed', {
        bookingId: booking.id,
        status: 'ACCEPTED',
      });
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error('Accept offer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
