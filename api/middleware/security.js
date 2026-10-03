const helmet = require('helmet');
const cors = require('cors');

const setupSecurity = (app) => {
    // Basic helmet security headers
    app.use(helmet());

    // CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : ['http://localhost:3000'];

    app.use(cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        }
    }));
};

module.exports = setupSecurity;
