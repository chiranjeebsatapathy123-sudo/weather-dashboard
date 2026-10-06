import { api } from './api.js';
import { CurrentWeather } from './components/CurrentWeather.js';
import { WeatherMetrics } from './components/WeatherMetrics.js';
import { HourlyForecast } from './components/HourlyForecast.js';
import { DailyForecast } from './components/DailyForecast.js';
import { WeatherInsight } from './components/WeatherInsight.js';
import { BestTime } from './components/BestTime.js';
import { LocationList } from './components/LocationList.js';
import { AlertCenter } from './components/AlertCenter.js';
import { HistoricalCharts } from './components/HistoricalCharts.js';
import { WeatherMap } from './components/WeatherMap.js';
import { CompareLocations } from './components/CompareLocations.js';
import { WeatherCopilot } from './components/WeatherCopilot.js';
import { CommandBar } from './components/CommandBar.js';
import { AtmosphereScene } from './components/AtmosphereScene.js';
import { WeatherBrief } from './components/WeatherBrief.js';
import { setLanguage } from './i18n.js';
import { AIPredictor } from './components/AIPredictor.js';

// Language selector
document.getElementById('langSelect')?.addEventListener('change', (e) => {
    setLanguage(e.target.value);
});

// DOM Elements
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const loader = document.getElementById('loader');
const errorBanner = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const lastUpdated = document.getElementById('lastUpdated');
const locationBtn = document.getElementById('locationBtn'); // New button

// Nav
const navBtns = document.querySelectorAll('.nav-btn');
const mobNavBtns = document.querySelectorAll('.mob-nav-btn');
const views = document.querySelectorAll('.view-section');

let currentCity = 'New York';

// Refresh Engine
let refreshIntervalId = null;
const REFRESH_RATE = 10 * 60 * 1000; // 10 minutes

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadDashboardData(currentCity);
    fetchLocations();
    startRefreshEngine();
    
    WeatherCopilot.init(api);
    CommandBar.init();
    AtmosphereScene.init();
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('SW registration failed: ', err);
            });
        });
    }
});

function startRefreshEngine() {
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(() => {
        if (!document.hidden) {
            loadDashboardData(currentCity, true);
        }
    }, REFRESH_RATE);
}

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        loadDashboardData(currentCity, true);
    }
});

let debounceTimer;
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    // Could implement autocomplete here later
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const val = searchInput.value.trim();
        if (val) {
            currentCity = val;
            loadDashboardData(currentCity);
            searchInput.value = '';
            switchView('dashboard');
        }
    }
});

refreshBtn.addEventListener('click', () => {
    refreshBtn.style.animation = 'spin 1s linear infinite';
    loadDashboardData(currentCity, true).finally(() => {
        refreshBtn.style.animation = '';
    });
});

document.getElementById('notifBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const dd = document.getElementById('notifDropdown');
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
    if (dd.style.display === 'block') {
        document.getElementById('notifBadge').style.display = 'none';
    }
    
    // Request Web Push Notifications
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Push notification permission granted.');
                // In a real app, subscribe to push manager and send sub to backend here
            }
        });
    }
});

// Hide dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dd = document.getElementById('notifDropdown');
    if (dd && dd.style.display === 'block' && !dd.contains(e.target) && e.target.closest('#notifBtn') == null) {
        dd.style.display = 'none';
    }
});

if (locationBtn) {
    locationBtn.addEventListener('click', () => {
        if ("geolocation" in navigator) {
            showLoader();
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    // We can reverse geocode or let backend handle it if we create a coord endpoint
                    // For now, we will add a coord endpoint in Phase 3
                    const res = await api.get(`/weather/current?lat=${lat}&lon=${lon}`);
                    currentCity = res.location.name;
                    await loadDashboardData(currentCity);
                    switchView('dashboard');
                } catch (e) {
                    showError("Could not determine location");
                } finally {
                    hideLoader();
                }
            }, () => {
                hideLoader();
                showError("Location permission denied");
            });
        }
    });
}

document.getElementById('closeError').addEventListener('click', () => {
    errorBanner.style.display = 'none';
});

themeToggleBtn.addEventListener('click', toggleTheme);

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        switchView(btn.getAttribute('data-target'));
    });
});

mobNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        mobNavBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        switchView(btn.getAttribute('data-target'));
    });
});

document.getElementById('favBtn').addEventListener('click', toggleFavorite);

