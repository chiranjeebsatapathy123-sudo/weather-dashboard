/**
 * AI Tool Permission Service
 * Enforces strict authorization before an agent can invoke a tool.
 */
class AIToolPermissionService {
    
    canExecute(agent, tool, context) {
        // 1. Is tool read-only? If not, check if context explicitly permits execution.
        if (!tool.read_only && context.executionMode !== 'AUTHORIZED') {
            return {
                allowed: false,
                reason: "Execution denied. Agent is in ADVISORY mode."
            };
        }

        // 2. Tenant isolation check
        if (tool.tenant_scoped && !context.orgId) {
            return {
                allowed: false,
                reason: "Execution denied. Tenant context missing."
            };
        }

        // 3. Permission mapping
        const missingPermissions = tool.required_permissions.filter(p => !agent.required_permissions.includes(p));
        if (missingPermissions.length > 0) {
            return {
                allowed: false,
                reason: `Execution denied. Agent lacks permissions: ${missingPermissions.join(', ')}`
            };
        }

        return { allowed: true };
    }
}

module.exports = new AIToolPermissionService();
