const axios = require('axios');

async function registerMockRoutes() {
    try {
        // Register default response for any user
        await axios.post('http://localhost:3000/mock-register', {
            path: '/api/users/:userId',
            method: 'GET',
            response: {
                id: ':userId',
                name: 'John Doe',
                email: 'john@example.com'
            },
            description: 'Default user response'
        });
        console.log('Registered default user route');

        // Register specific response for user with ID "123"
        await axios.post('http://localhost:3000/mock-register', {
            path: '/api/users/:userId',
            method: 'GET',
            response: {
                id: '123',
                name: 'Special User',
                email: 'special@example.com',
                role: 'admin'
            },
            conditions: {
                userId: '123'
            },
            description: 'Special user response'
        });

        // Register not found response for user with ID "999"
        await axios.post('http://localhost:3000/mock-register', {
            path: '/api/users/:userId',
            method: 'GET',
            response: {
                error: 'User not found'
            },
            statusCode: 404,
            conditions: {
                userId: '999'
            },
            description: 'User not found response'
        });

        // Register route with multiple parameter conditions
        await axios.post('http://localhost:3000/mock-register', {
            path: '/api/users/:userId/posts/:postId',
            method: 'GET',
            response: {
                userId: ':userId',
                postId: ':postId',
                title: 'Special Post',
                content: 'This is a special post'
            },
            conditions: {
                userId: '123',
                postId: '456'
            },
            description: 'Special user post'
        });
    } catch (error) {
        console.error('Error registering routes:', error.response?.data || error.message);
        throw error;
    }
}

async function testMockRoutes() {
    try {
        // Add delay to ensure routes are registered
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test default user response
        const response1 = await axios.get('http://localhost:3000/api/users/789');
        console.log('Default User Response:', response1.data);

        // Test specific user response
        const response2 = await axios.get('http://localhost:3000/api/users/123');
        console.log('Special User Response:', response2.data);

        // Test not found response
        try {
            await axios.get('http://localhost:3000/api/users/999');
        } catch (error) {
            console.log('Not Found Response:', error.response.data);
        }

        // Test multiple parameter conditions
        const response3 = await axios.get('http://localhost:3000/api/users/123/posts/456');
        console.log('Special Post Response:', response3.data);

        // Test default post response
        const response4 = await axios.get('http://localhost:3000/api/users/789/posts/123');
        console.log('Default Post Response:', response4.data);
    } catch (error) {
        console.error('Error testing routes:', error.response?.data || error.message);
        throw error;
    }
}

// Run the example with better error handling
(async () => {
    try {
        await registerMockRoutes();
        await testMockRoutes();
    } catch (error) {
        console.error('Failed to run example:', error);
    }
})(); 