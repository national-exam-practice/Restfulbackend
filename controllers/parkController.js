const { validationResult } = require('express-validator');
const parkService = require('../services/parkService');
const { ApiError } = require('../utils/errors');

// Create a new park
const createPark = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }

    const park = await parkService.createPark(req.body, req.user.id, req.file);
    res.status(201).json({
      success: true,
      data: park,
      message: 'Park created successfully and pending approval from admin'
    });
  } catch (error) {
    next(error);
  }
};

// Get all approved parks
const getAllParks = async (req, res, next) => {
  try {
    const parks = await parkService.getAllParks();
    res.status(200).json({
      success: true,
      count: parks.length,
      data: parks
    });
  } catch (error) {
    next(error);
  }
};

// Get my parks (for owners)
const getMyParks = async (req, res, next) => {
  try {
    const parks = await parkService.getAllParks({ ownerId: req.user.id });
    res.status(200).json({
      success: true,
      count: parks.length,
      data: parks
    });
  } catch (error) {
    next(error);
  }
};

// Get parks pending approval (for admin)
const getPendingParks = async (req, res, next) => {
  try {
    const parks = await parkService.getPendingParks();
    res.status(200).json({
      success: true,
      count: parks.length,
      data: parks
    });
  } catch (error) {
    next(error);
  }
};

// Get park by ID
const getParkById = async (req, res, next) => {
  try {
    const park = await parkService.getParkById(req.params.id);
    res.status(200).json({
      success: true,
      data: park
    });
  } catch (error) {
    next(error);
  }
};

// Update park details
const updatePark = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }

    const park = await parkService.updatePark(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role,
      req.file
    );
    res.status(200).json({
      success: true,
      data: park,
      message: 'Park updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Approve or reject park (admin only)
const approvePark = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    
    if (isApproved === undefined) {
      return next(new ApiError('isApproved field is required', 400));
    }

    const park = await parkService.approvePark(req.params.id, isApproved);
    
    const message = isApproved 
      ? 'Park approved successfully' 
      : 'Park rejected successfully';
    
    res.status(200).json({
      success: true,
      data: park,
      message
    });
  } catch (error) {
    next(error);
  }
};

// Delete park
const deletePark = async (req, res, next) => {
  try {
    const result = await parkService.deletePark(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPark,
  getAllParks,
  getMyParks,
  getPendingParks,
  getParkById,
  updatePark,
  approvePark,
  deletePark
};