/**
 * Authorization Service
 * Enforces Role-Based Access Control (RBAC) across the organization resources.
 */

const ROLE_PERMISSIONS = {
    OWNER: ['MANAGE_ORG', 'MANAGE_BILLING', 'MANAGE_MEMBERS', 'MANAGE_WORKSPACES', 'MANAGE_INTEGRATIONS', 'MANAGE_API_KEYS', 'VIEW_WEATHER'],
    ADMIN: ['MANAGE_MEMBERS', 'MANAGE_WORKSPACES', 'MANAGE_INTEGRATIONS', 'MANAGE_API_KEYS', 'VIEW_WEATHER'],
    MANAGER: ['MANAGE_WORKSPACES', 'MANAGE_ALERTS', 'MANAGE_AUTOMATIONS', 'VIEW_WEATHER'],
    ANALYST: ['VIEW_ANALYTICS', 'VIEW_WEATHER'],
    MEMBER: ['VIEW_WEATHER'],
    VIEWER: ['VIEW_WEATHER']
};

module.exports = {
    /**
     * @param {Object} user - The authenticated user object (must contain organization_roles mapping)
     * @param {String} permission - The requested permission string (e.g. 'MANAGE_ALERTS')
     * @param {String} organizationId - The target organization
     */
    can: (user, permission, organizationId) => {
        if (!user || !user.organization_roles || !organizationId) return false;

        const userRole = user.organization_roles[organizationId];
        if (!userRole) return false;

        const allowedPermissions = ROLE_PERMISSIONS[userRole] || [];
        
        return allowedPermissions.includes(permission) || allowedPermissions.includes('MANAGE_ORG');
    },

    /**
     * Verifies that the user is actually requesting a resource they own or have access to.
     */
    enforceTenantBoundary: (resourceOrgId, requestedOrgId) => {
        return resourceOrgId === requestedOrgId;
    }
};
