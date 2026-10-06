const cache = new Map();

/**
 * In-memory caching middleware.
 * Stores responses based on the request URL for the specified duration.
 * @param {number} durationInSeconds - How long to cache the response.
 */
const apiCache = (durationInSeconds) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            // Check if it's expired
            if (Date.now() < cachedResponse.expiry) {
                res.setHeader('X-Cache', 'HIT');
                return res.json(cachedResponse.data);
            }
            // If expired, delete it
            cache.delete(key);
        }

        // Intercept res.json to store the response
        res.setHeader('X-Cache', 'MISS');
        const originalJson = res.json.bind(res);
        
        res.json = (body) => {
            // Store in cache if it's a successful response
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(key, {
                    data: body,
                    expiry: Date.now() + (durationInSeconds * 1000)
                });
            }
            return originalJson(body);
        };

        next();
    };
};

module.exports = apiCache;
