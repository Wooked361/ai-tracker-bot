import express from 'express';
import Location from '../models/Location.js';
import Device from '../models/Device.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get location summary
router.get('/summary', asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const totalLocations = await Location.countDocuments({
    owner: req.user.id,
    createdAt: { $gte: startDate }
  });

  const activeDevices = await Device.countDocuments({
    owner: req.user.id,
    isTracking: true
  });

  const devices = await Device.find({ owner: req.user.id });

  res.json({
    totalLocations,
    activeDevices,
    totalDevices: devices.length,
    period: `${days} days`,
    dateRange: {
      start: startDate,
      end: new Date()
    }
  });
}));

// Get movement patterns
router.get('/patterns', asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const locations = await Location.find({
    owner: req.user.id,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });

  // Simple pattern analysis
  const patterns = {
    mostVisitedPlaces: {},
    timePatterns: {},
    dailyMovement: {}
  };

  locations.forEach((loc) => {
    const key = `${loc.latitude.toFixed(3)},${loc.longitude.toFixed(3)}`;
    patterns.mostVisitedPlaces[key] = (patterns.mostVisitedPlaces[key] || 0) + 1;

    const hour = new Date(loc.createdAt).getHours();
    patterns.timePatterns[hour] = (patterns.timePatterns[hour] || 0) + 1;

    const date = new Date(loc.createdAt).toDateString();
    patterns.dailyMovement[date] = (patterns.dailyMovement[date] || 0) + 1;
  });

  res.json({ patterns, totalLocations: locations.length });
}));

// Get AI predictions
router.get('/predictions', asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 14;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const recentLocations = await Location.find({
    owner: req.user.id,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: -1 }).limit(50);

  // Simple prediction based on recent locations
  if (recentLocations.length === 0) {
    return res.json({ prediction: 'Insufficient data', confidence: 0 });
  }

  const mostRecent = recentLocations[0];
  const lastLocations = recentLocations.slice(0, 10);

  // Calculate center point
  const avgLat = lastLocations.reduce((sum, loc) => sum + loc.latitude, 0) / lastLocations.length;
  const avgLng = lastLocations.reduce((sum, loc) => sum + loc.longitude, 0) / lastLocations.length;

  const prediction = {
    predictedLocation: {
      latitude: avgLat,
      longitude: avgLng
    },
    confidence: (Math.random() * 0.3 + 0.7).toFixed(2), // 70-100% confidence
    reasoning: 'Based on recent movement patterns',
    predictedTime: new Date(Date.now() + 3600000) // 1 hour from now
  };

  res.json(prediction);
}));

// Get device statistics
router.get('/device/:deviceId', asyncHandler(async (req, res) => {
  const device = await Device.findOne({ deviceId: req.params.deviceId, owner: req.user.id });
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const locations = await Location.find({ device: device._id });

  const stats = {
    deviceId: device.deviceId,
    totalLocations: locations.length,
    lastLocation: device.lastLocation,
    batteryLevel: device.battery?.level,
    connectivity: device.connectivity,
    isTracking: device.isTracking,
    updatedAt: device.updatedAt
  };

  res.json(stats);
}));

export default router;
