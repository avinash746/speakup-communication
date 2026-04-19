const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updatePreferences } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('preferredLanguage').optional().isIn(['en', 'es', 'fr', 'de', 'hi', 'zh', 'ar', 'pt', 'ja', 'ko'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);
router.patch('/preferences', authenticate, updatePreferences);

module.exports = router;
