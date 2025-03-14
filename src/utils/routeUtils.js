// Convert URL pattern to regex
function patternToRegex(pattern) {
    // First, escape special regex characters except for ':'
    const escapedPattern = pattern
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
        .replace(/\//g, '\\/'); // Escape forward slashes

    // Then replace :param patterns with named capture groups
    const regexPattern = escapedPattern.replace(/:([^\/]+)/g, '([^/]+)');
    
    const regex = new RegExp('^' + regexPattern + '$');
    return regex;
}

// Extract parameter names from URL pattern
function getParamNames(pattern) {
    const paramNames = [];
    pattern.replace(/:([^\/]+)/g, (_, name) => {
        paramNames.push(name);
    });
    return paramNames;
}

// Match route and extract parameters
function matchRoute(method, path, routes) {
    
    for (const [routeKey, routeData] of routes.entries()) {
        // Fix: Don't split on first colon, split on first colon after the method
        const methodSeparatorIndex = routeKey.indexOf(':');
        const routeMethod = routeKey.slice(0, methodSeparatorIndex);
        const routePattern = routeKey.slice(methodSeparatorIndex + 1);
        
        if (routeMethod === method) {
            const regex = patternToRegex(routePattern);
            const match = path.match(regex);
            
            if (match) {
                const paramNames = getParamNames(routePattern);
                const params = {};
                
                // Skip the full match (first element)
                match.slice(1).forEach((value, index) => {
                    params[paramNames[index]] = value;
                });
                
                return {
                    matchedRoute: routeData,
                    params
                };
            } else {
                console.log('Path does not match pattern:', path, 'vs', routePattern);
            }
        }
    }
    
    return { matchedRoute: null, params: {} };
}

module.exports = {
    matchRoute
}; 