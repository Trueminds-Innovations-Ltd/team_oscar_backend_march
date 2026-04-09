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
const AIConversation = require('../models/AIConversation');

const seedData = async () => {
  try {
    console.log('Seeding database...\n');

    try {
      console.log('Clearing User collection...');
      await User.deleteMany({});
      console.log('  ✓ Users cleared');
    } catch (e) { console.log('  ✗ Users: ' + e.message); }

    try {
      console.log('Clearing Course collection...');
      await Course.deleteMany({});
      console.log('  ✓ Courses cleared');
    } catch (e) { console.log('  ✗ Courses: ' + e.message); }

    try {
      console.log('Clearing Channel collection...');
      await Channel.deleteMany({});
      console.log('  ✓ Channels cleared');
    } catch (e) { console.log('  ✗ Channels: ' + e.message); }

    try {
      console.log('Clearing Progress collection...');
      await Progress.deleteMany({});
      console.log('  ✓ Progress cleared');
    } catch (e) { console.log('  ✗ Progress: ' + e.message); }

    try {
      console.log('Clearing Assignment collection...');
      await Assignment.deleteMany({});
      console.log('  ✓ Assignments cleared');
    } catch (e) { console.log('  ✗ Assignments: ' + e.message); }

    try {
      console.log('Clearing StudySession collection...');
      await StudySession.deleteMany({});
      await StudySessionProgress.deleteMany({});
      console.log('  ✓ StudySessions cleared');
    } catch (e) { console.log('  ✗ StudySessions: ' + e.message); }

    try {
      console.log('Clearing Conversation collection...');
      await Conversation.deleteMany({});
      console.log('  ✓ Conversations cleared');
    } catch (e) { console.log('  ✗ Conversations: ' + e.message); }

    try {
      console.log('Clearing Notification collection...');
      await Notification.deleteMany({});
      console.log('  ✓ Notifications cleared');
    } catch (e) { console.log('  ✗ Notifications: ' + e.message); }

    try {
      console.log('Clearing AIConversation collection...');
      await AIConversation.deleteMany({});
      console.log('  ✓ AIConversations cleared');
    } catch (e) { console.log('  ✗ AIConversations: ' + e.message); }

    console.log('\n✓ All collections cleared!');
    console.log('Real users will be created through registration.\n');
  } catch (error) {
    console.error('Error seeding data:', error.message);
    console.error(error.stack);
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    await seedData();
    console.log('✓ Seed complete! Run "npm run dev" to start the server.');
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