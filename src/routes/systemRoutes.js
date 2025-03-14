const express = require('express');
const router = express.Router();

function setupSystemRoutes(mockRoutes) {
  // Debug routes endpoint
  router.get('/debug/routes', (req, res) => {
    const expressRoutes = req.app._router.stack
      .filter(r => r.route)
      .map(r => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      }));

    const mockRoutesArray = Array.from(mockRoutes.entries()).map(([key, value]) => ({
      route: key,
      pattern: key.split(':')[1],
      method: key.split(':')[0],
      responses: value.responses.map(r => ({
        statusCode: r.statusCode,
        conditions: r.conditions,
        description: r.description
      }))
    }));

    res.json({
      express: {
        routeCount: expressRoutes.length,
        routes: expressRoutes
      },
      mock: {
        routeCount: mockRoutesArray.length,
        routes: mockRoutesArray
      }
    });
  });

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now()
    });
  });

  return router;
}

module.exports = setupSystemRoutes; 