/**
 * Playbook Engine
 * Pre-defined operational playbooks (templates) for rapid workflow creation.
 */
class PlaybookService {
    getPlaybook(playbookName) {
        const templates = {
            HEAVY_RAIN_PLAYBOOK: {
                name: "Heavy Rain Response",
                trigger_conditions: { event_type: "WEATHER_ALERT", severity: "HIGH", type: "RAIN" },
                actions: [
                    { type: "CREATE_WORK_ORDER", payload: { title: "Inspect drainage and assets", priority: "HIGH" }, requires_approval: false },
                    { type: "NOTIFY", payload: { channel: "MANAGERS", message: "Heavy rain alert triggered." }, requires_approval: false },
                    { type: "SHUTDOWN_OUTDOOR_EQUIPMENT", payload: {}, requires_approval: true } // Dangerous real-world action requires approval
                ]
            }
        };

        return templates[playbookName] || null;
    }
}

module.exports = new PlaybookService();
