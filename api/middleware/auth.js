const { errorResponse } = require("../utils/response");
const { executeQuery } = require("../db/database");

const requireAuth = async (req, res, next) => {
    // Isolated authentication abstraction
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
        return errorResponse(res, "UNAUTHORIZED", "Authentication required. X-User-Id header missing.", 401);
    }
    
    try {
        // Ensure user exists in DB for foreign key constraints
        await executeQuery(async (db) => {
            await db`
                INSERT INTO users (id) 
                VALUES (${userId}::uuid) 
                ON CONFLICT (id) DO NOTHING
            `;
        });
    } catch (e) {
        // If it's not a valid UUID or DB is down, just proceed and let the constraint fail gracefully or log it.
    }

    req.user = { id: userId };
    next();
};

const optionalAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (userId) {
        req.user = { id: userId };
    }
    next();
};

module.exports = { requireAuth, optionalAuth };
