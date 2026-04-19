const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const { asyncHandler } = require('../middleware/error.middleware');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => e.msg) });
  }

  const { name, email, password, preferredLanguage } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password, preferredLanguage: preferredLanguage || 'en' });
  const token = generateToken(user._id);

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      stats: user.stats
    }
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => e.msg) });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account deactivated. Contact support.' });
  }

  const token = generateToken(user._id);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      stats: user.stats
    }
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
});

// PATCH /api/auth/preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const { preferredLanguage } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { preferredLanguage },
    { new: true, runValidators: true }
  );
  res.json({ message: 'Preferences updated', user });
});

module.exports = { register, login, getMe, updatePreferences };
