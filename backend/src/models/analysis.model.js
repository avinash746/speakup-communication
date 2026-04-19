const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['clarity', 'tone', 'vocabulary', 'grammar', 'conciseness', 'structure'],
    required: true
  },
  original: { type: String, required: true },
  improved: { type: String, required: true },
  explanation: { type: String, required: true },
  impact: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  }
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalText: {
    type: String,
    required: [true, 'Original text is required'],
    minlength: [10, 'Text must be at least 10 characters'],
    maxlength: [5000, 'Text cannot exceed 5000 characters']
  },
  improvedText: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  tone: {
    type: String,
    enum: ['professional', 'casual', 'academic', 'persuasive', 'empathetic', 'neutral'],
    default: 'professional'
  },
  scores: {
    clarity: { type: Number, min: 0, max: 100, required: true },
    tone: { type: Number, min: 0, max: 100, required: true },
    vocabulary: { type: Number, min: 0, max: 100, required: true },
    overall: { type: Number, min: 0, max: 100, required: true }
  },
  suggestions: [suggestionSchema],
  summary: { type: String },
  wordCount: {
    original: { type: Number },
    improved: { type: Number }
  },
  isFavorited: { type: Boolean, default: false },
  tags: [{ type: String, trim: true }]
}, {
  timestamps: true
});

// Index for efficient history queries
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, isFavorited: 1 });

// Virtual for improvement percentage
analysisSchema.virtual('improvementPct').get(function() {
  if (!this.wordCount?.original || !this.wordCount?.improved) return null;
  const diff = this.wordCount.original - this.wordCount.improved;
  return Math.round((diff / this.wordCount.original) * 100);
});

module.exports = mongoose.model('Analysis', analysisSchema);
