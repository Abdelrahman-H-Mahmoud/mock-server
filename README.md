# Mock Server

A flexible and configurable mock server for API development and testing. This server allows you to dynamically register mock routes with support for URL parameters and conditional responses.

## Features

- Dynamic route registration with URL parameters
- Conditional responses based on URL parameters
- Multiple responses per route with random selection
- JSON storage persistence
- Production-ready with PM2 process management
- Health check endpoint
- Structured logging system
- Debug endpoints for route inspection

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Abdelrahman-H-Mahmoud/mock-server
   cd mock-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install PM2 globally (if not already installed):
   ```bash
   npm install -g pm2
   ```

## Usage

### Production Mode

```bash
# Start the server with PM2
npm run prod

# Start with logs
npm run prod:start

# Watch logs in real-time
npm run prod:watch
```

### PM2 Management Commands
```bash
npm run prod:stop     # Stop the server
npm run prod:restart  # Restart the server
npm run prod:delete   # Delete the server instance
npm run prod:status   # Check server status
npm run prod:monitor  # Monitor the server
npm run prod:list     # List all processes
npm run prod:logs     # View logs
npm run prod:json     # View logs in JSON format
```

## API Documentation

### Register Mock Route
```http
POST /mock/register
Content-Type: application/json

{
  "path": "/api/users/:userId",
  "method": "GET",
  "response": {
    "id": ":userId",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "statusCode": 200,
  "description": "Get user by ID",
  "conditions": {
    "userId": "123"
  }
}
```

### List All Routes
```http
GET /mock/routes
```

### Delete Route Response
```http
DELETE /mock/routes/:responseId
Content-Type: application/json

{
  "path": "/api/users/:userId",
  "method": "GET"
}
```

### Flush All Routes
```http
DELETE /mock/flush
```

### Health Check
```http
GET /system/health
```

### Debug Routes
```http
GET /system/debug/routes
```

## Example Usage

### Basic Route
```javascript
// Register a basic route
await axios.post('http://localhost:3000/mock/register', {
  path: '/api/users/:userId',
  method: 'GET',
  response: {
    id: ':userId',
    name: 'John Doe',
    email: 'john@example.com'
  },
  description: 'Default user response'
});

// Flush all routes
await axios.delete('http://localhost:3000/mock/flush');
```

### Conditional Response
```javascript
// Register a conditional response
await axios.post('http://localhost:3000/mock/register', {
  path: '/api/users/:userId',
  method: 'GET',
  response: {
    id: '123',
    name: 'Special User',
    role: 'admin'
  },
  conditions: {
    userId: '123'
  },
  description: 'Special user response'
});
```

## Configuration

Configuration is environment-based (`src/config/index.js`):

```javascript
const config = {
  development: {
    port: process.env.PORT || 3000,
    dataDir: 'src/data',
    logLevel: 'debug'
  },
  production: {
    port: process.env.PORT || 3000,
    dataDir: 'src/data',
    logLevel: 'error'
  }
};
```

## Project Structure
```
.
├── src/
│   ├── server.js           # Main server file
│   ├── config/
│   │   └── index.js        # Configuration
│   ├── routes/
│   │   ├── mockRoutes.js   # Mock API routes
│   │   └── systemRoutes.js # System routes
│   ├── middleware/
│   │   ├── errorHandler.js    # Error handling
│   │   └── securityHeaders.js # Security headers
│   ├── utils/
│   │   ├── fileStorage.js  # Storage utilities
│   │   ├── logger.js       # Logging utility
│   │   └── routeUtils.js   # Route matching utilities
│   └── data/              # Data storage directory
├── scripts/
│   └── setup.js          # Setup script
├── logs/                 # Log files
├── index.js             # Application entry point
├── ecosystem.config.js   # PM2 configuration
└── package.json
```

## Logging

Logs are stored in the `logs` directory:
- `error.log`: Error messages
- `out.log`: Standard output
- `combined.log`: Combined logs

View logs using PM2 commands:
```bash
npm run prod:logs  # View all logs
npm run prod:watch # View raw logs
npm run prod:json  # View JSON formatted logs
```

## Features in Detail

### URL Parameters
The server supports URL parameters in routes (e.g., `/api/users/:userId`). These parameters can be:
- Referenced in responses using `:paramName` syntax
- Used in conditions to provide different responses

### Conditional Responses
Multiple responses can be registered for the same route with different conditions. The server will:
1. First try to match responses with conditions
2. Fall back to default responses (no conditions) if no conditions match

### Response Selection
When multiple matching responses exist, the server randomly selects one, allowing for varied responses.

## License

ISC

## Author

Abdelrahman Hussien