const { validationResult } = require('express-validator');
const spotService = require('../services/spotService');
const { ApiError } = require('../utils/errors');

// Get all spots for a park
const getSpotsByParkId = async (req, res, next) => {
  try {
    const spots = await spotService.getSpotsByParkId(req.params.parkId);
    res.status(200).json({
      success: true,
      count: spots.length,
      data: spots
    });
  } catch (error) {
    next(error);
  }
};

// Get available spots for a park
const getAvailableSpots = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }

    const { startTime, endTime } = req.query;
    const spots = await spotService.getAvailableSpots(
      req.params.parkId,
      startTime,
      endTime
    );

    res.status(200).json({
      success: true,
      count: spots.length,
      data: spots
    });
  } catch (error) {
    next(error);
  }
};

// Get spot by ID
const getSpotById = async (req, res, next) => {
  try {
    const spot = await spotService.getSpotById(req.params.id);
    res.status(200).json({
      success: true,
      data: spot
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSpotsByParkId,
  getAvailableSpots,
  getSpotById
};