const prisma = require('../models');
const { ApiError } = require('../utils/errors');

// Create a new park
const createPark = async (parkData, ownerId) => {
  const { name, address, totalSpots, hourlyRate, description } = parkData;

  const park = await prisma.park.create({
    data: {
      name,
      address,
      totalSpots,
      hourlyRate,
      description,
      ownerId
    }
  });

  return park;
};

// Get all parks
const getAllParks = async (filters = {}) => {
  const { isApproved = true, ownerId } = filters;
  
  const whereClause = { isApproved };
  
  if (ownerId) {
    whereClause.ownerId = ownerId;
  }
  
  const parks = await prisma.park.findMany({
    where: whereClause,
    include: {
      owner: {
        select: {
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          spots: true
        }
      }
    }
  });

  return parks;
};

// Get parks pending approval (for admin)
const getPendingParks = async () => {
  const parks = await prisma.park.findMany({
    where: {
      isApproved: false
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return parks;
};

// Get park by ID
const getParkById = async (parkId) => {
  const park = await prisma.park.findUnique({
    where: {
      id: parkId
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true
        }
      },
      spots: true
    }
  });

  if (!park) {
    throw new ApiError('Park not found', 404);
  }

  return park;
};

// Update park details
const updatePark = async (parkId, parkData, userId, userRole) => {
  const park = await prisma.park.findUnique({
    where: {
      id: parkId
    }
  });

  if (!park) {
    throw new ApiError('Park not found', 404);
  }

  // Check if user is owner of the park or an admin
  if (park.ownerId !== userId && userRole !== 'ADMIN') {
    throw new ApiError('Not authorized to update this park', 403);
  }

  const updatedPark = await prisma.park.update({
    where: {
      id: parkId
    },
    data: parkData
  });

  return updatedPark;
};

// Approve or reject park (admin only)
const approvePark = async (parkId, isApproved) => {
  const park = await prisma.park.findUnique({
    where: {
      id: parkId
    }
  });

  if (!park) {
    throw new ApiError('Park not found', 404);
  }

  const updatedPark = await prisma.park.update({
    where: {
      id: parkId
    },
    data: {
      isApproved
    }
  });

  // If approved, create spots for the park
  if (isApproved) {
    const spotsData = [];
    for (let i = 1; i <= park.totalSpots; i++) {
      spotsData.push({
        spotNumber: `S-${i.toString().padStart(3, '0')}`,
        parkId: park.id
      });
    }

    await prisma.spot.createMany({
      data: spotsData
    });
  }

  return updatedPark;
};

// Delete park
const deletePark = async (parkId, userId, userRole) => {
  const park = await prisma.park.findUnique({
    where: {
      id: parkId
    }
  });

  if (!park) {
    throw new ApiError('Park not found', 404);
  }

  // Check if user is owner of the park or an admin
  if (park.ownerId !== userId && userRole !== 'ADMIN') {
    throw new ApiError('Not authorized to delete this park', 403);
  }

  await prisma.park.delete({
    where: {
      id: parkId
    }
  });

  return { message: 'Park deleted successfully' };
};

module.exports = {
  createPark,
  getAllParks,
  getPendingParks,
  getParkById,
  updatePark,
  approvePark,
  deletePark
};