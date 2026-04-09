const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const aiConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema],
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

aiConversationSchema.index({ user: 1, lastMessageAt: -1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);