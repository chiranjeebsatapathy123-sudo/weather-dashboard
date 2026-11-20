const CACHE_NAME = 'weatheros-v14';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/script.js',
    '/js/api.js',
    '/js/i18n.js',
    '/js/units.js',
    '/js/components/CurrentWeather.js',
    '/js/components/WeatherMetrics.js',
    '/js/components/HourlyForecast.js',
    '/js/components/DailyForecast.js',
    '/js/components/WeatherInsight.js',
    '/js/components/BestTime.js',
    '/js/components/LocationList.js',
    '/js/components/AlertCenter.js',
    '/js/components/HistoricalCharts.js',
    '/js/components/WeatherMap.js',
    '/js/components/CompareLocations.js',
    '/js/components/WeatherCopilot.js',
    '/js/components/CommandBar.js',
    '/js/components/AtmosphereScene.js',
    '/js/components/WeatherBrief.js',
    '/js/components/AIPredictor.js',
    '/manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('Pre-caching some assets failed', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    // Network-first for both API and static assets, falling back to cache when offline
    event.respondWith(
        fetch(event.request).then(response => {
            if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
        }).catch(() => caches.match(event.request))
    );
});

self.addEventListener('push', function(event) {
    if (event.data) {
        let data = {};
        try {
            data = event.data.json();
        } catch(e) {
            data = { body: event.data.text() };
        }
        const options = {
            body: data.body || 'New Weather Update!',
            icon: '/assets/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title || 'Weather Intelligence', options)
        );
    }
});
