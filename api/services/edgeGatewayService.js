/**
 * Edge Gateway Service
 * Abstracts edge logic, buffering, deduplication, and bulk uploading.
 */
class EdgeGatewayService {
    constructor() {
        this.offlineBuffer = new Map();
    }

    async processBatchUpload(gatewayId, telemetryBatch) {
        // Validate and filter duplicates based on timestamp
        const processed = [];
        
        for (const item of telemetryBatch) {
            // Simulated validation
            if (!item.device_id || !item.timestamp || !item.measurements) continue;
            
            // Deduplication (simple mock)
            const dedupKey = `${item.device_id}_${item.timestamp}`;
            if (!this.offlineBuffer.has(dedupKey)) {
                this.offlineBuffer.set(dedupKey, true);
                processed.push(item);
            }
        }

        // Pass to Telemetry Service
        const telemetryService = require('./telemetryService');
        const results = await Promise.allSettled(
            processed.map(t => telemetryService.ingestTelemetry(t.device_id, t))
        );

        return {
            received: telemetryBatch.length,
            processed: processed.length,
            successful: results.filter(r => r.status === 'fulfilled').length,
            gateway_id: gatewayId
        };
    }
}

module.exports = new EdgeGatewayService();
