const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  videoUrl: String,
  durationMinutes: { type: Number, default: 0 },
  orderIndex: { type: Number, default: 0 }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  difficulty: { type: Number, enum: [1, 2, 3], default: 1 },
  difficultyName: String,
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }],
  lessons: [lessonSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

courseSchema.virtual('difficultyLabel').get(function() {
  const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
  return labels[this.difficulty];
});

courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
