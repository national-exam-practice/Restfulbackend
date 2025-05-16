const { check } = require('express-validator');

// User validation rules
const userValidationRules = {
  register: [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  ],
  login: [
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('password').notEmpty().withMessage('Password is required')
  ]
};

// Park validation rules
const parkValidationRules = {
  create: [
    check('name').notEmpty().withMessage('Park name is required'),
    check('address').notEmpty().withMessage('Address is required'),
    check('totalSpots').isInt({ min: 1 }).withMessage('Total spots must be at least 1'),
    check('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
  ],
  update: [
    check('name').optional().notEmpty().withMessage('Park name cannot be empty'),
    check('address').optional().notEmpty().withMessage('Address cannot be empty'),
    check('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
  ]
};

// Request validation rules
const requestValidationRules = {
  create: [
    check('parkId').notEmpty().withMessage('Park ID is required'),
    check('spotId').notEmpty().withMessage('Spot ID is required'),
    check('startTime').notEmpty().withMessage('Start time is required'),
    check('endTime').notEmpty().withMessage('End time is required')
  ],
  updateStatus: [
    check('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be either APPROVED or REJECTED')
  ]
};

module.exports = {
  userValidationRules,
  parkValidationRules,
  requestValidationRules
};