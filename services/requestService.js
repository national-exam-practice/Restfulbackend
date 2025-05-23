const prisma = require('../models');
const { ApiError } = require('../utils/errors');

const createRequest = async (requestData, userId) => {
  const { parkId, spotId, startTime: inputStartTime, endTime: inputEndTime, plateNumber } = requestData;

  // Check park and spot (existing code)
  const park = await prisma.park.findUnique({ where: { id: parkId, isApproved: true } });
  if (!park) throw new ApiError('Park not found or not approved', 404);

  const spot = await prisma.spot.findUnique({ where: { id: spotId, parkId } });
  if (!spot) throw new ApiError('Spot not found or does not belong to the park', 404);

  // Parse dates
  const now = new Date();
  let start = now;
  let end = null;
  
  if (inputStartTime) {
    start = new Date(inputStartTime);
    if (isNaN(start.getTime())) throw new ApiError('Invalid start time format', 400);
  }

  if (inputEndTime) {
    end = new Date(inputEndTime);
    if (isNaN(end.getTime())) throw new ApiError('Invalid end time format', 400);
    
    // Validate end time must be after start time
    if (end <= start) throw new ApiError('End time must be after start time', 400);
  }

  // Check spot availability
  let overlappingRequests;
  if (end) {
    // Reservation with start and end times
    overlappingRequests = await prisma.request.findMany({
      where: {
        spotId,
        status: 'APPROVED',
        OR: [{
          AND: [
            { startTime: { lte: end } },
            { endTime: { gte: start } }
          ]
        }]
      }
    });
  } else {
    // Ongoing session (endTime null)
    overlappingRequests = await prisma.request.findMany({
      where: {
        spotId,
        status: 'APPROVED',
        OR: [
          { endTime: null }, // Existing ongoing session
          { endTime: { gt: start } } // Ends after the new session's start
        ]
      }
    });
  }

  if (overlappingRequests.length > 0) {
    throw new ApiError('Spot is not available', 400);
  }

  // Calculate totalAmount if endTime is provided
  let totalAmount = 0;
  if (end) {
    // Calculate exact duration in hours with no rounding
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);
    // No minimum hours or rounding - exact time calculation
    totalAmount = park.hourlyRate * durationHours;
    // Round to 2 decimal places for currency
    totalAmount = Math.round(totalAmount * 100) / 100;
  }

  // Create request with conditional fields
  const request = await prisma.request.create({
    data: {
      startTime: start, 
      endTime: end,
      totalAmount,
      userId,
      parkId,
      spotId,
      plateNumber,
    },
    include: { park: true, spot: true }
  });

  return request;
};

// Get all requests for a user
const getUserRequests = async (userId) => {
  const requests = await prisma.request.findMany({
    where: {
      userId
    },
    include: {
      park: {
        select: {
          name: true,
          address: true,
          hourlyRate: true,
        }
      },
      spot: {
        select: {
          spotNumber: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return requests;
};

// Get all requests for a park owner
const getParkOwnerRequests = async (ownerId) => {
  const requests = await prisma.request.findMany({
    where: {
      park: {
        ownerId
      }
    },
    include: {
      user: {
        select: {
          lastname: true,
          firstname: true,
          email: true
        }
      },
      park: {
        select: {
          name: true,
          address: true,
          hourlyRate: true
        }
      },
      spot: {
        select: {
          spotNumber: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return requests;
};

// Get request by ID
const getRequestById = async (requestId, userId, userRole) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId
    },
    include: {
      user: {
        select: {
          id: true,
          lastname: true,
          firstname: true,
          email: true
        }
      },
      park: {
        select: {
          id: true,
          name: true,
          address: true,
          hourlyRate: true,
          ownerId: true
        }
      },
      spot: {
        select: {
          spotNumber: true
        }
      }
    }
  });

  if (!request) {
    throw new ApiError('Request not found', 404);
  }

  // Check if user has access to this request
  const isAuthorized = 
    userId === request.userId || 
    userId === request.park.ownerId || 
    userRole === 'ADMIN';

  if (!isAuthorized) {
    throw new ApiError('Not authorized to access this request', 403);
  }

  return request;
};

// Update request status (approve or reject)
const updateRequestStatus = async (requestId, status, userId) => {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { park: true }
  });

  if (!request) throw new ApiError('Request not found', 404);
  if (request.park.ownerId !== userId) throw new ApiError('Not authorized', 403);

  if (status === 'APPROVED') {
    // Determine request type
    const isReservation = request.startTime && request.endTime;
    const now = new Date();

    const overlappingConditions = isReservation 
      ? // For reservations: Check time overlap
        [{
          AND: [
            { startTime: { lte: request.endTime } },
            { endTime: { gte: request.startTime } }
          ]
        }]
      : // For ongoing sessions: Check active or future reservations
        [
          { endTime: null }, // Other ongoing sessions
          { endTime: { gt: request.startTime || now } }, // Future reservations
          { 
            AND: [
              { startTime: { lte: now } },
              { endTime: { gte: now } }
            ]
          }
        ];

    const overlappingRequests = await prisma.request.findMany({
      where: {
        id: { not: requestId },
        spotId: request.spotId,
        status: 'APPROVED',
        OR: overlappingConditions
      }
    });

    if (overlappingRequests.length > 0) {
      throw new ApiError('Spot is no longer available', 400);
    }
  }

  const updatedRequest = await prisma.request.update({
    where: { id: requestId },
    data: { status },
    include: {
      user: { select: { lastname: true, firstname: true, email: true } },
      park: { select: { name: true, address: true } },
      spot: { select: { spotNumber: true } }
    }
  });

  return updatedRequest;
};

// Cancel a request (user only)
const cancelRequest = async (requestId, userId) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId
    }
  });

  if (!request) {
    throw new ApiError('Request not found', 404);
  }

  // Check if user owns this request
  if (request.userId !== userId) {
    throw new ApiError('Not authorized to cancel this request', 403);
  }

  // Check if request can be canceled (only pending requests can be canceled)
  if (request.status !== 'PENDING') {
    throw new ApiError(`Cannot cancel a request that is already ${request.status.toLowerCase()}`, 400);
  }

  const canceledRequest = await prisma.request.update({
    where: {
      id: requestId
    },
    data: {
      status: 'REJECTED'
    }
  });

  return canceledRequest;
};

// Exit car from parking
const exitCar = async (requestId) => {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { park: true }
  });

  if (!request) throw new ApiError('Request not found', 404);
  if (!request.park) throw new ApiError('Park information not found', 500);
  if (request.endTime) throw new ApiError('Car already exited', 400);
  if (typeof request.park.hourlyRate !== 'number') {
    throw new ApiError('Invalid park rate configuration', 500);
  }

  const exitTime = new Date();
  const startTime = request.startTime || request.createdAt;
  
  // Ensure exit time is always after start time
  if (exitTime <= startTime) {
    throw new ApiError('Exit time must be after start time', 400);
  }
  
  // Calculate exact duration in hours with no rounding or minimum
  const durationMs = exitTime - startTime;
  const durationHours = durationMs / (1000 * 60 * 60);
  
  // Calculate exact amount based on precise time, no minimum
  const totalAmount = Math.round((request.park.hourlyRate * durationHours) * 100) / 100;

  const updatedRequest = await prisma.request.update({
    where: { id: requestId },
    data: {
      endTime: exitTime,
      totalAmount: totalAmount,
      status: 'COMPLETED'
    }
  });

  return updatedRequest;
};

module.exports = {
  createRequest,
  getUserRequests,
  getParkOwnerRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
  exitCar
};