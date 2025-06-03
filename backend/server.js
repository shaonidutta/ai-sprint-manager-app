require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./config/logger');
const database = require('./config/database');
const emailService = require('./services/emailService');
const aiService = require('./services/aiService');
const { formatErrorResponse } = require('./utils/errors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple CORS configuration for development
app.use((req, res, next) => {
  // Allow all origins in development
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// Backup CORS using cors middleware
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Rate limiting - only for non-OPTIONS requests and in production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.'
      }
    },
    skip: (req) => req.method === 'OPTIONS' // Skip rate limiting for preflight requests
  });
  app.use('/api/', limiter);
} else {
  // Development mode - more lenient rate limiting
  const devLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Much higher limit for development
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.'
      }
    },
    skip: (req) => req.method === 'OPTIONS' // Skip rate limiting for preflight requests
  });
  app.use('/api/', devLimiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: dbHealth
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Service temporarily unavailable'
      }
    });
  }
});

// API Health check endpoint for Render
app.get('/api/v1/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: dbHealth,
        ai: {
          status: aiService.isReady() ? 'ready' : 'not_available'
        }
      }
    });
  } catch (error) {
    logger.error('API Health check failed:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Service temporarily unavailable'
      }
    });
  }
});

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const boardRoutes = require('./routes/boards');
const issueRoutes = require('./routes/issues');
const sprintRoutes = require('./routes/sprints');
const activityRoutes = require('./routes/activities');
const kanbanRoutes = require('./routes/kanban');
const aiRoutes = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');


// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/boards', boardRoutes);
app.use('/api/v1/issues', issueRoutes);
app.use('/api/v1/sprints', sprintRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/kanban', kanbanRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);


// API root endpoint
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Sprint Management API v1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/v1/auth',
      projects: '/api/v1/projects',
      boards: '/api/v1/boards',
      issues: '/api/v1/issues',
      sprints: '/api/v1/sprints',
      activities: '/api/v1/activities',
      kanban: '/api/v1/kanban',
      ai: '/api/v1/ai',
      dashboard: '/api/v1/dashboard',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(formatErrorResponse({
    code: 'ROUTE_NOT_FOUND',
    message: `Route ${req.originalUrl} not found`
  }));
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json(
    formatErrorResponse(error, isDevelopment)
  );
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();

    // Initialize email service
    await emailService.initialize();

    // Initialize AI service
    await aiService.initialize();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
      logger.info(`API available at http://localhost:${PORT}/api/v1`);
      logger.info(`AI service status: ${aiService.isReady() ? 'Ready' : 'Not available'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
