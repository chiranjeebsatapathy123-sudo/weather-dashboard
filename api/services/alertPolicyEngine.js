/**
 * Alert Policy Engine
 * Determines whether a generated event should notify the user based on preferences and quiet hours.
 */

module.exports = {
    shouldNotify: (event, userPreferences) => {
        // 1. Check Quiet Hours
        if (userPreferences.quietHours && userPreferences.quietHours.enabled) {
            const currentHour = new Date().getHours();
            const { start, end } = userPreferences.quietHours;
            
            // Simplified quiet hours check (assuming same day for brevity)
            if (currentHour >= start || currentHour < end) {
                // Only bypass quiet hours for CRITICAL severity
                if (event.severity !== 'CRITICAL') {
                    return { notify: false, reason: 'SUPPRESSED_BY_QUIET_HOURS' };
                }
            }
        }

        // 2. Check Event Type Preferences
        if (event.event_type === 'heavy_rain_risk' && userPreferences.notifications?.rain === false) {
            return { notify: false, reason: 'SUPPRESSED_BY_USER_PREFERENCE' };
        }

        // 3. Deduplication Check (Has this exact event status been notified recently?)
        // (Assume we track notification deliveries here)

        return { notify: true, reason: 'POLICY_PASSED' };
    }
};
