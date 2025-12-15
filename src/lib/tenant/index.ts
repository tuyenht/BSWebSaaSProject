/**
 * Tenant/Site resolver placeholder
 * Phase 1: defaults to single tenant/site
 */

export const TENANT_DEFAULT_ID = process.env.TENANT_DEFAULT_ID || "default";
export const SITE_DEFAULT_ID = process.env.SITE_DEFAULT_ID || "default";

export function getTenantId(): string {
  // TODO: Resolve from request context
  return TENANT_DEFAULT_ID;
}

export function getSiteId(): string {
  // TODO: Resolve from request context
  return SITE_DEFAULT_ID;
}

