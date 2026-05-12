const express = require('express');
const { notifications } = require('../data/seed');

const router = express.Router();

// GET /api/notifications — Get all notifications
router.get('/', (req, res) => {
  res.json(notifications);
});

module.exports = router;
