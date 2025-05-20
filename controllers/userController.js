const { validationResult } = require('express-validator');
const requestService = require('../services/requestService');
const { ApiError } = require('../utils/errors');

// Create a new parking request
const createRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }

    const request = await requestService.createRequest(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: request,
      message: 'Parking request created successfully and pending approval'
    });
  } catch (error) {
    next(error);
  }
};

// Get all requests for a user
const getUserRequests = async (req, res, next) => {
  try {
    const requests = await requestService.getUserRequests(req.user.id);
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// Get all requests for a park owner
const getParkOwnerRequests = async (req, res, next) => {
  try {
    const requests = await requestService.getParkOwnerRequests(req.user.id);
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// Get request by ID
const getRequestById = async (req, res, next) => {
  try {
    const request = await requestService.getRequestById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Update request status (approve or reject)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return next(new ApiError('Status must be either APPROVED or REJECTED', 400));
    }

    const request = await requestService.updateRequestStatus(
      req.params.id,
      status,
      req.user.id
    );
    
    const message = status === 'APPROVED' 
      ? 'Request approved successfully' 
      : 'Request rejected successfully';
    
    res.status(200).json({
      success: true,
      data: request,
      message
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a request BY  the driver 
const cancelRequest = async (req, res, next) => {
  try {
    const request = await requestService.cancelRequest(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: request,
      message: 'Request canceled successfully'
    });
  } catch (error) {
    next(error);
  }
};

const processExit = async (req, res, next) => {
  try {
    const request = await requestService.exitCar(req.params.id);
    res.status(200).json({
      success: true,
      data: request,
      message: 'Car exit processed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getUserRequests,
  getParkOwnerRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
  processExit
};
