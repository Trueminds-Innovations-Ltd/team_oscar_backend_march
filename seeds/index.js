const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Course = require('../models/Course');
const Channel = require('../models/Channel');
const Progress = require('../models/Progress');
const Assignment = require('../models/Assignment');
const { ROLE, LEVEL } = require('../config/constants');

const seedData = async () => {
  try {
    console.log('Seeding database...\n');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Channel.deleteMany({});
    await Progress.deleteMany({});
    await Assignment.deleteMany({});

    const hashedPassword = await bcrypt.hash('Password123', 12);

    const tutor1 = await User.create({
      name: 'John Tutor',
      email: 'john@tutor.com',
      password: hashedPassword,
      role: ROLE.TUTOR,
      interests: ['UI/UX', 'Frontend'],
      level: LEVEL.ADVANCED,
      emailConfirmed: true
    });

    const tutor2 = await User.create({
      name: 'Sarah Tutor',
      email: 'sarah@tutor.com',
      password: hashedPassword,
      role: ROLE.TUTOR,
      interests: ['Backend', 'DevOps'],
      level: LEVEL.ADVANCED,
      emailConfirmed: true
    });

    const student1 = await User.create({
      name: 'Alice Student',
      email: 'alice@student.com',
      password: hashedPassword,
      role: ROLE.STUDENT,
      interests: ['UI/UX', 'Frontend'],
      level: LEVEL.BEGINNER,
      emailConfirmed: true
    });

    const student2 = await User.create({
      name: 'Bob Student',
      email: 'bob@student.com',
      password: hashedPassword,
      role: ROLE.STUDENT,
      interests: ['Backend', 'DevOps'],
      level: LEVEL.INTERMEDIATE,
      emailConfirmed: true
    });

    const course1 = await Course.create({
      title: 'UI/UX Design Fundamentals',
      description: 'Learn the basics of UI/UX design including wireframing, prototyping, and user research.',
      category: 'Design',
      difficulty: 1,
      tutor: tutor1._id,
      tags: ['UI/UX', 'Frontend'],
      lessons: [
        { title: 'Introduction to UI/UX', content: 'Welcome to UI/UX design!', durationMinutes: 15, orderIndex: 1 },
        { title: 'User Research Methods', content: 'Learn user research.', durationMinutes: 25, orderIndex: 2 },
        { title: 'Wireframing Basics', content: 'Create wireframes.', durationMinutes: 30, orderIndex: 3 }
      ],
      enrolledStudents: [student1._id, student2._id]
    });

    const course2 = await Course.create({
      title: 'Modern React Development',
      description: 'Master React.js with hooks, context, and modern state management.',
      category: 'Development',
      difficulty: 2,
      tutor: tutor1._id,
      tags: ['React', 'JavaScript'],
      lessons: [
        { title: 'React Setup & JSX', content: 'React setup.', durationMinutes: 20, orderIndex: 1 },
        { title: 'Components & Props', content: 'Learn components.', durationMinutes: 25, orderIndex: 2 },
        { title: 'State & useState Hook', content: 'State management.', durationMinutes: 30, orderIndex: 3 }
      ],
      enrolledStudents: [student1._id]
    });

    const course3 = await Course.create({
      title: 'Backend Development with Node.js',
      description: 'Build scalable backend applications using Node.js and Express.',
      category: 'Development',
      difficulty: 2,
      tutor: tutor2._id,
      tags: ['Backend', 'Node.js'],
      lessons: [
        { title: 'Node.js Introduction', content: 'Getting started.', durationMinutes: 15, orderIndex: 1 },
        { title: 'Express.js Framework', content: 'Express.js basics.', durationMinutes: 25, orderIndex: 2 }
      ],
      enrolledStudents: [student2._id]
    });

    tutor1.enrolledCourses = [course1._id, course2._id];
    tutor2.enrolledCourses = [course3._id];
    student1.enrolledCourses = [course1._id, course2._id];
    student2.enrolledCourses = [course1._id, course3._id];
    await tutor1.save();
    await tutor2.save();
    await student1.save();
    await student2.save();

    await Channel.create({
      course: course1._id,
      name: 'General Discussion',
      type: 'course',
      messages: [
        { sender: tutor1._id, content: 'Welcome to the UI/UX course!' },
        { sender: student1._id, content: 'Excited to start learning!' }
      ]
    });

    await Channel.create({
      course: course2._id,
      name: 'General Discussion',
      type: 'course',
      messages: [
        { sender: tutor1._id, content: 'Lets build React apps together!' }
      ]
    });

    await Progress.create({
      user: student1._id,
      course: course1._id,
      lessonId: course1.lessons[0]._id,
      progressPercentage: 100,
      completed: true
    });

    await Assignment.create({
      course: course1._id,
      title: 'Design Your First App',
      description: 'Create a wireframe for a mobile app.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100
    });

    await Assignment.create({
      course: course2._id,
      title: 'Build a Todo App',
      description: 'Create a React todo application.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      maxScore: 100
    });

    console.log('Seed data created successfully!\n');
    console.log('Test Accounts:');
    console.log('Tutor 1: john@tutor.com / Password123');
    console.log('Tutor 2: sarah@tutor.com / Password123');
    console.log('Student 1: alice@student.com / Password123');
    console.log('Student 2: bob@student.com / Password123\n');

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
