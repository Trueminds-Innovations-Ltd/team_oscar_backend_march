const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  fileUrl: String,
  score: Number,
  feedback: String,
  submittedAt: { type: Date, default: Date.now },
  gradedAt: Date
});

const assignmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId },
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  maxScore: { type: Number, default: 100 },
  submissions: [submissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
