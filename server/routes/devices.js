import express from 'express';
import { body, validationResult } from 'express-validator';
import Device from '../models/Device.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Register device
router.post('/', body('name').trim().notEmpty(), body('deviceType').isIn(['mobile', 'tablet', 'web', 'wearable', 'iot']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, deviceType, platform, osVersion, appVersion } = req.body;

  const device = new Device({
    name,
    deviceId: `${deviceType}_${uuidv4()}`,
    owner: req.user.id,
    deviceType,
    platform: platform || 'unknown',
    osVersion,
    appVersion,
    apiKey: uuidv4()
  });

  await device.save();

  // Add to user's tracked devices
  await User.findByIdAndUpdate(req.user.id, {
    $push: { trackedDevices: device._id }
  });

  res.status(201).json({
    message: 'Device registered successfully',
    device: {
      _id: device._id,
      name: device.name,
      deviceId: device.deviceId,
      apiKey: device.apiKey,
      deviceType: device.deviceType
    }
  });
}));

// Get all devices
router.get('/', asyncHandler(async (req, res) => {
  const devices = await Device.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json({ devices, total: devices.length });
}));

// Get device by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const device = await Device.findOne({ _id: req.params.id, owner: req.user.id });

  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  res.json(device);
}));

// Update device
router.patch('/:id', asyncHandler(async (req, res) => {
  const { name, isTracking } = req.body;

  const device = await Device.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { ...(name && { name }), ...(isTracking !== undefined && { isTracking }) },
    { new: true }
  );

  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  res.json({ message: 'Device updated', device });
}));

// Delete device
router.delete('/:id', asyncHandler(async (req, res) => {
  const device = await Device.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  res.json({ message: 'Device deleted successfully' });
}));

export default router;
