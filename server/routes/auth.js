import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
  body('phone').matches(/^\+?1?\d{9,15}$/)
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Helper to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

// Register
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, phone } = req.body;

  // Check if user exists
  let user = await User.findOne({ $or: [{ email }, { phone }] });
  if (user) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Create new user
  user = new User({ email, password, name, phone });
  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: user._id, email: user.email, name: user.name },
    accessToken,
    refreshToken
  });
}));

// Login
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check if account is locked
  if (user.isAccountLocked()) {
    return res.status(401).json({ error: 'Account is locked. Try again later.' });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  res.json({
    message: 'Login successful',
    user: { id: user._id, email: user.email, name: user.name },
    accessToken,
    refreshToken
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({ accessToken });
  });
}));

// Get current user
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('trackedDevices');
  res.json(user);
}));

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  // Token invalidation happens on client side
  res.json({ message: 'Logout successful' });
});

export default router;
