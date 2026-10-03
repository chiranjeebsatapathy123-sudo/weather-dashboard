const { errorResponse } = require('../utils/response');

const validateCityQuery = (req, res, next) => {
    let { city } = req.query;
    if (!city) city = req.body.city; // Fallback to body for POST/DELETE

    if (!city || typeof city !== 'string' || city.trim() === '') {
        return errorResponse(res, 'INVALID_INPUT', 'A valid city name is required.', 400);
    }
    
    city = city.trim();

    if (city.length > 100) {
        return errorResponse(res, 'INVALID_INPUT', 'City name is too long.', 400);
    }

    // Basic sanitization: remove obvious dangerous characters
    if (/[<>{}]/.test(city)) {
        return errorResponse(res, 'INVALID_INPUT', 'City name contains invalid characters.', 400);
    }

    req.validatedCity = city;
    next();
};

const validateCoordinates = (req, res, next) => {
    const { lat, lon } = req.query;
    if (lat === undefined || lon === undefined) {
        return errorResponse(res, 'INVALID_INPUT', 'Latitude and longitude are required.', 400);
    }

    const numLat = parseFloat(lat);
    const numLon = parseFloat(lon);

    if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        return errorResponse(res, 'INVALID_INPUT', 'Latitude must be between -90 and 90.', 400);
    }

    if (isNaN(numLon) || numLon < -180 || numLon > 180) {
        return errorResponse(res, 'INVALID_INPUT', 'Longitude must be between -180 and 180.', 400);
    }

    req.validatedCoords = { lat: numLat, lon: numLon };
    next();
};

const validateLocationQuery = (req, res, next) => {
    const { city, lat, lon } = req.query;
    
    if (lat !== undefined && lon !== undefined) {
        const numLat = parseFloat(lat);
        const numLon = parseFloat(lon);
        if (isNaN(numLat) || numLat < -90 || numLat > 90 || isNaN(numLon) || numLon < -180 || numLon > 180) {
            return errorResponse(res, 'INVALID_INPUT', 'Invalid coordinates.', 400);
        }
        req.validatedLocation = { lat: numLat, lon: numLon };
        return next();
    }

    if (!city || typeof city !== 'string' || city.trim() === '') {
        return errorResponse(res, 'INVALID_INPUT', 'A valid city name or coordinates are required.', 400);
    }
    
    const cleanCity = city.trim();
    if (cleanCity.length > 100) return errorResponse(res, 'INVALID_INPUT', 'City name is too long.', 400);
    if (/[<>{}]/.test(cleanCity)) return errorResponse(res, 'INVALID_INPUT', 'City name contains invalid characters.', 400);

    req.validatedLocation = { city: cleanCity };
    next();
};

module.exports = {
    validateCityQuery,
    validateCoordinates,
    validateLocationQuery
};
