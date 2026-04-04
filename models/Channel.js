const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const channelSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  name: { type: String, required: true },
  type: { type: String, default: 'course' },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);
