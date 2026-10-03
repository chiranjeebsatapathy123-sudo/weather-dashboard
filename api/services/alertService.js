const logger = require("../utils/logger");

const generateSmartNotices = (currentWeather, forecastData) => {
    const notices = [];
    
    if (!currentWeather || !forecastData || !forecastData.list) return notices;

    // 1. Rain soon notice
    const nextThreeHours = forecastData.list.slice(0, 1);
    if (nextThreeHours.length > 0 && nextThreeHours[0].pop > 0.6) {
        notices.push({
            id: 'notice_rain_soon',
            type: 'notice',
            severity: 'MODERATE',
            title: 'Rain Expected Soon',
            description: 'Rain probability is highly elevated in the coming hours.',
            source: 'WeatherOS Insight'
        });
    }

    // 2. Temp increase
    const currentTemp = currentWeather.temperature;
    let highTempToday = currentTemp;
    forecastData.list.slice(0, 4).forEach(f => {
        if (f.temp > highTempToday) highTempToday = f.temp;
    });

    if (highTempToday > currentTemp + 5 && highTempToday > 25) {
        notices.push({
            id: 'notice_temp_rise',
            type: 'notice',
            severity: 'LOW',
            title: 'Temperature Rising',
            description: `Temperature is expected to rise significantly to ${Math.round(highTempToday)}°C this afternoon.`,
            source: 'WeatherOS Insight'
        });
    }

    // 3. Air Quality
    if (currentWeather.airQuality && currentWeather.airQuality.index >= 4) {
         notices.push({
            id: 'notice_poor_aqi',
            type: 'notice',
            severity: 'HIGH',
            title: 'Poor Air Quality',
            description: 'Air quality is currently poor. Sensitive groups should limit outdoor activity.',
            source: 'WeatherOS Insight'
        });
    }

    return notices;
};

// OpenWeather Free doesn't include provider alerts, but this structure accommodates it if we upgrade to OneCall.
const fetchProviderAlerts = async (lat, lon) => {
    // Return empty array for now since OWM 2.5 standard doesn't provide alerts.
    // In a real scenario with OneCall, we would fetch and normalize here.
    return []; 
};

module.exports = {
    generateSmartNotices,
    fetchProviderAlerts
};
