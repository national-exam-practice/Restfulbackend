const prisma = require('../models');
const { ApiError } = require('../utils/errors');
const upload = require('../utils/uploadFile');
const fs = require('fs');
const path = require('path');

// Helper function to handle file upload
const handleFileUpload = (file) => {
  if (!file) return null;
  
  // In production, we would upload to a cloud service like S3 here
  // For now, we'll just return the local path
  return `/uploads/${file.filename}`;
};

// Create a new park
const createPark = async (parkData, ownerId, file) => {
  const { code, name, address, totalSpots, hourlyRate, description } = parkData;

  const imageUrl = file ? handleFileUpload(file) : 'https://example.com/default-park-image.jpg';

  const park = await prisma.park.create({
    data: {
      code,
      name,
      address,
      totalSpots: parseInt(totalSpots, 10),
      hourlyRate: parseFloat(hourlyRate),   
      description,
      ownerId,
      image_url: imageUrl
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
          firstname: true,  
          lastname: true, 
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
          firstname: true,  
          lastname: true, 
          email: true
        }
      },
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
          firstname: true,  
          lastname: true, 
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
const updatePark = async (parkId, parkData, userId, userRole, file) => {
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

  let imageUrl = park.image_url;
  if (file) {
    // Delete old image if it exists and is a local file
    if (park.image_url && park.image_url.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '..', 'public', park.image_url);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Error deleting old image:', err);
      });
    }
    imageUrl = handleFileUpload(file);
  }

  const updatedPark = await prisma.park.update({
    where: {
      id: parkId
    },
    data: {
      ...parkData,
      image_url: imageUrl
    }
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

  // Delete associated image if it exists and is a local file
  if (park.image_url && park.image_url.startsWith('/uploads/')) {
    const oldImagePath = path.join(__dirname, '..', 'public', park.image_url);
    fs.unlink(oldImagePath, (err) => {
      if (err) console.error('Error deleting old image:', err);
    });
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