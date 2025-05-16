const prisma = require('../models');
const { ApiError } = require('../utils/errors');

// Create a new parking request
const createRequest = async (requestData, userId) => {
  const { parkId, spotId, startTime, endTime } = requestData;

  // Check if park exists and is approved
  const park = await prisma.park.findUnique({
    where: {
      id: parkId,
      isApproved: true
    }
  });

  if (!park) {
    throw new ApiError('Park not found or not approved', 404);
  }

  // Check if spot exists and belongs to the park
  const spot = await prisma.spot.findUnique({
    where: {
      id: spotId,
      parkId
    }
  });

  if (!spot) {
    throw new ApiError('Spot not found or does not belong to the specified park', 404);
  }

  // Parse dates
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError('Invalid date format', 400);
  }

  if (start >= end) {
    throw new ApiError('End time must be after start time', 400);
  }

  // Check if the spot is available for the requested time
  const overlappingRequests = await prisma.request.findMany({
    where: {
      spotId,
      status: 'APPROVED',
      OR: [
        { 
          AND: [
            { startTime: { lte: end } },
            { endTime: { gte: start } }
          ]
        }
      ]
    }
  });

  if (overlappingRequests.length > 0) {
    throw new ApiError('Spot is not available for the requested time', 400);
  }

  // Calculate total amount based on hourly rate and duration
  const hours = Math.ceil((end - start) / (1000 * 60 * 60));
  const totalAmount = park.hourlyRate * hours;

  // Create the request
  const request = await prisma.request.create({
    data: {
      startTime: start,
      endTime: end,
      totalAmount,
      userId,
      parkId,
      spotId
    },
    include: {
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
    }
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
          address: true
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
          name: true,
          email: true
        }
      },
      park: {
        select: {
          name: true,
          address: true
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
          name: true,
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
    where: {
      id: requestId
    },
    include: {
      park: true
    }
  });

  if (!request) {
    throw new ApiError('Request not found', 404);
  }

  // Check if user is the owner of the park
  if (request.park.ownerId !== userId) {
    throw new ApiError('Not authorized to update this request', 403);
  }

  // If approving, check if spot is still available
  if (status === 'APPROVED') {
    const overlappingRequests = await prisma.request.findMany({
      where: {
        id: { not: requestId },
        spotId: request.spotId,
        status: 'APPROVED',
        OR: [
          { 
            AND: [
              { startTime: { lte: request.endTime } },
              { endTime: { gte: request.startTime } }
            ]
          }
        ]
      }
    });

    if (overlappingRequests.length > 0) {
      throw new ApiError('Spot is no longer available for the requested time', 400);
    }
  }

  const updatedRequest = await prisma.request.update({
    where: {
      id: requestId
    },
    data: {
      status
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      park: {
        select: {
          name: true,
          address: true
        }
      },
      spot: {
        select: {
          spotNumber: true
        }
      }
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

module.exports = {
  createRequest,
  getUserRequests,
  getParkOwnerRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest
};