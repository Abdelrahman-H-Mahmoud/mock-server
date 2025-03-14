const fs = require('fs/promises');
const path = require('path');
const config = require('../config');

const STORAGE_DIR = path.join(config.dataDir);
const ROUTES_FILE = path.join(STORAGE_DIR, 'mockRoutes.json');

// Ensure storage directory exists
async function initStorage() {
    try {
        await fs.mkdir(STORAGE_DIR, { recursive: true });
        // Create empty routes file if it doesn't exist
        try {
            await fs.access(ROUTES_FILE);
        } catch {
            await fs.writeFile(ROUTES_FILE, JSON.stringify({}), 'utf8');
        }
        console.log('Storage initialized at:', STORAGE_DIR);
    } catch (error) {
        console.error('Error initializing storage:', error);
        throw error;
    }
}

async function saveMockRoutes(routes) {
    try {
        // Convert Map to object for JSON storage
        const routesObject = Object.fromEntries(routes);
        await fs.writeFile(ROUTES_FILE, JSON.stringify(routesObject, null, 2), 'utf8');
        console.log('Routes saved successfully');
    } catch (error) {
        console.error('Error saving routes:', error);
        throw error;
    }
}

async function loadMockRoutes() {
    try {
        const data = await fs.readFile(ROUTES_FILE, 'utf8');
        const routesObject = JSON.parse(data);
        console.log('Loaded routes:', Object.keys(routesObject));
        // Convert object back to Map
        return new Map(Object.entries(routesObject));
    } catch (error) {
        console.error('Error loading routes:', error);
        return new Map();
    }
}

module.exports = {
    initStorage,
    saveMockRoutes,
    loadMockRoutes
}; 