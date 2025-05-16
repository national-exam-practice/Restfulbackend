
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User operations and parking request management
 * 
 * components:
 *   schemas:
 *     RequestInput:
 *       type: object
 *       required:
 *         - parkId
 *         - spotId
 *         - startTime
 *         - endTime
 *       properties:
 *         parkId:
 *           type: string
 *           description: ID of the park
 *         spotId:
 *           type: string
 *           description: ID of the parking spot
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Start time of the parking request
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: End time of the parking request
 *     
 *     RequestResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the request
 *         parkId:
 *           type: string
 *           description: ID of the park
 *         spotId:
 *           type: string
 *           description: ID of the parking spot
 *         userId:
 *           type: string
 *           description: ID of the user who created the request
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Start time of the parking request
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: End time of the parking request
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED]
 *           description: Status of the parking request
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     StatusUpdateInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [APPROVED, REJECTED]
 *           description: New status for the request
 */

/**
 * @swagger
 * /api/v1/users/requests:
 *   post:
 *     summary: Create a new parking request
 *     description: Creates a new parking request for a specific spot in a park
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestInput'
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RequestResponse'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   get:
 *     summary: Get all requests for a user
 *     description: Retrieves all parking requests for the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
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
 *                   description: Total count of requests
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RequestResponse'
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
 * /api/v1/users/owner/requests:
 *   get:
 *     summary: Get all requests for a park owner
 *     description: Retrieves all parking requests for parks owned by the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
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
 *                   description: Total count of requests
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RequestResponse'
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
 * /api/v1/users/requests/{id}:
 *   get:
 *     summary: Get request by ID
 *     description: Retrieves details of a specific parking request
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the request
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RequestResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Request not found
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
 * /api/v1/users/requests/{id}/status:
 *   patch:
 *     summary: Update request status
 *     description: Updates the status of a parking request (approve or reject)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusUpdateInput'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [APPROVED, REJECTED]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
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
 *       404:
 *         description: Request not found
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
 * /api/v1/users/requests/{id}/cancel:
 *   patch:
 *     summary: Cancel a request
 *     description: Cancels a parking request made by the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the request
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [CANCELLED]
 *                       example: CANCELLED
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (not the request owner)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Request not found
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
const userController = require('../controllers/userController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create a new parking request
router.post(
  '/requests',
  [
    body('parkId').notEmpty().withMessage('Park ID is required'),
    body('spotId').notEmpty().withMessage('Spot ID is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required')
  ],
  userController.createRequest
);

// Get all requests for a user
router.get('/requests', userController.getUserRequests);

// Get all requests for a park owner
router.get('/owner/requests', authorize('OWNER'), userController.getParkOwnerRequests);

// Get request by ID
router.get('/requests/:id', userController.getRequestById);

// Update request status (approve or reject)
router.patch(
  '/requests/:id/status',
  authorize('OWNER'),
  [
    body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be either APPROVED or REJECTED')
  ],
  userController.updateRequestStatus
);

// Cancel a request (user only)
router.patch('/requests/:id/cancel', userController.cancelRequest);

module.exports = router;