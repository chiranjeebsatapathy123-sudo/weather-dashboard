const { neon } = require("@neondatabase/serverless");
const logger = require("../utils/logger");
require("dotenv").config();

// Create a single connection instance
let sql = null;

const getDb = () => {
    if (!sql) {
        if (!process.env.DATABASE_URL) {
            logger.warn("DATABASE_URL is not configured. Database operations will return empty results.");
            // Return a dummy function that resolves to an empty array for queries
            return async () => { return []; };
        }
        try {
            sql = neon(process.env.DATABASE_URL);
            logger.info("Database connection initialized");
        } catch (error) {
            logger.error("Failed to initialize database connection", error);
            throw error;
        }
    }
    return sql;
};

// Wrapper function to execute queries with error handling
const executeQuery = async (queryFn) => {
    try {
        const db = getDb();
        return await queryFn(db);
    } catch (error) {
        logger.error("Database query failed, gracefully returning empty result.", error);
        // Fail-safe: return empty array for SELECT queries, or undefined for others
        // This ensures the application survives DB outages.
        return [];
    }
};

module.exports = {
    getDb,
    executeQuery
};
