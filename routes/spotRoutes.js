/**
 * @swagger
 * tags:
 *   name: Spots
 *   description: Parking spot management endpoints
 * 
 * components:
 *   schemas:
 *     SpotResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the spot
 *         parkId:
 *           type: string
 *           description: ID of the park this spot belongs to
 *         spotNumber:
 *           type: string
 *           description: Spot identifier within the park
 *         type:
 *           type: string
 *           description: Type of parking spot (e.g., 'STANDARD', 'HANDICAP', 'ELECTRIC')
 *         status:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, MAINTENANCE]
 *           description: Current status of the spot
 */

/**
 * @swagger
 * /api/v1/spots/park/{parkId}:
 *   get:
 *     summary: Get all spots for a park
 *     description: Retrieves all parking spots for a specific park
 *     tags: [Spots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parkId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the park
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
 *                   description: Total count of spots
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SpotResponse'
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
 */

/**
 * @swagger
 * /api/v1/spots/park/{parkId}/available:
 *   get:
 *     summary: Get available spots for a park
 *     description: Retrieves available parking spots for a specific park within a time range
 *     tags: [Spots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parkId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the park
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time of availability window
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time of availability window
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
 *                   description: Total count of available spots
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SpotResponse'
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
 * /api/v1/spots/{id}:
 *   get:
 *     summary: Get spot by ID
 *     description: Retrieves details of a specific parking spot
 *     tags: [Spots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spot
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
 *                   $ref: '#/components/schemas/SpotResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Spot not found
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
const { query } = require('express-validator');
const { protect } = require('../middlewares/authMiddleware');
const spotController = require('../controllers/spotController');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all spots for a park
router.get('/park/:parkId', spotController.getSpotsByParkId);

// Get available spots for a park
router.get(
  '/park/:parkId/available',
  [
    query('startTime').notEmpty().withMessage('Start time is required'),
    query('endTime').notEmpty().withMessage('End time is required')
  ],
  spotController.getAvailableSpots
);

// Get spot by ID
router.get('/:id', spotController.getSpotById);

module.exports = router;