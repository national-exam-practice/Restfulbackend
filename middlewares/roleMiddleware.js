const { ApiError } = require('../utils/errors');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(`Role ${req.user.role} is not authorized to access this resource`, 403));
    }

    next();
  };
};

module.exports = { authorize };