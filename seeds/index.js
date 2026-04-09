const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Course = require('../models/Course');
const Channel = require('../models/Channel');
const Progress = require('../models/Progress');
const Assignment = require('../models/Assignment');
const { StudySession, StudySessionProgress } = require('../models/StudySession');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    console.log('Seeding database...\n');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Channel.deleteMany({});
    await Progress.deleteMany({});
    await Assignment.deleteMany({});
    await StudySession.deleteMany({});
    await StudySessionProgress.deleteMany({});
    await Conversation.deleteMany({});
    await Notification.deleteMany({});

    console.log('All collections cleared.');
    console.log('Real users will be created through registration.\n');

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    await seedData();
    console.log('Setup complete! Run "npm run dev" to start the server.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}

module.exports = seedData;