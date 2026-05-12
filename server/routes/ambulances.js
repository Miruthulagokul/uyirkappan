const express = require('express');
const { ambulances } = require('../data/seed');

const router = express.Router();

// GET /api/ambulances — Get all ambulances
router.get('/', (req, res) => {
  res.json(ambulances);
});

// GET /api/ambulances/nearby — Get nearby ambulances
router.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (isNaN(lat) || isNaN(lng)) {
    // Return all if no coordinates provided
    return res.json(ambulances);
  }

  // Sort by distance from given coordinates
  const sorted = [...ambulances].map(amb => {
    const dx = amb.location.lat - lat;
    const dy = amb.location.lng - lng;
    const dist = Math.sqrt(dx * dx + dy * dy) * 111000;
    return { ...amb, distance: Math.round(dist) };
  }).sort((a, b) => a.distance - b.distance);

  res.json(sorted);
});

module.exports = router;
