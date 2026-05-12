const express = require('express');
const { drivers, driverEarnings, tripHistory } = require('../data/seed');

const router = express.Router();

// GET /api/drivers — Get all drivers
router.get('/', (req, res) => {
  res.json(drivers);
});

// GET /api/drivers/:id/earnings — Get driver earnings
router.get('/:id/earnings', (req, res) => {
  // In production, compute from actual trip data per driver
  res.json(driverEarnings);
});

// GET /api/drivers/:id/trips — Get driver trip history
router.get('/:id/trips', (req, res) => {
  // In production, filter by driver ID
  res.json(tripHistory);
});

// PATCH /api/drivers/:id/status — Update driver online/offline status
router.patch('/:id/status', (req, res) => {
  const { isOnline } = req.body;
  const driver = drivers.find(d => d.id === req.params.id);

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  driver.isOnline = isOnline;

  // Broadcast driver status change via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.emit('driver_status_changed', { driverId: driver.id, isOnline });
  }

  res.json(driver);
});

module.exports = router;
