/**
 * WeatherOS Node.js SDK Example
 * Demonstrates consuming Operational Weather Intelligence APIs.
 */

class WeatherOSClient {
    constructor(apiKey, baseUrl = 'https://api.weatheros.com/v1') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            throw new Error(`WeatherOS API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    // Weather & Incidents
    async getWeather(location) { return this.request(`/weather/current?city=${location}`); }
    async getIncidents() { return this.request(`/incidents`); }
    async getAlerts() { return this.request(`/alerts`); }

    // Digital Twins & Operations
    async listLocations() { return this.request(`/locations`); }
    async getDeviceHealth(deviceId) { return this.request(`/devices/${deviceId}/health`); }
    
    // Work Orders
    async createWorkOrder(payload) {
        return this.request(`/work-orders`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
}

// Example Usage
(async () => {
    const client = new WeatherOSClient('weos_your_api_key_here');
    
    try {
        console.log("Fetching weather...");
        const weather = await client.getWeather('Tokyo');
        console.log(weather);

        console.log("Creating work order...");
        const task = await client.createWorkOrder({
            title: "Inspect Tokyo Warehouse Roof",
            priority: "HIGH",
            description: "Rain probability is 90%."
        });
        console.log(task);
    } catch (e) {
        console.error(e.message);
    }
})();
