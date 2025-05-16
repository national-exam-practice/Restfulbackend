const prisma = require('../models');
const { ApiError } = require('../utils/errors');

// Get all spots for a park
const getSpotsByParkId = async (parkId) => {
  const park = await prisma.park.findUnique({
    where: { id: parkId }
  });

  if (!park) {
    throw new ApiError('Park not found', 404);
  }

  const spots = await prisma.spot.findMany({
    where: { parkId }
  });

  return spots;
};

// Get available spots for a park
const getAvailableSpots = async (parkId, startTime, endTime) => {
  const park = await prisma.park.findUnique({
    where: { id: parkId }
  });

  if (!park) {
    throw new ApiError('Park not found', 404);
  }

  // Parse dates to ensure they are valid Date objects
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError('Invalid date format', 400);
  }

  if (start >= end) {
    throw new ApiError('End time must be after start time', 400);
  }

  // Find all spots for the park
  const allSpots = await prisma.spot.findMany({
    where: { parkId }
  });

  // Find spots that have overlapping requests with the given time range
  const occupiedSpotIds = new Set();
  const overlappingRequests = await prisma.request.findMany({
    where: {
      parkId,
      status: 'APPROVED',
      OR: [
        // Case 1: Start time is within the request time range
        { 
          AND: [
            { startTime: { lte: end } },
            { endTime: { gte: start } }
          ]
        }
      ]
    },
    select: {
      spotId: true
    }
  });

  overlappingRequests.forEach(request => {
    occupiedSpotIds.add(request.spotId);
  });

  // Filter out occupied spots
  const availableSpots = allSpots.filter(spot => !occupiedSpotIds.has(spot.id));

  return availableSpots;
};

// Get spot by ID
const getSpotById = async (spotId) => {
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
    include: {
      park: true
    }
  });

  if (!spot) {
    throw new ApiError('Spot not found', 404);
  }

  return spot;
};

module.exports = {
  getSpotsByParkId,
  getAvailableSpots,
  getSpotById
};