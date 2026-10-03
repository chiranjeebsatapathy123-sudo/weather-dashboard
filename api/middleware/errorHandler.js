const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled Exception', err, { path: req.path, method: req.method });
    
    // Pass through specific provider errors
    if (err.status === 401) {
        return errorResponse(res, 'PROVIDER_ERROR', 'Weather provider authentication failed. Please check your API key in .env', 401);
    }
    if (err.status === 504) {
        return errorResponse(res, 'TIMEOUT', 'Weather provider request timed out.', 504);
    }

    // Prevent internal details from leaking
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred. Please try again later.');
};

module.exports = errorHandler;
