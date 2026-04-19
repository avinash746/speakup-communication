const express = require('express');
const { body } = require('express-validator');
const { createAnalysis, getAnalysis } = require('../controllers/analysis.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

const analysisValidation = [
  body('text')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Text must be 10-5000 characters'),
  body('tone')
    .optional()
    .isIn(['professional', 'casual', 'academic', 'persuasive', 'empathetic', 'neutral'])
    .withMessage('Invalid tone'),
  body('language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'hi', 'zh', 'ar', 'pt', 'ja', 'ko'])
    .withMessage('Unsupported language'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

router.use(authenticate);
router.post('/', analysisValidation, createAnalysis);
router.get('/:id', getAnalysis);

module.exports = router;
