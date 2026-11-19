const helmet = require('helmet');
const cors = require('cors');

const setupSecurity = (app) => {
    // Comprehensive Helmet configuration supporting required CDN scripts, fonts, tiles, and APIs
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    "https://cdn.jsdelivr.net",
                    "https://cdnjs.cloudflare.com",
                    "https://unpkg.com"
                ],
                scriptSrcAttr: ["'unsafe-inline'"],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com",
                    "https://unpkg.com"
                ],
                fontSrc: [
                    "'self'",
                    "https://fonts.gstatic.com",
                    "data:"
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "blob:",
                    "https://openweathermap.org",
                    "https://*.openweathermap.org",
                    "https://*.basemaps.cartocdn.com",
                    "https://tilecache.rainviewer.com",
                    "https://*.tile.openstreetmap.org",
                    "https://unpkg.com"
                ],
                connectSrc: [
                    "'self'",
                    "https://api.openweathermap.org",
                    "https://api.rainviewer.com",
                    "https://archive-api.open-meteo.com",
                    "https://*.basemaps.cartocdn.com",
                    "https://tilecache.rainviewer.com"
                ],
                mediaSrc: ["'self'", "data:", "blob:"]
            }
        },
        crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : ['http://localhost:3000'];

    app.use(cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps, curl, or same-origin browser navigations)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1 && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        }
    }));
};

module.exports = setupSecurity;
