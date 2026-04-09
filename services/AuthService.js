const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { ROLE, ROLE_MAP } = require('../config/constants');

class AuthService {
  static async signup({ name, email, password, role, phone, country, state, city }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const roleNum = typeof role === 'string' ? ROLE_MAP[role] : role;
    if (!roleNum || ![ROLE.STUDENT, ROLE.TUTOR].includes(roleNum)) {
      throw new Error('Role must be 1 (student) or 2 (tutor)');
    }

    const confirmationToken = require('uuid').v4();
    const user = new User({
      name, email, password, role: roleNum, confirmationToken,
      phone: phone || '',
      country: country || '',
      state: state || '',
      city: city || ''
    });
    await user.save();
    
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      await sendEmail({
        to: email,
        subject: 'Confirm your TalentFlow account',
        body: `Click here to confirm: ${frontendUrl}/auth/confirm/${confirmationToken}`
      });
    } catch (emailError) {
      console.error('[Email] Failed to send confirmation email, auto-confirming user:', emailError.message);
      user.emailConfirmed = true;
      user.confirmationToken = null;
      await user.save();
    }

    return { user: user.toPublicJSON(), confirmationToken };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const isValid = await user.comparePassword(password);
    if (!isValid) throw new Error('Invalid credentials');

    if (!user.emailConfirmed) throw new Error('Please confirm your email first');

    const token = this.generateToken(user);

    return {
      token,
      user: user.toPublicJSON()
    };
  }

  static async confirmEmail(token) {
    const user = await User.findOneAndUpdate(
      { confirmationToken: token },
      { emailConfirmed: true, confirmationToken: null },
      { new: true }
    );
    if (!user) throw new Error('Invalid or expired confirmation token');
    return user.toPublicJSON();
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = AuthService;
