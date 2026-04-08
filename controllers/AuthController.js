const AuthService = require('../services/AuthService');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  static async signup(req, res, next) {
    try {
      const { name, email, password, role, phone, country, state, city } = req.body;
      const result = await AuthService.signup({ name, email, password, role, phone, country, state, city });

      return successResponse(res, {
        user: result.user,
        confirmationToken: result.confirmationToken
      }, 'Registration successful. Please check your email to confirm your account.', 201);
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Role must be')) {
        return errorResponse(res, error.message, 400);
      }
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });

      return successResponse(res, result, 'Login successful');
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return errorResponse(res, error.message, 401);
      }
      if (error.message === 'Please confirm your email first') {
        return errorResponse(res, error.message, 403);
      }
      next(error);
    }
  }

  static async confirmEmail(req, res, next) {
    try {
      const { token } = req.params;
      const user = await AuthService.confirmEmail(token);

      return successResponse(res, { user }, 'Email confirmed successfully');
    } catch (error) {
      if (error.message === 'Invalid or expired confirmation token') {
        return errorResponse(res, error.message, 400);
      }
      next(error);
    }
  }

  static async getCurrentUser(req, res, next) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, { user: user.toPublicJSON() }, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const User = require('../models/User');
      const { name, phone, country, state, city } = req.body;
      
      const user = await User.findById(req.user.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (country !== undefined) user.country = country;
      if (state !== undefined) user.state = state;
      if (city !== undefined) user.city = city;

      await user.save();

      return successResponse(res, { user: user.toPublicJSON() }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
