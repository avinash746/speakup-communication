const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  preferredLanguage: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'hi', 'zh', 'ar', 'pt', 'ja', 'ko']
  },
  stats: {
    totalAnalyses: { type: Number, default: 0 },
    avgClarityScore: { type: Number, default: 0 },
    totalWordsImproved: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update stats method
userSchema.methods.updateStats = async function(clarityScore, wordCount) {
  const total = this.stats.totalAnalyses;
  this.stats.totalAnalyses += 1;
  this.stats.avgClarityScore = ((this.stats.avgClarityScore * total) + clarityScore) / (total + 1);
  this.stats.totalWordsImproved += wordCount;
  await this.save();
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