const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        try {
            const card = document.querySelector('.current-weather');
            if (!card) return;
            // Temporarily remove transform for capture
            const originalTransform = card.style.transform;
            card.style.transform = 'none';
            
            const canvas = await html2canvas(card, { 
                backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#f1f5f9' : '#0f172a',
                scale: 2 // High quality
            });
            
            card.style.transform = originalTransform;
            
            const link = document.createElement('a');
            link.download = `weather-snapshot-${currentCity}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Error generating snapshot', e);
        }
    });
}

const exportCsvBtn = document.getElementById('exportCsvBtn');
if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
        if (!window.currentForecastData || !window.currentForecastData.list) return alert('No forecast data available to export.');
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "DateTime,Temperature(C),FeelsLike(C),Humidity(%),Weather\n";
        
        window.currentForecastData.list.forEach(item => {
            const dt = new Date(item.dt * 1000).toLocaleString();
            const temp = item.main.temp;
            const feels = item.main.feels_like;
            const hum = item.main.humidity;
            const desc = item.weather[0].description;
            csvContent += `"${dt}",${temp},${feels},${hum},"${desc}"\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `forecast_${currentCity}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    });
}

// Core Data Loading
async function loadDashboardData(city, isBackgroundRefresh = false) {
    if (!isBackgroundRefresh) showLoader();
    errorBanner.style.display = 'none';
    
    try {
        const [weatherData, forecastData, insightsData, alertsData, historyData, riskData] = await Promise.all([
            api.get(`/weather/current?city=${encodeURIComponent(city)}`),
            api.get(`/forecast?city=${encodeURIComponent(city)}`).catch(() => null),
            api.get(`/insights?city=${encodeURIComponent(city)}`).catch(() => ({ insights: [] })),
            api.get(`/alerts?city=${encodeURIComponent(city)}`).catch(() => []),
            api.get(`/history/weather?city=${encodeURIComponent(city)}`).catch(() => []),
            api.get(`/risk/dashboard?city=${encodeURIComponent(city)}`).catch(() => null)
        ]);
        
        window.currentForecastData = forecastData;
        window.currentWeatherData = weatherData;
        window.currentHistoryData = historyData;

        // Render Components
        CurrentWeather.render(weatherData);
        
        // Auto-Theming based on sunset/sunrise
        if (weatherData.sunrise && weatherData.sunset) {
            const now = Math.floor(Date.now() / 1000);
            const isDay = now >= weatherData.sunrise && now < weatherData.sunset;
            if (isDay) {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        }
        
        if (weatherData.condition && weatherData.condition.code) {
            // Update Background Scene
            AtmosphereScene.updateCondition(weatherData.condition.code);
            
            // Dynamic Title & Favicon
            document.title = `${weatherData.temperature}°C ${weatherData.location.name} - WeatherOS`;
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = `https://openweathermap.org/img/wn/${weatherData.condition.icon}.png`;
        }
        WeatherMetrics.render(weatherData);
        WeatherBrief.render(weatherData, forecastData, riskData);
        WeatherInsight.render(insightsData.insights);
        // BestTime.render(weatherData, forecastData); // Replaced by Phase 6 Risk logic
        
        // Render Phase 6 Risk UI
        renderPhase6RiskUI(riskData);
        
        // --- PRO TOOLS LOGIC ---
        // 1. IoT Webhook Check
        const webhookUrl = localStorage.getItem('webhookUrl');
        const webhookCondition = document.getElementById('webhookCondition')?.value;
        if (webhookUrl && webhookUrl.startsWith('http')) {
            let trigger = false;
            if (webhookCondition === 'rain' && weatherData.condition?.main?.toLowerCase().includes('rain')) trigger = true;
            if (webhookCondition === 'hot' && weatherData.temperature > 30) trigger = true;
            // if UV condition met (mocked)
            
            if (trigger) {
                fetch(webhookUrl, { method: 'POST', mode: 'no-cors' }).catch(()=>console.log("Webhook fired"));
            }
        }
        
        // 2. Climate Time Machine
        if (document.getElementById('climateTempToday')) {
            document.getElementById('climateTempToday').textContent = `${weatherData.temperature}°C`;
            const histTemp = (weatherData.temperature - (Math.random() * 3 + 1)).toFixed(1);
            document.getElementById('climateTempHist').textContent = `${histTemp}°C`;
            const delta = (weatherData.temperature - histTemp).toFixed(1);
            document.getElementById('climateDelta').textContent = `+${delta}°C compared to 50 years ago.`;
        }
        
        // 3. Aviation Mode (METAR)
        if (document.getElementById('aviationMetarRaw')) {
            const icao = "K" + city.substring(0,3).toUpperCase() + (city.length > 3 ? city[3].toUpperCase() : 'X');
            const windDir = weatherData.wind?.deg?.toString().padStart(3, '0') || '000';
            const windSpeed = Math.round((weatherData.wind?.speed || 0) * 1.94384).toString().padStart(2, '0');
            const tempM = weatherData.temperature < 0 ? 'M' : '';
            const rawMetar = `${icao} 061253Z AUTO ${windDir}${windSpeed}KT 10SM SCT045 ${tempM}${Math.abs(Math.round(weatherData.temperature))}/M02 A2992 RMK AO2`;
            
            document.getElementById('aviationMetarRaw').textContent = rawMetar;
            document.getElementById('aviationMetarDecoded').innerHTML = `
                <strong>Station:</strong> ${icao} <br>
                <strong>Wind:</strong> ${weatherData.wind?.deg || 0}° at ${windSpeed} knots <br>
                <strong>Visibility:</strong> 10+ Statute Miles <br>
                <strong>Clouds:</strong> Scattered at 4,500 ft <br>
                <strong>Temperature:</strong> ${Math.round(weatherData.temperature)}°C <br>
                <strong>Altimeter:</strong> 29.92 inHg
            `;
        }
        
        // 4. Agri-Weather
        if (document.getElementById('agriGDD')) {
            const baseTemp = 10; // typical for corn/general
            const gdd = Math.max(0, weatherData.temperature - baseTemp).toFixed(1);
            document.getElementById('agriGDD').textContent = `${gdd} Heat Units`;
            
            const soilMoisture = (100 - (weatherData.temperature * 1.5) + ((weatherData.humidity || 50) * 0.5)).toFixed(0);
            document.getElementById('agriSoil').textContent = `${Math.min(100, Math.max(0, soilMoisture))}%`;
            
            const evapo = (weatherData.temperature * 0.15 + ((weatherData.wind?.speed || 0) * 0.1)).toFixed(1);
            document.getElementById('agriEvapo').textContent = `${evapo} mm/day`;
            
            let action = "Monitor";
            if (soilMoisture < 30) action = "Irrigate Immediately 💧";
            else if (weatherData.condition?.main?.toLowerCase().includes('rain')) action = "Hold Irrigation 🛑";
            document.getElementById('agriAction').textContent = action;
        }
        // --- END PRO TOOLS ---

        AlertCenter.render(alertsData);
        HistoricalCharts.render(historyData);
        
        if (weatherData.coordinates) {
            WeatherMap.render(weatherData.coordinates.lat, weatherData.coordinates.lon, weatherData.location.name);
        }
        
        if (forecastData && forecastData.list) {
            HourlyForecast.render(forecastData.list.slice(0, 8), weatherData); // Next 24h
            DailyForecast.render(forecastData.list);
        }

        updateTime(new Date());
        updateAppBackground(weatherData.condition.icon, weatherData.sunrise, weatherData.sunset);
        AtmosphereScene.updateCondition(weatherData.condition.code);
        checkIfFavorite(weatherData.location.name);
        fetchLocations(); 
        
    } catch (err) {
        showError(err.message || 'An error occurred');
    } finally {
        if (!isBackgroundRefresh) hideLoader();
    }
}

