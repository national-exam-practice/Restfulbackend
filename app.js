const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path')

// This is to import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const parkRoutes = require('./routes/parkRoutes');
const spotRoutes = require('./routes/spotRoutes');

const app = express();

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Parking Management API',
      version: '1.0.0',
      description: 'API for managing parking spots and user authentication',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'name', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            password: {
              type: 'string',
              description: 'User password',
              writeOnly: true,
            },
            role: {
              type: 'string',
              description: 'User role',
              enum: ['USER', 'ADMIN'],
              default: 'USER',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User update timestamp',
            },
          },
        },
        Park: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Park ID',
            },
            name: {
              type: 'string',
              description: 'Park name',
            },
            location: {
              type: 'string',
              description: 'Park location',
            },
            totalSpots: {
              type: 'integer',
              description: 'Total number of parking spots',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Update timestamp',
            },
          },
        },
        Spot: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Spot ID',
            },
            number: {
              type: 'string',
              description: 'Spot number/identifier',
            },
            status: {
              type: 'string',
              enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'],
              description: 'Current status of the spot',
            },
            parkId: {
              type: 'string',
              description: 'ID of the park this spot belongs to',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Update timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (only in development)',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/parks', parkRoutes);
app.use('/api/v1/spots', spotRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'something went wrong please try again later!';
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

module.exports = app;