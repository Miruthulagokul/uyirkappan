const express = require('express');
const { hospitals } = require('../data/seed');

const router = express.Router();

// GET /api/hospitals — Get all hospitals
router.get('/', (req, res) => {
  res.json(hospitals);
});

// GET /api/hospitals/nearby — Get nearby hospitals, optionally filtered by capabilities
router.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const needs = req.query.needs; // comma-separated or array

  let result = [...hospitals];

  // Filter by capabilities if specified
  if (needs) {
    const needsArr = Array.isArray(needs) ? needs : needs.split(',');
    result = result.filter(h =>
      needsArr.some(need => h.capabilities.includes(need.trim()))
    );
  }

  // Sort by distance if coordinates provided
  if (!isNaN(lat) && !isNaN(lng)) {
    result = result.map(h => {
      const dx = h.location.lat - lat;
      const dy = h.location.lng - lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111000;
      return { ...h, distance: Math.round(dist), eta: Math.round(dist / 500) * 60 };
    }).sort((a, b) => a.distance - b.distance);
  }

  res.json(result);
});

module.exports = router;
