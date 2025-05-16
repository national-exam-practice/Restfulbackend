/**
 * @swagger
 * tags:
 *   name: Parks
 *   description: Park management endpoints
 * 
 * components:
 *   schemas:
 *     ParkInput:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - totalSpots
 *         - hourlyRate
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the parking facility
 *         address:
 *           type: string
 *           description: Physical address of the park
 *         totalSpots:
 *           type: integer
 *           minimum: 1
 *           description: Total number of parking spots available
 *         hourlyRate:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Cost per hour for parking
 *         description:
 *           type: string
 *           description: Additional information about the park
 *     
 *     ParkResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the park
 *         name:
 *           type: string
 *           description: Name of the parking facility
 *         address:
 *           type: string
 *           description: Physical address of the park
 *         totalSpots:
 *           type: integer
 *           description: Total number of parking spots available
 *         availableSpots:
 *           type: integer
 *           description: Number of currently available spots
 *         hourlyRate:
 *           type: number
 *           format: float
 *           description: Cost per hour for parking
 *         description:
 *           type: string
 *           description: Additional information about the park
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           description: Approval status of the park
 *         ownerId:
 *           type: string
 *           description: ID of the owner (user) who created the park
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     ApprovalInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [APPROVED, REJECTED]
 *           description: New status for the park
 *         reason:
 *           type: string
 *           description: Reason for rejection (required if status is REJECTED)
 */

/**
 * @swagger
 * /api/v1/parks:
 *   post:
 *     summary: Create a new parking facility
 *     description: Creates a new park (Owner role required)
 *     tags: [Parks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParkInput'
 *     responses:
 *       201:
 *         description: Park created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ParkResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized (Owner role required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   get:
 *     summary: Get all approved parks
 *     description: Returns a list of all approved parking facilities (authentication required)
 *     tags: [Parks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of approved parks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Total number of parks
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ParkResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/parks/my-parks:
 *   get:
 *     summary: Get parks owned by current user
 *     description: Returns a list of parks created by the authenticated owner
 *     tags: [Parks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ALL]
 *           default: ALL
 *         description: Filter parks by approval status
 *     responses:
 *       200:
 *         description: List of owner's parks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ParkResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized (Owner role required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/parks/pending:
 *   get:
 *     summary: Get parks pending approval
 *     description: Returns a list of parks awaiting approval (Admin role required)
 *     tags: [Parks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of pending parks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ParkResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized (Admin role required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/parks/{id}:
 *   get:
 *     summary: Get a park by ID
 *     description: Returns details of a specific park by its ID
 *     tags: [Parks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Park ID
 *     responses:
 *       200:
 *         description: Park details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ParkResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Park not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   put:
 *     summary: Update a park
 *     description: Updates details of a specific park (owner of the park or admin required)
 *     tags: [Parks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Park ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               hourlyRate:
 *                 type: number
 *                 format: float
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Park updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ParkResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized (must be owner of the park or admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Park not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Delete a park
 *     description: Deletes a specific park (owner of the park or admin required)
 *     tags: [Parks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Park ID
 *     responses:
 *       200:
 *         description: Park deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Park deleted successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized (must be owner of the park or admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Park not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/parks/{id}/approve:
 *   patch:
 *     summary: Approve or reject a park
 *     description: Updates the approval status of a park (Admin role required)
 *     tags: [Parks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Park ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApprovalInput'
 *     responses:
 *       200:
 *         description: Park status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ParkResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized (Admin role required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Park not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const parkController = require('../controllers/parkController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create a new park (Owner only)
router.post(
  '/',
  authorize('OWNER'),
  [
    body('name').notEmpty().withMessage('Park name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('totalSpots').isInt({ min: 1 }).withMessage('Total spots must be at least 1'),
    body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
  ],
  parkController.createPark
);

// Get all approved parks (Public for authenticated users)
router.get('/', parkController.getAllParks);

// Get my parks (Owner only)
router.get('/my-parks', authorize('OWNER'), parkController.getMyParks);

// Get parks pending approval (Admin only)
router.get('/pending', authorize('ADMIN'), parkController.getPendingParks);

// Get park by ID
router.get('/:id', parkController.getParkById);

// Update park (Owner of the park or Admin)
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Park name cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
  ],
  parkController.updatePark
);

// Approve or reject park (Admin only)
router.patch('/:id/approve', authorize('ADMIN'), parkController.approvePark);

// Delete park (Owner of the park or Admin)
router.delete('/:id', parkController.deletePark);

module.exports = router;