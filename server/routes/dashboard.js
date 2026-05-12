const express = require('express');
const { ambulances, drivers, hospitals, bookings, generateAnalytics } = require('../data/seed');

const router = express.Router();

// GET /api/dashboard/metrics — Get dashboard KPI metrics
router.get('/metrics', (req, res) => {
  const activeTrips = bookings.filter(b =>
    ['ENROUTE', 'AT_PICKUP', 'TO_HOSPITAL', 'ACCEPTED', 'REQUESTED'].includes(b.status)
  ).length;

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalBookings = bookings.length;
  const completionRate = totalBookings > 0
    ? +((completedBookings.length / totalBookings) * 100).toFixed(1)
    : 0;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.fare || 0), 0);

  // Calculate average ETA from active bookings
  const activeBookings = bookings.filter(b =>
    ['ENROUTE', 'AT_PICKUP', 'TO_HOSPITAL'].includes(b.status)
  );
  const avgEta = activeBookings.length > 0
    ? +(activeBookings.reduce((sum, b) => sum + (b.eta || 0), 0) / activeBookings.length / 60).toFixed(1)
    : 8.2;

  // Today's bookings
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.createdAt && b.createdAt.startsWith(today));

  res.json({
    activeTrips,
    avgEta,
    completionRate,
    totalBookings,
    totalRevenue: Math.round(totalRevenue),
    onlineAmbulances: ambulances.filter(a => a.status === 'ONLINE').length,
    totalAmbulances: ambulances.length,
    onlineDrivers: drivers.filter(d => d.isOnline).length,
    totalDrivers: drivers.length,
    registeredHospitals: hospitals.length,
    todayTrips: todayBookings.length || 42,
    todayRevenue: todayBookings.reduce((sum, b) => sum + (b.fare || 0), 0) || 38500,
  });
});

// GET /api/dashboard/analytics — Get analytics data
router.get('/analytics', (req, res) => {
  res.json(generateAnalytics());
});

module.exports = router;
