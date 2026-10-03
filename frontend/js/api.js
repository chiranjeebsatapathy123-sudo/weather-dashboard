class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s frontend timeout

        const config = {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle standardized error format if available
                if (data.error && data.error.message) {
                    throw new Error(data.error.message);
                }
                throw new Error(data.message || 'An unexpected error occurred');
            }
            
            // If backend uses standard format, return data payload, else return raw
            return data.success ? data.data : data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your connection.');
            }
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient('/api/v1');
export const legacyApi = new ApiClient('/api'); // For endpoints not yet migrated
