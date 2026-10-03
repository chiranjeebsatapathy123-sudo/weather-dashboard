/**
 * Default User Activity Thresholds.
 * In a fully auth'd app, this would be fetched from `activity_profiles`.
 */
const DEFAULT_THRESHOLDS = {
    'Walking': { temp_min: 10, temp_max: 30, rain_max: 40, wind_max: 20 },
    'Running': { temp_min: 5, temp_max: 25, rain_max: 30, wind_max: 15 },
    'Cycling': { temp_min: 15, temp_max: 32, rain_max: 20, wind_max: 25 },
    'Photography': { temp_min: 0, temp_max: 35, rain_max: 10, wind_max: 30 }
};

const getThresholdsForActivity = (activityType) => {
    return DEFAULT_THRESHOLDS[activityType] || DEFAULT_THRESHOLDS['Walking'];
};

module.exports = {
    getThresholdsForActivity
};
