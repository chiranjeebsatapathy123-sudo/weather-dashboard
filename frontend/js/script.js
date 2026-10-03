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

        // Render Components
        CurrentWeather.render(weatherData);
        WeatherMetrics.render(weatherData);
        WeatherBrief.render(weatherData, forecastData, riskData);
        // BestTime.render(weatherData, forecastData); // Replaced by Phase 6 Risk logic
        
        // Render Phase 6 Risk UI
        renderPhase6RiskUI(riskData);

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

window.loadCity = (city) => {
    currentCity = city;
    loadDashboardData(currentCity);
    switchView('dashboard');
};

function switchView(viewId) {
    views.forEach(v => v.style.display = 'none');
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.style.display = 'block';
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