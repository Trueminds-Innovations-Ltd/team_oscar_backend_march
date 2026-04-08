const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  completed: { type: Boolean, default: false },
  lastAccessed: { type: Date, default: Date.now }
}, { timestamps: true });

progressSchema.index({ user: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ user: 1, course: 1 });

module.exports = mongoose.model('Progress', progressSchema);
