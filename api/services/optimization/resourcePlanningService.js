/**
 * Resource Planning Service
 * Manages resource state, availability windows, and weather-aware capacity.
 */
const { executeQuery } = require('../../db/database');

class ResourcePlanningService {
    
    async registerResource(orgId, data) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO resources (
                    organization_id, type, name, capacity, status, priority, weather_sensitivity
                ) VALUES (
                    ${orgId}, ${data.type}, ${data.name}, ${data.capacity || 1}, 
                    ${data.status || 'AVAILABLE'}, ${data.priority || 1}, ${JSON.stringify(data.weather_sensitivity || {})}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async getResourceAvailability(resourceId, startTime, endTime) {
        return await executeQuery(async (db) => {
            const resource = await db`SELECT * FROM resources WHERE id = ${resourceId}`;
            if (!resource[0]) throw new Error("Resource not found");

            const assignments = await db`
                SELECT * FROM resource_availability 
                WHERE resource_id = ${resourceId}
                AND available_until > ${startTime}
                AND available_from < ${endTime}
            `;
            
            let usedCapacity = 0;
            assignments.forEach(a => usedCapacity += a.assigned_capacity);
            
            return {
                resource: resource[0],
                total_capacity: resource[0].capacity,
                assigned_capacity: usedCapacity,
                remaining_capacity: resource[0].capacity - usedCapacity,
                conflicting_assignments: assignments
            };
        });
    }

    calculateWeatherExposure(resource, currentWeather, forecast) {
        if (!resource.weather_sensitivity) return { exposure_level: "UNKNOWN", risk: 0 };
        
        let riskScore = 0;
        const exposures = [];

        // Example: If sensitivity configured for WIND is HIGH
        if (resource.weather_sensitivity.wind === 'HIGH' && currentWeather.wind_speed > 30) {
            riskScore += 50;
            exposures.push("High wind exposure exceeds resource safety threshold.");
        }
        
        // Expose explicit calculation
        return {
            exposure_level: riskScore > 40 ? "HIGH" : (riskScore > 0 ? "MODERATE" : "LOW"),
            calculated_risk: riskScore,
            configured_sensitivities: resource.weather_sensitivity,
            evidence: exposures
        };
    }
}

module.exports = new ResourcePlanningService();
