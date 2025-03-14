const express = require('express');
const config = require('./config');
const { initStorage, saveMockRoutes, loadMockRoutes } = require('./utils/fileStorage');
const { matchRoute } = require('./utils/routeUtils');

const app = express();
const PORT = config.port;

// Store registered routes and their mock responses
let mockRoutes = new Map();

app.use(express.json());

// Add at the top after imports
function log(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };
  console.log(JSON.stringify(logEntry));
}

// Initialize storage and load existing routes
async function initialize() {
    try {
        log('info', 'Starting server initialization');
        await initStorage();
        mockRoutes = await loadMockRoutes();
        log('info', 'Server initialization complete', { routeCount: mockRoutes.size });
    } catch (error) {
        log('error', 'Failed to initialize server', { error: error.message });
        process.exit(1);
    }
}

// Endpoint to register new mock routes
app.post('/mock-register', async (req, res) => {
    const { path, method, response, statusCode = 200, description = '', conditions = {} } = req.body;

    if (!path || !method || !response) {
        return res.status(400).json({
            error: 'Missing required fields: path, method, and response are required'
        });
    }

    const routeKey = `${method.toUpperCase()}:${path}`;
    const existingRoute = mockRoutes.get(routeKey) || { responses: [] };
    
    // Add new response to the array with conditions
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
        console.error('Error saving route:', error);
        res.status(500).json({
            error: 'Failed to save mock route'
        });
    }
});

// Get all registered routes
app.get('/mock-routes', (req, res) => {
    const routes = Array.from(mockRoutes.entries()).map(([key, value]) => ({
        route: key,
        ...value
    }));
    res.json(routes);
});

// Delete a specific response from a route
app.delete('/mock-routes/:responseId', async (req, res) => {
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

    // Filter out the specific response
    route.responses = route.responses.filter(r => r.createdAt !== responseId);

    // If no responses left, delete the route
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

// Add this endpoint to inspect current routes
app.get('/debug/routes', (req, res) => {
    // Get Express routes
    const expressRoutes = app._router.stack
        .filter(r => r.route) // only get routes, not middleware
        .map(r => ({
            path: r.route.path,
            methods: Object.keys(r.route.methods)
        }));

    // Get mock routes
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

// Dynamic route handler for all registered mock routes
app.all('*', (req, res) => {
    
    const { matchedRoute, params } = matchRoute(req.method, req.path, mockRoutes);

    if (!matchedRoute) {
        return res.status(404).json({
            error: 'Mock route not found'
        });
    }

    // First, try to find responses with matching conditions
    const responsesWithMatchingConditions = matchedRoute.responses.filter(mockData => {
        if (!mockData.conditions || Object.keys(mockData.conditions).length === 0) {
            return false; // Skip responses without conditions for now
        }
        
        return Object.entries(mockData.conditions).every(([param, expectedValue]) => {
            const paramValue = params[param];
            return String(paramValue) === String(expectedValue);
        });
    });


    // If we found responses with matching conditions, use those
    // Otherwise, fall back to responses without conditions
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

    // Get a random response from the matching responses
    const mockData = matchingResponses[Math.floor(Math.random() * matchingResponses.length)];

    // Replace any parameter placeholders in the response
    const processedResponse = JSON.parse(
        JSON.stringify(mockData.response).replace(
            /:(\w+)/g,
            (_, param) => params[param] || `:${param}`
        )
    );

    res.status(mockData.statusCode).json(processedResponse);
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Add basic error handling for production
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Update server start
initialize()
  .then(() => {
    app.listen(PORT, () => {
      log('info', 'Server started', { 
        port: PORT, 
        env: process.env.NODE_ENV,
        pid: process.pid 
      });
      if (process.send) {
        process.send('ready');
      }
    });
  })
  .catch(error => {
    log('error', 'Server failed to start', { error: error.message });
    process.exit(1);
  });

// Update error handlers
process.on('uncaughtException', (err) => {
  log('error', 'Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  log('error', 'Unhandled Rejection', { error: err.message, stack: err.stack });
  process.exit(1);
}); 