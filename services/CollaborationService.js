const Channel = require('../models/Channel');

class CollaborationService {
  static async getUserChannels(userId) {
    return Channel.find({
      $or: [
        { 'messages.sender': userId },
        { course: { $exists: true } }
      ]
    }).populate('course', 'title');
  }

  static async getChannelMessages(channelId) {
    const channel = await Channel.findById(channelId);
    if (!channel) throw new Error('Channel not found');
    return channel.messages;
  }

  static async sendMessage(userId, channelId, content) {
    const channel = await Channel.findById(channelId);
    if (!channel) throw new Error('Channel not found');

    channel.messages.push({ sender: userId, content, createdAt: new Date() });
    await channel.save();
    return channel.messages[channel.messages.length - 1];
  }

  static async createChannel(courseId, name, type = 'course') {
    const channel = new Channel({ course: courseId, name, type });
    await channel.save();
    return channel;
  }
}

module.exports = CollaborationService;
