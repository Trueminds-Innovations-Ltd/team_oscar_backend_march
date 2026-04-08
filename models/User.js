const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE_MAP } = require('../config/constants');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: Number, required: true, enum: [1, 2] },
  phone: { type: String, default: '' },
  country: { type: String, default: '' },
  state: { type: String, default: '' },
  city: { type: String, default: '' },
  interests: [{ type: String }],
  subTopics: [{ type: String }],
  level: { type: Number, enum: [1, 2, 3], default: 1 },
  emailConfirmed: { type: Boolean, default: false },
  confirmationToken: String,
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

userSchema.virtual('roleName').get(function() {
  return ROLE_MAP[this.role];
});

userSchema.virtual('levelName').get(function() {
  const LEVEL_MAP = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
  return LEVEL_MAP[this.level];
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

  userSchema.methods.toPublicJSON = function() {
    const obj = this.toJSON();
    return {
      ...obj,
      role: this.role,
      roleName: this.roleName,
      level: this.level,
      levelName: this.levelName,
      phone: this.phone || '',
      country: this.country || '',
      state: this.state || '',
      city: this.city || ''
    };
  };

module.exports = mongoose.model('User', userSchema);
