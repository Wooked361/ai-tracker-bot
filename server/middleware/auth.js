import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const validateDevice = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const device = await Device.findOne({ apiKey });
    if (!device) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    req.device = device;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export default {
  authenticateToken,
  authorizeRole,
  validateDevice
};