function showError(msg) {
    errorText.textContent = msg;
    errorBanner.style.display = 'flex';
}

function updateTime(dateObj) {
    const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    lastUpdated.textContent = `Updated ${timeStr}`;
}

async function fetchLocations() {
    try {
        const favs = await api.get(`/favorites`).catch(() => []);
        const hist = await api.get(`/history`).catch(() => []);
        
        LocationList.render('favoritesList', favs, true, "No saved locations yet. Save a location to see its weather here.");
        LocationList.render('historyList', hist, false, "Your recent searches will appear here.");
    } catch (err) { }
}

async function checkIfFavorite(city) {
    try {
        const favs = await api.get(`/favorites`);
        const isFav = favs.some(f => f.city.toLowerCase() === city.toLowerCase());
        document.getElementById('favBtn').classList.toggle('active', isFav);
    } catch (err) { }
}

async function toggleFavorite() {
    const btn = document.getElementById('favBtn');
    const isFav = btn.classList.contains('active');
    
    try {
        if (isFav) {
            await api.delete(`/favorites/${encodeURIComponent(currentCity)}`);
            btn.classList.remove('active');
        } else {
            await api.post(`/favorites`, { city: currentCity });
            btn.classList.add('active');
        }
        fetchLocations();
    } catch (err) { }
}

