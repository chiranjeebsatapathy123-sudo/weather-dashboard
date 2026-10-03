// Standard API Response formatter
const successResponse = (res, data, meta = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta
        }
    });
};

const errorResponse = (res, code, message, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message
        }
    });
};

module.exports = {
    successResponse,
    errorResponse
};
