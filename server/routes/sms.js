import express from 'express';
import twilio from 'twilio';
import Device from '../models/Device.js';
import Location from '../models/Location.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// SMS command parser
const parseCommand = (message) => {
  const command = message.trim().toUpperCase().split(/\s+/)[0];
  const args = message.trim().toUpperCase().split(/\s+/).slice(1);
  return { command, args, fullMessage: message };
};

// Handle incoming SMS
router.post('/webhook', asyncHandler(async (req, res) => {
  const logger = req.app.locals.logger;
  const { From, Body, MessageSid } = req.body;

  logger.info(`Received SMS from ${From}: ${Body}`);

  try {
    const { command, args } = parseCommand(Body);

    // Find user by phone
    let user = await User.findOne({ phone: From });
    if (!user) {
      await twilioClient.messages.create({
        body: 'Not registered. Visit https://ai-tracker-bot.com to register.',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: From
      });
      return res.sendStatus(200);
    }

    let responseMessage = '';

    switch (command) {
      case 'TRACK':
        // Enable tracking for sender's phone
        let device = await Device.findOne({ owner: user._id, isActive: true });
        if (!device) {
          device = new Device({
            name: `Device ${new Date().getTime()}`,
            deviceId: `sms_${From}_${Date.now()}`,
            owner: user._id,
            deviceType: 'mobile',
            platform: 'unknown'
          });
          await device.save();
        }
        device.isTracking = true;
        await device.save();
        responseMessage = `✓ Tracking enabled for ${device.name}`;
        break;

      case 'STOP':
        // Disable tracking
        await Device.updateMany({ owner: user._id }, { isTracking: false });
        responseMessage = '✓ Tracking disabled';
        break;

      case 'LOCATION':
        // Get current location of all devices
        const devices = await Device.find({ owner: user._id, isTracking: true }).sort({ lastSeen: -1 });
        if (devices.length === 0) {
          responseMessage = 'No active devices found';
        } else {
          const device = devices[0];
          if (device.lastLocation) {
            const { coordinates } = device.lastLocation;
            responseMessage = `📍 ${device.name}: ${coordinates[1]}, ${coordinates[0]} (${device.lastLocation.accuracy}m accuracy)\nhttps://maps.google.com/?q=${coordinates[1]},${coordinates[0]}`;
          } else {
            responseMessage = 'Location not available yet';
          }
        }
        break;

      case 'HISTORY':
        // Get location history
        const days = args[0] ? parseInt(args[0]) : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const locations = await Location.find({
          owner: user._id,
          createdAt: { $gte: startDate }
        }).sort({ createdAt: -1 }).limit(5);

        if (locations.length === 0) {
          responseMessage = `No locations found in last ${days} days`;
        } else {
          responseMessage = `📍 Last ${Math.min(locations.length, 5)} locations:\n`;
          locations.forEach((loc, i) => {
            responseMessage += `${i + 1}. ${loc.latitude}, ${loc.longitude} - ${new Date(loc.createdAt).toLocaleString()}\n`;
          });
        }
        break;

      case 'STATUS':
        // Get tracking status
        const activeDevices = await Device.find({ owner: user._id, isTracking: true });
        responseMessage = `📊 Status: ${activeDevices.length} device(s) tracking\n`;
        for (const dev of activeDevices) {
          responseMessage += `${dev.name}: ${dev.lastSeen ? 'Online' : 'Offline'}\n`;
        }
        break;

      case 'LIST':
        // List all devices
        const allDevices = await Device.find({ owner: user._id });
        if (allDevices.length === 0) {
          responseMessage = 'No devices registered';
        } else {
          responseMessage = `📱 Devices:\n`;
          allDevices.forEach((d, i) => {
            responseMessage += `${i + 1}. ${d.name} (${d.isTracking ? '🟢' : '🔴'})\n`;
          });
        }
        break;

      case 'ALERT':
        // Toggle alerts
        const alertStatus = args[0]?.toLowerCase() === 'on';
        await Device.updateMany({ owner: user._id }, {
          'settings.enableAlerts': alertStatus
        });
        responseMessage = `✓ Alerts ${alertStatus ? 'enabled' : 'disabled'}`;
        break;

      default:
        responseMessage = 'Commands: TRACK, STOP, LOCATION, HISTORY [days], STATUS, LIST, ALERT on|off';
    }

    // Send response SMS
    await twilioClient.messages.create({
      body: responseMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: From
    });

    logger.info(`Sent SMS response to ${From}`);
  } catch (err) {
    logger.error('SMS webhook error:', err);
    await twilioClient.messages.create({
      body: 'Error processing command. Please try again.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: From
    });
  }

  res.sendStatus(200);
}));

// Send SMS command
router.post('/send', asyncHandler(async (req, res) => {
  const { to, message } = req.body;

  const result = await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });

  res.json({ message: 'SMS sent successfully', messageSid: result.sid });
}));

export default router;