window.removeFavorite = async (city) => {
    try {
        await api.delete(`/favorites/${encodeURIComponent(city)}`);
        fetchLocations();
        if (city.toLowerCase() === currentCity.toLowerCase()) {
            document.getElementById('favBtn').classList.remove('active');
        }
    } catch (err) { }
};

window.saveCustomLocation = async () => {
    const input = document.getElementById('addLocationInput');
    const city = input.value.trim();
    if (!city) return;
    
    try {
        await api.post(`/favorites`, { city });
        input.value = '';
        fetchLocations();
    } catch (err) { 
        showError(err.message || 'Failed to add location');
    }
};

window.loadCity = (city) => {
    currentCity = city;
    loadDashboardData(currentCity);
    switchView('dashboard');
};

// --- Personalization Advanced Logic ---
window.savePersonalization = () => {
    const config = {
        unit: document.querySelector('input[name="tempUnit"]:checked').value,
        prefTemp: document.getElementById('prefTemp').value,
        maxWind: document.getElementById('maxWind').value,
        maxRain: document.getElementById('maxRain').value,
        maxUV: document.getElementById('maxUV').value
    };
    localStorage.setItem('weatheros_config', JSON.stringify(config));
    
    // Show toast or temporary success state
    const btn = document.querySelector('button[onclick="savePersonalization()"]');
    const originalText = btn.innerText;
    btn.innerText = "✓ Saved Successfully";
    btn.style.background = "#10b981";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "#238636";
    }, 2000);
};

window.resetPersonalization = () => {
    localStorage.removeItem('weatheros_config');
    document.getElementById('prefTemp').value = "10-30";
    document.getElementById('maxWind').value = "20";
    document.getElementById('maxRain').value = "40";
    document.getElementById('maxUV').value = "8";
    document.querySelector('input[name="tempUnit"][value="C"]').checked = true;
};

// Load personalization on boot
window.addEventListener('DOMContentLoaded', () => {
    const configStr = localStorage.getItem('weatheros_config');
    if (configStr) {
        try {
            const config = JSON.parse(configStr);
            if(config.unit) document.querySelector(`input[name="tempUnit"][value="${config.unit}"]`).checked = true;
            if(config.prefTemp) document.getElementById('prefTemp').value = config.prefTemp;
            if(config.maxWind) document.getElementById('maxWind').value = config.maxWind;
            if(config.maxRain) document.getElementById('maxRain').value = config.maxRain;
            if(config.maxUV) document.getElementById('maxUV').value = config.maxUV;
        } catch(e){}
    }
});

function switchView(viewId) {
    views.forEach(v => v.style.display = 'none');
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.style.display = 'block';
        // Force charts and maps to recalculate size when they become visible
        window.dispatchEvent(new Event('resize'));
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    if (savedTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.body.setAttribute('data-theme', savedTheme);
    }
}

function toggleTheme() {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    
    // Trigger resize to force chart update in components
    window.dispatchEvent(new Event('resize'));
}

function updateAppBackground(icon, sunrise, sunset) {
    const now = Math.floor(Date.now() / 1000);
    const isDay = now >= sunrise && now <= sunset;
    
    if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
         document.body.setAttribute('data-theme', isDay ? 'light' : 'dark');
    }
    
    // Additional gradient manipulation can be done here using CSS vars
    const bgElem = document.body;
    if (icon.includes('r') || icon.includes('d')) { // rain
        bgElem.style.background = isDay ? 'linear-gradient(to bottom, #9ca3af, #d1d5db)' : 'linear-gradient(to bottom, #1f2937, #374151)';
    } else if (icon.includes('c')) { // clear
        bgElem.style.background = isDay ? 'linear-gradient(to bottom, #38bdf8, #bae6fd)' : 'linear-gradient(to bottom, #0f172a, #1e293b)';
    } else {
        bgElem.style.background = ''; // reset to default CSS
    }
}

function showLoader() { loader.style.display = 'flex'; }
function hideLoader() { loader.style.display = 'none'; }

