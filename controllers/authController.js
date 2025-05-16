const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/errors');
const authService = require('../services/aurhService');

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
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};