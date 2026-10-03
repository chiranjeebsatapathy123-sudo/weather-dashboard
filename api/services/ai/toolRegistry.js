/**
 * AI Tool Registry
 * Explicitly defines what agents are allowed to do. No arbitrary code execution.
 */

const { executeQuery } = require("../../db/database");
const weatherService = require("../weatherService");

const tools = [
    {
        name: "getCurrentWeather",
        description: "Fetch current weather for the organization's primary workspace.",
        risk_level: "READ",
        execute: async (orgId, userId) => {
            // Hardcoded to Paris for safety in this stub, in prod it resolves the workspace default loc.
            return await weatherService.fetchCurrentWeather("Paris");
        }
    },
    {
        name: "getTwinStatus",
        description: "Returns the health status of all Digital Twins in the organization.",
        risk_level: "READ",
        execute: async (orgId, userId) => {
            return await executeQuery(async (db) => {
                return await db`SELECT name, entity_type, status FROM digital_twins WHERE organization_id = ${orgId}`;
            });
        }
    },
    {
        name: "createIncident",
        description: "Creates an incident report. Requires human confirmation.",
        risk_level: "HIGH-RISK WRITE",
        execute: async (orgId, userId) => {
            throw new Error("Human confirmation required.");
        }
    }
];

module.exports = {
    getAvailableTools: () => {
        return tools.map(t => ({
            name: t.name,
            description: t.description,
            risk: t.risk_level
        }));
    },
    getTool: (name) => {
        return tools.find(t => t.name === name);
    }
};
