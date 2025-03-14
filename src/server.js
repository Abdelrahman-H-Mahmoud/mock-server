const express = require('express');
const { matchRoute } = require('./utils/routeUtils');
const { log } = require('./utils/logger');
const setupMockRoutes = require('./routes/mockRoutes');
const setupSystemRoutes = require('./routes/systemRoutes');
const errorHandler = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/securityHeaders');

const app = express();

// Store registered routes and their mock responses
let mockRoutes = new Map();

// Middleware
app.use(express.json());
app.use(securityHeaders);

// Setup routes
app.use('/mock', setupMockRoutes(mockRoutes));
app.use('/system', setupSystemRoutes(mockRoutes));

// Dynamic route handler
app.all('*', (req, res) => {
  const { matchedRoute, params } = matchRoute(req.method, req.path, mockRoutes);

  if (!matchedRoute) {
    return res.status(404).json({
      error: 'Mock route not found'
    });
  }

  const responsesWithMatchingConditions = matchedRoute.responses.filter(mockData => {
    if (!mockData.conditions || Object.keys(mockData.conditions).length === 0) {
      return false;
    }

    return Object.entries(mockData.conditions).every(([param, expectedValue]) => {
      const paramValue = params[param];
      return String(paramValue) === String(expectedValue);
    });
  });

  const matchingResponses = responsesWithMatchingConditions.length > 0
    ? responsesWithMatchingConditions
    : matchedRoute.responses.filter(mockData =>
      !mockData.conditions || Object.keys(mockData.conditions).length === 0
    );

  if (matchingResponses.length === 0) {
    return res.status(404).json({
      error: 'No matching response found for the given parameters'
    });
  }

  const mockData = matchingResponses[Math.floor(Math.random() * matchingResponses.length)];
  const processedResponse = JSON.parse(
    JSON.stringify(mockData.response).replace(
      /:(\w+)/g,
      (_, param) => params[param] || `:${param}`
    )
  );

  res.status(mockData.statusCode).json(processedResponse);
});

// Error handling
app.use(errorHandler);

// Error handlers
process.on('uncaughtException', (err) => {
  log('error', 'Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  log('error', 'Unhandled Rejection', { error: err.message, stack: err.stack });
  process.exit(1);
});

module.exports = { app }; 