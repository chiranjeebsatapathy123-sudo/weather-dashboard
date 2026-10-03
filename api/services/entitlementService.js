/**
 * Feature Entitlement Service
 * Acts as the billing-ready limits engine. Evaluates if an Organization is permitted to use a feature based on their Plan.
 */

const PLAN_LIMITS = {
    FREE: {
        max_locations: 3,
        webhooks_enabled: false,
        api_rate_limit: 100, // per day
        advanced_alerts: false
    },
    TEAM: {
        max_locations: 25,
        webhooks_enabled: true,
        api_rate_limit: 10000,
        advanced_alerts: true
    },
    BUSINESS: {
        max_locations: 1000,
        webhooks_enabled: true,
        api_rate_limit: 1000000,
        advanced_alerts: true
    }
};

module.exports = {
    /**
     * Checks if a specific feature flag is unlocked for the tenant.
     */
    canUseFeature: (organizationPlan, featureKey) => {
        const plan = PLAN_LIMITS[organizationPlan] || PLAN_LIMITS['FREE'];
        return plan[featureKey] === true;
    },

    /**
     * Validates if a tenant is allowed to create another resource of this type.
     */
    checkLimit: (organizationPlan, resourceKey, currentUsage) => {
        const plan = PLAN_LIMITS[organizationPlan] || PLAN_LIMITS['FREE'];
        const limit = plan[`max_${resourceKey}`];
        
        if (limit === undefined) return true; // Unlimited
        return currentUsage < limit;
    }
};
