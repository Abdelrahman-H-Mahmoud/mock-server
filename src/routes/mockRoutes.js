const express = require('express');
const router = express.Router();
const { saveMockRoutes } = require('../utils/fileStorage');
const { log } = require('../utils/logger');

function setupMockRoutes(mockRoutes) {
  // Register new mock route
  router.post('/register', async (req, res) => {
    const { path, method, response, statusCode = 200, description = '', conditions = {} } = req.body;

    if (!path || !method || !response) {
      return res.status(400).json({
        error: 'Missing required fields: path, method, and response are required'
      });
    }

    const routeKey = `${method.toUpperCase()}:${path}`;
    const existingRoute = mockRoutes.get(routeKey) || { responses: [] };

    existingRoute.responses.push({
      response,
      statusCode,
      description,
      conditions,
      createdAt: new Date().toISOString()
    });

    mockRoutes.set(routeKey, existingRoute);

    try {
      await saveMockRoutes(mockRoutes);
      res.json({
        message: 'Mock route response registered successfully',
        route: { path, method, statusCode, conditions }
      });
    } catch (error) {
      log('error', 'Failed to save mock route', { error: error.message });
      res.status(500).json({
        error: 'Failed to save mock route'
      });
    }
  });

  // Get all registered routes
  router.get('/routes', (req, res) => {
    const routes = Array.from(mockRoutes.entries()).map(([key, value]) => ({
      route: key,
      ...value
    }));
    res.json(routes);
  });

  // Delete route response
  router.delete('/routes/:responseId', async (req, res) => {
    const { path, method } = req.body;
    const { responseId } = req.params;

    if (!path || !method) {
      return res.status(400).json({
        error: 'Missing required fields: path and method are required'
      });
    }

    const routeKey = `${method.toUpperCase()}:${path}`;
    const route = mockRoutes.get(routeKey);

    if (!route) {
      return res.status(404).json({
        error: 'Route not found'
      });
    }

    route.responses = route.responses.filter(r => r.createdAt !== responseId);

    if (route.responses.length === 0) {
      mockRoutes.delete(routeKey);
    } else {
      mockRoutes.set(routeKey, route);
    }

    try {
      await saveMockRoutes(mockRoutes);
      res.json({
        message: 'Mock route response deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to save routes after deletion'
      });
    }
  });

  // Flush all mock routes
  router.delete('/flush', async (req, res) => {
    try {
      // Clear the Map
      mockRoutes.clear();
      
      // Save empty routes to file
      await saveMockRoutes(mockRoutes);
      
      log('info', 'All mock routes flushed successfully');
      res.json({
        message: 'All mock routes flushed successfully',
        routeCount: 0
      });
    } catch (error) {
      log('error', 'Failed to flush mock routes', { error: error.message });
      res.status(500).json({
        error: 'Failed to flush mock routes'
      });
    }
  });

  return router;
}

module.exports = setupMockRoutes; 