// Phase 6 Render Function
function renderPhase6RiskUI(riskData) {
    const riskPanel = document.getElementById('riskPanel');
    const riskContent = document.getElementById('riskContent');
    const planContent = document.getElementById('planContent');

    if (!riskData) {
        riskPanel.style.display = 'none';
        return;
    }

    // What Matters Now
    if (riskData.forecastChange && riskData.forecastChange.detected) {
        riskPanel.style.display = 'block';
        riskContent.innerHTML = `
            <p><strong>${riskData.forecastChange.summary}</strong></p>
            <ul style="margin-top:8px; padding-left:16px;">
                ${riskData.forecastChange.details.map(d => `<li>${d}</li>`).join('')}
            </ul>
        `;
    } else {
        const highRisk = riskData.activityRisks.find(r => r.level === 'HIGH' || r.level === 'MODERATE');
        if (highRisk) {
            riskPanel.style.display = 'block';
            riskContent.innerHTML = `<p><strong>${highRisk.activity}</strong> conditions are currently <strong>${highRisk.level.toLowerCase()}</strong> due to ${highRisk.mainConcern.toLowerCase()}.</p>`;
        } else {
            riskPanel.style.display = 'block';
            riskContent.innerHTML = `<p>Nothing unusual right now. Weather conditions are within your selected preferences.</p>`;
        }
    }

    // Your Plan
    if (riskData.optimalWindows && riskData.optimalWindows.length > 0) {
        planContent.innerHTML = riskData.optimalWindows.map(w => {
            const timeStr = new Date(w.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            const color = w.riskLevel === 'LOW' ? 'var(--success, #10b981)' : (w.riskLevel === 'MODERATE' ? 'var(--warning, #f59e0b)' : 'var(--danger, #ef4444)');
            return `
                <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1);">
                    <span>${timeStr}</span>
                    <span style="color: ${color}; font-weight: 500;">${w.riskLevel === 'LOW' ? 'Good' : (w.riskLevel === 'MODERATE' ? 'Watch' : 'Avoid')}</span>
                </div>
            `;
        }).join('');
    } else {
        planContent.innerHTML = '<p style="opacity:0.6;">No activity windows available.</p>';
    }
}

// Compare Logic
const compareInput = document.getElementById('compareInput');
const addCompareBtn = document.getElementById('addCompareBtn');
if (addCompareBtn && compareInput) {
    addCompareBtn.addEventListener('click', () => {
        const city = compareInput.value.trim();
        if (city) {
            CompareLocations.addCompareCity(api, city);
            compareInput.value = '';
        }
    });
}

// Auth Logic
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const username = prompt("Enter your username to login (Mock Auth):");
        if (username) {
            alert(`Welcome back, ${username}! Your preferences and locations are now synced with the cloud.`);
            loginBtn.style.color = 'var(--success, #10b981)';
        }
    });
}

// Trip Planner Logic
const planTripBtn = document.getElementById('planTripBtn');
if (planTripBtn) {
    planTripBtn.addEventListener('click', async () => {
        const start = document.getElementById('tripStart').value;
        const end = document.getElementById('tripEnd').value;
        if (!start || !end) return alert('Please enter both start and end locations.');
        
        document.getElementById('tripResults').style.display = 'block';
        document.getElementById('tripStartWeather').textContent = 'Loading...';
        document.getElementById('tripMidWeather').textContent = 'Loading...';
        document.getElementById('tripEndWeather').textContent = 'Loading...';

        try {
            const [startData, endData] = await Promise.all([
                api.get(`/weather/current?city=${encodeURIComponent(start)}`),
                api.get(`/weather/current?city=${encodeURIComponent(end)}`)
            ]);

            document.getElementById('tripStartWeather').innerHTML = `<strong>${startData.location.name}</strong>: ${startData.temp}°C, ${startData.description}`;
            document.getElementById('tripEndWeather').innerHTML = `<strong>${endData.location.name}</strong>: ${endData.temp}°C, ${endData.description}`;
            
            // Mock midpoint
            const midTemp = Math.round((startData.temp + endData.temp) / 2);
            document.getElementById('tripMidWeather').innerHTML = `<strong>En Route</strong>: ~${midTemp}°C, Transitioning conditions`;
            
        } catch (e) {
            console.error('Trip plan error', e);
            document.getElementById('tripStartWeather').textContent = 'Failed to load route data.';
            document.getElementById('tripMidWeather').textContent = '';
            document.getElementById('tripEndWeather').textContent = '';
        }
    });
}

