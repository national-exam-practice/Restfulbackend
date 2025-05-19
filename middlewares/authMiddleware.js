const jwt = require('jsonwebtoken');
const prisma = require('../models');
const { ApiError } = require('../utils/errors');
const { isTokenBlocked } = require('../services/tokernService');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError('Not authorized, no token provided', 401));
    }

    // Check if token is blocked
     const isBlocked = await isTokenBlocked(token);
    if (isBlocked) {
      return next(new ApiError('Token invalidated. Please log in again.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await prisma.users.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    next(new ApiError('Not authorized, token failed', 401));
  }
};

module.exports = { protect };