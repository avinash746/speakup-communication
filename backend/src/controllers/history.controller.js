const Analysis = require('../models/analysis.model');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /api/history
const getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, tone, language, favorited, search } = req.query;

  const filter = { userId: req.user._id };
  if (tone) filter.tone = tone;
  if (language) filter.language = language;
  if (favorited === 'true') filter.isFavorited = true;
  if (search) {
    filter.$or = [
      { originalText: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [analyses, total] = await Promise.all([
    Analysis.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-suggestions'), // lighter payload for list
    Analysis.countDocuments(filter)
  ]);

  res.json({
    analyses,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

// PATCH /api/history/:id/favorite
const toggleFavorite = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
  if (!analysis) return res.status(404).json({ error: 'Analysis not found.' });

  analysis.isFavorited = !analysis.isFavorited;
  await analysis.save();

  res.json({ message: `Analysis ${analysis.isFavorited ? 'favorited' : 'unfavorited'}`, isFavorited: analysis.isFavorited });
});

// DELETE /api/history/:id
const deleteAnalysis = asyncHandler(async (req, res) => {
  const result = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!result) return res.status(404).json({ error: 'Analysis not found.' });

  res.json({ message: 'Analysis deleted successfully.' });
});

// GET /api/history/stats
const getStats = asyncHandler(async (req, res) => {
  const stats = await Analysis.aggregate([
    { $match: { userId: req.user._id } },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        avgClarity: { $avg: '$scores.clarity' },
        avgTone: { $avg: '$scores.tone' },
        avgVocabulary: { $avg: '$scores.vocabulary' },
        avgOverall: { $avg: '$scores.overall' },
        totalWords: { $sum: '$wordCount.original' },
        toneBreakdown: { $push: '$tone' },
        langBreakdown: { $push: '$language' }
      }
    }
  ]);

  const recentTrend = await Analysis.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(7)
    .select('scores.overall createdAt');

  res.json({
    stats: stats[0] || {},
    recentTrend: recentTrend.reverse()
  });
});

module.exports = { getHistory, toggleFavorite, deleteAnalysis, getStats };
