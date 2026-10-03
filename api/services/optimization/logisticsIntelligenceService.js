/**
 * Logistics Intelligence Service
 * Analyzes route weather exposure dynamically without fabricating traffic data.
 */
class LogisticsIntelligenceService {
    
    evaluateRouteWeatherProfile(routeData, weatherDataAlongRoute) {
        // Assume routeData contains segments (lat/lon)
        // weatherDataAlongRoute contains factual forecast per segment
        
        let maxRisk = "LOW";
        let activeAlerts = [];
        const segmentProfiles = [];

        for (const segment of routeData.segments) {
            const forecast = weatherDataAlongRoute[segment.id];
            if (!forecast) {
                segmentProfiles.push({ ...segment, status: "NO_DATA" });
                continue;
            }

            const risk = forecast.wind > 40 || forecast.visibility < 1 ? "HIGH" : 
                        (forecast.rain > 10 ? "MODERATE" : "LOW");

            if (risk === "HIGH") maxRisk = "HIGH";
            if (risk === "MODERATE" && maxRisk === "LOW") maxRisk = "MODERATE";

            if (forecast.alerts) {
                activeAlerts.push(...forecast.alerts);
            }

            segmentProfiles.push({
                segment,
                weather: {
                    temp: forecast.temp,
                    rain: forecast.rain,
                    wind: forecast.wind,
                    visibility: forecast.visibility
                },
                risk,
                freshness: forecast.freshness_seconds
            });
        }

        return {
            route_id: routeData.id,
            overall_weather_exposure: maxRisk,
            segment_profiles: segmentProfiles,
            active_alerts: [...new Set(activeAlerts)], // Unique alerts
            limitations: "Analysis is based purely on atmospheric forecasts, not real-time road or traffic conditions."
        };
    }

    compareRoutes(analyzedRoutes) {
        // Return factual differences without inventing a "best" score
        return analyzedRoutes.map(r => ({
            route_id: r.route_id,
            distance_km: r.distance_km,
            overall_weather_exposure: r.overall_weather_exposure,
            high_risk_segments: r.segment_profiles.filter(s => s.risk === 'HIGH').length,
            active_alerts_count: r.active_alerts.length
        }));
    }
}

module.exports = new LogisticsIntelligenceService();
