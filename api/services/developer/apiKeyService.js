/**
 * Developer API Key Service
 * Securely manages generation, hashing, and validation of developer API keys.
 */

const crypto = require("crypto");
const { executeQuery } = require("../../db/database");
const logger = require("../../utils/logger");

module.exports = {
    /**
     * Generates a new API Key for an organization.
     * Returns the plaintext key ONLY ONCE.
     */
    createKey: async (organizationId, name, scopes) => {
        // Generate a 32-byte secure random string
        const plaintextKey = 'weos_' + crypto.randomBytes(32).toString('hex');
        
        // Hash it using SHA-256 for database storage
        const keyHash = crypto.createHash('sha256').update(plaintextKey).digest('hex');

        try {
            const keyRecord = await executeQuery(async (db) => {
                const result = await db`
                    INSERT INTO api_keys (organization_id, key_hash, name, scopes)
                    VALUES (${organizationId}, ${keyHash}, ${name}, ${JSON.stringify(scopes)})
                    RETURNING id, name, created_at
                `;
                return result[0];
            });

            // The ONLY time this is returned!
            return {
                id: keyRecord.id,
                name: keyRecord.name,
                apiKey: plaintextKey, 
                warning: "Store this key securely. It will never be shown again."
            };
        } catch (error) {
            logger.error("Failed to create API key.", error);
            throw error;
        }
    },

    /**
     * Validates an incoming API Key from a header (e.g. Authorization: Bearer weos_...)
     */
    validateKey: async (plaintextKey, requiredScope = null) => {
        if (!plaintextKey || !plaintextKey.startsWith('weos_')) return null;

        const keyHash = crypto.createHash('sha256').update(plaintextKey).digest('hex');

        try {
            const keys = await executeQuery(async (db) => {
                return await db`
                    SELECT id, organization_id, scopes FROM api_keys 
                    WHERE key_hash = ${keyHash} AND (expires_at IS NULL OR expires_at > NOW())
                `;
            });

            if (keys.length === 0) return null;

            const key = keys[0];

            // Scope Check (Least Privilege)
            if (requiredScope && key.scopes) {
                if (!key.scopes.includes(requiredScope) && !key.scopes.includes('*')) {
                    return null; // Forbidden due to scope
                }
            }

            // Update Last Used asynchronously
            executeQuery(async (db) => {
                await db`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${key.id}`;
            }).catch(e => logger.warn("Failed to update key last_used_at", e));

            return {
                keyId: key.id,
                organizationId: key.organization_id
            };

        } catch (error) {
            logger.error("Failed to validate API key.", error);
            return null;
        }
    }
};
