# WeatherOS RBAC Permission Matrix

This document outlines the strict Role-Based Access Control (RBAC) enforced by the `AuthorizationService`.

## Roles

- **OWNER**: Absolute control over the Organization, including billing and destructive actions (deletion).
- **ADMIN**: Administrative control over workspaces, members, and API keys. Cannot delete the Organization or change billing.
- **MANAGER**: Operational control. Can create automations, configure alert policies, and manage Weather Boards inside Workspaces.
- **ANALYST**: Read-only access to advanced telemetry, forecast performance, and API usage analytics.
- **MEMBER**: Standard operational read access. Can view weather, events, and acknowledge incidents.
- **VIEWER**: Strict read-only access. Cannot acknowledge incidents.

## Action Matrix

| Permission | OWNER | ADMIN | MANAGER | ANALYST | MEMBER | VIEWER |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `VIEW_WEATHER` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `VIEW_ANALYTICS` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `ACKNOWLEDGE_INCIDENT` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `MANAGE_ALERTS` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `MANAGE_AUTOMATIONS` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `MANAGE_WORKSPACES` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `MANAGE_INTEGRATIONS` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `MANAGE_API_KEYS` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `MANAGE_MEMBERS` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `MANAGE_BILLING` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DELETE_ORG` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Implementation Note
The API route middleware intercepts requests, extracts the JWT `organization_roles` claim, verifies the target `organization_id` in the URL/Body, and strictly evaluates it against this matrix via `authorizationService.can()`.
