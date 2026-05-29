import express from 'express';
import { query, body, validationResult } from 'express-validator';
import Location from '../models/Location.js';
import Device from '../models/Device.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Submit location
router.post('/submit', body('latitude').isFloat(), body('longitude').isFloat(), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { deviceId, latitude, longitude, accuracy, provider, altitude, speed, heading, address } = req.body;

  // Find device
  const device = await Device.findOne({ deviceId, owner: req.user.id });
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  // Create location
  const location = new Location({
    device: device._id,
    owner: req.user.id,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    latitude,
    longitude,
    accuracy,
    provider,
    altitude,
    speed,
    heading,
    address
  });

  await location.save();

  // Update device last location
  device.lastLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
    accuracy,
    timestamp: new Date()
  };
  device.lastSeen = new Date();
  await device.save();

  // Emit to subscribed clients
  const io = req.app.locals.io;
  io.to(`location:${deviceId}`).emit('location_update', {
    deviceId,
    location: { latitude, longitude },
    accuracy,
    timestamp: new Date()
  });

  res.status(201).json({ message: 'Location submitted successfully', location });
}));

// Get all locations for user
router.get('/', query('limit').optional().isInt({ min: 1, max: 100 }), asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const skip = (parseInt(req.query.page) || 1 - 1) * limit;

  const locations = await Location.find({ owner: req.user.id })
    .populate('device')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Location.countDocuments({ owner: req.user.id });

  res.json({ locations, total, page: parseInt(req.query.page) || 1, limit });
}));

// Get device location history
router.get('/device/:deviceId', asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const days = parseInt(req.query.days) || 7;

  const device = await Device.findOne({ deviceId, owner: req.user.id });
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const locations = await Location.find({
    device: device._id,
    createdAt: { $gte: startDate }
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ locations, deviceId, days });
}));

// Get nearby locations (geospatial query)
router.get('/nearby', query('latitude').isFloat(), query('longitude').isFloat(), asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.query;
  const maxDistance = parseInt(req.query.maxDistance) || 5000; // 5km default

  const locations = await Location.find({
    owner: req.user.id,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: maxDistance
      }
    }
  })
    .populate('device')
    .limit(20);

  res.json({ locations, center: { latitude, longitude }, maxDistance });
}));

// Get specific location
router.get('/:id', asyncHandler(async (req, res) => {
  const location = await Location.findOne({ _id: req.params.id, owner: req.user.id }).populate('device');

  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }

  res.json(location);
}));

export default router;
