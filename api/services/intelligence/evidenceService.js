/**
 * Evidence Service
 * Constructs and stores an internal evidence representation graph to support operational decisions.
 */
const { executeQuery } = require('../../db/database');

class EvidenceService {
    async recordEvidence(contextId, evidenceItem) {
        // Validate required schema
        if (!evidenceItem.source || !evidenceItem.source_type) {
            throw new Error("Evidence must include source and source_type");
        }

        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO decision_evidence (
                    context_id, source, source_type, metric, value, unit, 
                    quality, confidence, method, freshness, timestamp
                ) VALUES (
                    ${contextId}, ${evidenceItem.source}, ${evidenceItem.source_type}, 
                    ${evidenceItem.metric}, ${JSON.stringify(evidenceItem.value)}, 
                    ${evidenceItem.unit}, ${evidenceItem.quality}, ${evidenceItem.confidence}, 
                    ${evidenceItem.method}, ${evidenceItem.freshness}, NOW()
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async getEvidenceForContext(contextId) {
        return await executeQuery(async (db) => {
            return await db`SELECT * FROM decision_evidence WHERE context_id = ${contextId} ORDER BY timestamp ASC`;
        });
    }

    generateProvenanceTag(evidence) {
        return {
            source: evidence.source,
            provider: evidence.source_type,
            retrieved_at: evidence.timestamp,
            data_age_seconds: evidence.freshness,
            quality: evidence.quality,
            uncertainty: 100 - (evidence.confidence || 100)
        };
    }
}

module.exports = new EvidenceService();
