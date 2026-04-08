const mongoose = require('mongoose');

const studySessionProgressSchema = new mongoose.Schema({
  studySession: { type: mongoose.Schema.Types.ObjectId, ref: 'StudySession', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  progress: { type: Number, default: 0 },
  lastPosition: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const StudySessionProgress = mongoose.model('StudySessionProgress', studySessionProgressSchema);

const studySessionSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  subTopic: { type: String, required: true },
  fileUrl: { type: String },
  originalFileName: { type: String },
  fileContent: { type: String },
  linkUrl: { type: String },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  completedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const StudySession = mongoose.model('StudySession', studySessionSchema);

module.exports = { StudySession, StudySessionProgress };