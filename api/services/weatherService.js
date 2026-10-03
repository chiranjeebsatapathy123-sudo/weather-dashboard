const cacheService = require("./cacheService");
const { executeQuery } = require("../db/database");
const logger = require("../utils/logger");

const fetchWithTimeout = async (url, options = {}, retries = 1, timeoutMs = 5000) => {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        
        if (!response.ok) {
            if (response.status >= 500 && retries > 0) {
                logger.warn(`Retrying fetch to ${url}...`);
                return await fetchWithTimeout(url, options, retries - 1, timeoutMs);
            }
            throw { status: response.status, data: await response.json() };
        }
        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            if (retries > 0) {
                logger.warn(`Timeout, retrying fetch to ${url}...`);
                return await fetchWithTimeout(url, options, retries - 1, timeoutMs);
            }
            throw { status: 504, data: { message: "Request to weather provider timed out." } };
        }
        throw error;
    }
};

const normalizeWeatherData = (data, airQualityData = null) => {
    let aqi = null;
    let pollutants = null;
    if (airQualityData && airQualityData.list && airQualityData.list.length > 0) {
        aqi = airQualityData.list[0].main.aqi;
        pollutants = airQualityData.list[0].components;
    }

    return {
        location: {
            name: data.name,
            country: data.sys?.country || null,
        },
        coordinates: {
            lat: data.coord?.lat || null,
            lon: data.coord?.lon || null,
        },
        timezone: data.timezone || null,
        temperature: data.main?.temp ?? null,
        feelsLike: data.main?.feels_like ?? null,
        tempHigh: data.main?.temp_max ?? null,
        tempLow: data.main?.temp_min ?? null,
        condition: {
            main: data.weather?.[0]?.main || null,
            description: data.weather?.[0]?.description || null,
            icon: data.weather?.[0]?.icon || null,
            code: data.weather?.[0]?.id || null
        },
        humidity: data.main?.humidity ?? null,
        pressure: data.main?.pressure ?? null,
        wind: {
            speed: data.wind?.speed ?? null,
            deg: data.wind?.deg ?? null
        },
        visibility: data.visibility ?? null,
        clouds: data.clouds?.all ?? null,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
        sunrise: data.sys?.sunrise ?? null,
        sunset: data.sys?.sunset ?? null,
        airQuality: aqi ? {
            index: aqi,
            components: pollutants
        } : null,
        timestamp: new Date().toISOString(),
        source: "openweathermap",
        freshness: "live"
    };
};

const fetchCurrentWeather = async (locationParam) => {
    const cacheKey = typeof locationParam === 'string' 
        ? `weather_current_${locationParam.toLowerCase()}` 
        : `weather_current_lat${locationParam.lat}_lon${locationParam.lon}`;
        
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) return cachedData;

    let weatherUrl = "";
    if (typeof locationParam === 'string') {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationParam)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    } else {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${locationParam.lat}&lon=${locationParam.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    }
    
    try {
        const rawData = await fetchWithTimeout(weatherUrl);
        
        let airQualityData = null;
        if (rawData.coord && rawData.coord.lat && rawData.coord.lon) {
            try {
                const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${rawData.coord.lat}&lon=${rawData.coord.lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
                airQualityData = await fetchWithTimeout(aqiUrl, {}, 0, 3000); // Fail fast, don't break main if AQI fails
            } catch (aqiErr) {
                logger.warn("Failed to fetch AQI", aqiErr);
            }
        }

        const normalizedData = normalizeWeatherData(rawData, airQualityData);
        await cacheService.set(cacheKey, normalizedData);
        return normalizedData;
    } catch (error) {
        logger.error(`Weather provider error for location ${JSON.stringify(locationParam)}`, error);
        throw error;
    }
};

const fetchForecast = async (locationParam) => {
    const cacheKey = typeof locationParam === 'string' 
        ? `forecast_${locationParam.toLowerCase()}` 
        : `forecast_lat${locationParam.lat}_lon${locationParam.lon}`;
        
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) return cachedData;

    let url = "";
    if (typeof locationParam === 'string') {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(locationParam)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${locationParam.lat}&lon=${locationParam.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    }
    
    try {
        const data = await fetchWithTimeout(url);
        
        // Let's normalize forecast list slightly for the UI
        if (data.list) {
            data.list = data.list.map(item => ({
                dt: item.dt,
                dt_txt: item.dt_txt,
                temp: item.main.temp,
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                feels_like: item.main.feels_like,
                humidity: item.main.humidity,
                pressure: item.main.pressure,
                weather: item.weather[0],
                clouds: item.clouds.all,
                wind: item.wind,
                pop: item.pop || 0, // Probability of precipitation
                rain: item.rain ? (item.rain['3h'] || 0) : 0
            }));
        }

        await cacheService.set(cacheKey, data);
        return data;
    } catch (error) {
        logger.error(`Forecast provider error for location ${JSON.stringify(locationParam)}`, error);
        throw error;
    }
};

const recordSearch = async (city, userId = null) => {
    try {
        await executeQuery(async (db) => {
            if (userId) {
                await db`INSERT INTO search_history (user_id, city) VALUES (${userId}, ${city})`;
            } else {
                await db`INSERT INTO search_history (city) VALUES (${city})`;
            }
        });
    } catch (err) { }
};

module.exports = {
    fetchCurrentWeather,
    fetchForecast,
    recordSearch
};
