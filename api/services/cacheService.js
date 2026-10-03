const logger = require("../utils/logger");

// Abstract Cache implementation. 
// Currently in-memory for serverless/local context.
// Can be swapped with Redis later.

const cache = new Map();
const DEFAULT_TTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 5 * 60 * 1000;

const cacheService = {
    get: async (key) => {
        if (cache.has(key)) {
            const entry = cache.get(key);
            if (Date.now() < entry.expiresAt) {
                logger.info("Cache hit", { key });
                return entry.payload;
            } else {
                // Expired
                cache.delete(key);
            }
        }
        logger.info("Cache miss", { key });
        return null;
    },
    
    set: async (key, payload, ttl = DEFAULT_TTL) => {
        const expiresAt = Date.now() + ttl;
        cache.set(key, { payload, expiresAt, fetchedAt: Date.now() });
        logger.info("Cache set", { key, ttl });
    },
    
    delete: async (key) => {
        cache.delete(key);
        logger.info("Cache deleted", { key });
    },
    
    isFresh: async (key) => {
        if (cache.has(key)) {
            return Date.now() < cache.get(key).expiresAt;
        }
        return false;
    }
};

module.exports = cacheService;
