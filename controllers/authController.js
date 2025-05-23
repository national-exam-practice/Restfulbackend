const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/errors');
const authService = require('../services/aurhService');
const { addToBlocklist } = require('../services/tokernService');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }

    const user = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }

    const user = await authService.loginUser(req.body);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error)
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// This is to logout
const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new ApiError('No token provided', 400));
    }

    // Add token to blocklist
    await addToBlocklist(token);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }

    const user = await authService.resetPassword(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  resetPassword
};