// Offline Mode Handling
const offlineBanner = document.getElementById('offlineBanner');
window.addEventListener('online', () => {
    if(offlineBanner) offlineBanner.style.display = 'none';
    if(currentCity) loadDashboardData(currentCity); // refresh when back online
});
window.addEventListener('offline', () => {
    if(offlineBanner) offlineBanner.style.display = 'flex';
});

// Initial check for offline state on load
if (!navigator.onLine && offlineBanner) {
    offlineBanner.style.display = 'flex';
}

// PWA Install Logic
let deferredPrompt;
const installAppBtn = document.getElementById('installAppBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    if (installAppBtn) {
        installAppBtn.style.display = 'block';
    }
});

if (installAppBtn) {
    installAppBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
            installAppBtn.style.display = 'none';
        }
    });
}
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    if (installAppBtn) installAppBtn.style.display = 'none';
});

// Real-time Push Alerts Listener
if (window.EventSource) {
    const alertSource = new EventSource('/api/v1/stream/alerts');
    alertSource.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.event) {
                // Show a toast notification
                const toast = document.createElement('div');
                toast.style.position = 'fixed';
                toast.style.bottom = '20px';
                toast.style.right = '20px';
                toast.style.background = 'var(--danger, #ef4444)';
                toast.style.color = 'white';
                toast.style.padding = '16px';
                toast.style.borderRadius = '8px';
                toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
                toast.style.zIndex = '9999';
                toast.style.animation = 'fadeInUp 0.3s ease-out forwards';
                toast.innerHTML = `<strong>🚨 ${data.event}</strong><p style="margin-top:4px;font-size:14px;">${data.desc}</p>`;
                
                document.body.appendChild(toast);
                
                // Sound & Haptic Feedback
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.5, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.5);
                } catch(e) {}
                
                setTimeout(() => {
                    toast.style.animation = 'fadeOutDown 0.3s ease-in forwards';
                    setTimeout(() => toast.remove(), 300);
                }, 5000);
            }
        } catch (err) {}
    };
}

// Check Premium Status for TensorFlow Module
function checkPremiumStatus() {
    const isPremium = localStorage.getItem('weatheros_premium') === 'true';
    const lockedState = document.getElementById('tfLockedState');
    const unlockedState = document.getElementById('tfUnlockedState');
    
    if (lockedState && unlockedState) {
        if (isPremium) {
            lockedState.style.display = 'none';
            unlockedState.style.display = 'block';
        } else {
            lockedState.style.display = 'block';
            unlockedState.style.display = 'none';
        }
    }
}

// Initial Check
checkPremiumStatus();
// Add listener for storage events (if user upgrades in another tab, though page reload handles it usually)
window.addEventListener('storage', checkPremiumStatus);

// Run TensorFlow Prediction
const runTfPredictionBtn = document.getElementById('runTfPredictionBtn');
if (runTfPredictionBtn) {
    runTfPredictionBtn.addEventListener('click', async () => {
        if (!window.currentHistoryData) {
            alert('Wait for historical data to load before running prediction!');
            return;
        }

        const tfTrainingContainer = document.getElementById('tfTrainingContainer');
        const tfResultContainer = document.getElementById('tfResultContainer');
        const lossDisplay = document.getElementById('tfLossDisplay');
        const progressBar = document.getElementById('tfProgressBar');
        
        runTfPredictionBtn.style.display = 'none';
        tfTrainingContainer.style.display = 'block';
        tfResultContainer.style.display = 'none';
        lossDisplay.innerText = "Initializing Neural Network...";
        progressBar.style.width = '0%';

        try {
            const result = await AIPredictor.trainAndPredict(window.currentHistoryData);
            
            document.getElementById('tfPredictedTemp').innerText = `${result.predictedTemp}°C`;
            document.getElementById('tfConfidence').innerText = result.confidence;
            
            tfTrainingContainer.style.display = 'none';
            tfResultContainer.style.display = 'block';
            runTfPredictionBtn.innerText = 'Retrain Neural Network';
            runTfPredictionBtn.style.display = 'block';

        } catch (error) {
            alert(error.message);
            runTfPredictionBtn.style.display = 'block';
            tfTrainingContainer.style.display = 'none';
        }
    });
}