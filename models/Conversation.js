const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  program: { type: String, required: true },
  subTopic: { type: String },
  initialQuestion: { type: String },
  lastMessage: { type: String },
  lastMessageAt: { type: Date },
  studentUnread: { type: Boolean, default: false },
  tutorUnread: { type: Boolean, default: false },
  messages: [messageSchema]
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ student: 1, lastMessageAt: -1 });
conversationSchema.index({ tutor: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);