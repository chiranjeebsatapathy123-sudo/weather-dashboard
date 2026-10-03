/**
 * Generic Integration Architecture
 */
class IntegrationProvider {
    constructor(config) {
        this.config = config;
    }

    async send(payload) {
        throw new Error("Method 'send()' must be implemented.");
    }

    async testConnection() {
        throw new Error("Method 'testConnection()' must be implemented.");
    }

    validateConfig(config) {
        throw new Error("Method 'validateConfig()' must be implemented.");
    }

    async healthCheck() {
        try {
            await this.testConnection();
            return { status: "HEALTHY" };
        } catch (e) {
            return { status: "UNHEALTHY", error: e.message };
        }
    }
}

module.exports = IntegrationProvider;
