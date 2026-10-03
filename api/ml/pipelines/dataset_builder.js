/**
 * WeatherOS Dataset Builder
 * Generates reproducible training datasets from stored observations.
 */

function extractFeatures(rawData) {
    return {
        temperature: rawData.temp,
        temp_change_1h: rawData.temp - (rawData.prev_temp || rawData.temp),
        humidity: rawData.humidity,
        pressure: rawData.pressure,
        wind_speed: rawData.wind_speed,
        sin_hour: Math.sin((new Date(rawData.timestamp).getHours() / 24) * Math.PI * 2),
        cos_hour: Math.cos((new Date(rawData.timestamp).getHours() / 24) * Math.PI * 2),
        is_day: rawData.is_day ? 1 : 0
    };
}

function validateObservation(obs) {
    if (obs.temp < -90 || obs.temp > 60) return false;
    if (obs.humidity < 0 || obs.humidity > 100) return false;
    if (obs.pressure < 800 || obs.pressure > 1100) return false;
    return true;
}

module.exports = {
    buildDataset: (rawObservations) => {
        const metadata = {
            source: "WeatherOS_Postgres",
            generation_timestamp: new Date().toISOString(),
            preprocessing_version: "1.0.0",
            total_records: rawObservations.length
        };

        const validObservations = rawObservations.filter(validateObservation);
        metadata.valid_records = validObservations.length;
        metadata.invalid_records = rawObservations.length - validObservations.length;

        const dataset = validObservations.map(extractFeatures);
        
        return {
            metadata,
            features: dataset
        };
    }
};
