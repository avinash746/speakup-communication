const { validationResult } = require('express-validator');
const Analysis = require('../models/analysis.model');
const User = require('../models/user.model');
const { analyzeText } = require('../services/ai.service');
const { asyncHandler } = require('../middleware/error.middleware');

// POST /api/analysis
const createAnalysis = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => e.msg) });
  }

  const { text, tone = 'professional', language = 'en', tags = [] } = req.body;

  // Call AI service
  const aiResult = await analyzeText({ text, tone, language });

  // Persist to MongoDB
  const analysis = await Analysis.create({
    userId: req.user._id,
    originalText: text,
    improvedText: aiResult.improvedText,
    language,
    tone,
    scores: aiResult.scores,
    suggestions: aiResult.suggestions,
    summary: aiResult.summary,
    wordCount: {
      original: text.split(/\s+/).filter(Boolean).length,
      improved: aiResult.improvedText.split(/\s+/).filter(Boolean).length
    },
    tags
  });

  // Update user stats
  const user = await User.findById(req.user._id);
  await user.updateStats(aiResult.scores.overall, analysis.wordCount.original);

  res.status(201).json({
    message: 'Analysis complete',
    analysis
  });
});

// GET /api/analysis/:id
const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found.' });
  }

  res.json({ analysis });
});

module.exports = { createAnalysis, getAnalysis };
