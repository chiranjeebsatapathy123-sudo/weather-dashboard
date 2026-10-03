/**
 * Tenant Isolation Middleware
 * Enforces that every request bound for an organization is authorized and scoped.
 */

const { can, enforceTenantBoundary } = require('../services/authorizationService');
const { errorResponse } = require('../utils/response');

module.exports = {
    /**
     * Middleware to enforce RBAC and Tenant boundary on a specific route.
     * @param {String} requiredPermission 
     */
    requireOrganizationAccess: (requiredPermission) => {
        return (req, res, next) => {
            // Strictly enforce authentication boundary
            if (!req.user) {
                return errorResponse(res, "UNAUTHORIZED", "Authentication required.", 401);
            }
            const user = req.user;

            const targetOrgId = req.params.orgId || req.body.organization_id || req.query.organization_id;

            if (!targetOrgId) {
                return errorResponse(res, "TENANT_REQUIRED", "Organization context is missing from request.", 400);
            }

            // 1. Verify Tenant Boundary (e.g. they aren't trying to access 'org-acme' using an 'org-weatheros' token)
            if (!user.organization_roles[targetOrgId]) {
                return errorResponse(res, "FORBIDDEN", "You do not belong to this organization.", 403);
            }

            // 2. Enforce RBAC
            if (!can(user, requiredPermission, targetOrgId)) {
                return errorResponse(res, "UNAUTHORIZED", `Missing required permission: ${requiredPermission}`, 403);
            }

            // Attach the validated tenant ID to the request for downstream database queries
            req.tenantId = targetOrgId;
            next();
        };
    }
};
