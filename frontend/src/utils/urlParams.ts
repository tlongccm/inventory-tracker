/**
 * URL parameter utilities for encoding/decoding app state in URLs.
 */

/**
 * Common URL parameters used across all tabs.
 */
export interface CommonUrlParams {
  tab?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

/**
 * Equipment-specific URL parameters.
 */
export interface EquipmentUrlParams extends CommonUrlParams {
  type?: string;
  status?: string;
  location?: string;
  views?: string[];
}

/**
 * Software-specific URL parameters.
 */
export interface SoftwareUrlParams extends CommonUrlParams {
  status?: string;
  category?: string;
  views?: string[];
}

/**
 * Subscription-specific URL parameters.
 */
export interface SubscriptionUrlParams extends CommonUrlParams {
  status?: string;
  category_id?: number;
  owner?: string;
  value_level?: string;
  views?: string[];
}

/**
 * Parse URL search params into a typed object.
 * Handles comma-separated values for arrays (e.g., views).
 */
export function parseUrlParams(searchParams: URLSearchParams): Record<string, string | string[] | number | undefined> {
  const params: Record<string, string | string[] | number | undefined> = {};

  searchParams.forEach((value, key) => {
    if (!value) return;

    // Handle known array fields (comma-separated)
    if (key === 'views') {
      params[key] = value.split(',').filter(Boolean);
    }
    // Handle known numeric fields
    else if (key === 'category_id') {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        params[key] = num;
      }
    }
    // All other fields are strings
    else {
      params[key] = value;
    }
  });

  return params;
}

/**
 * Serialize filters/state to URL search params.
 * Handles arrays by joining with commas.
 * Omits undefined/null/empty values.
 */
export function serializeFilters(
  filters: Record<string, string | string[] | number | boolean | undefined | null>
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    // Skip undefined, null, or empty values
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Handle arrays (join with comma)
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','));
      }
    }
    // Handle booleans
    else if (typeof value === 'boolean') {
      params.set(key, value.toString());
    }
    // Handle numbers
    else if (typeof value === 'number') {
      params.set(key, value.toString());
    }
    // Handle strings
    else {
      params.set(key, value);
    }
  });

  return params;
}

/**
 * Build a full URL with the given search params.
 */
export function buildUrl(pathname: string, params: URLSearchParams): string {
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/**
 * Check if URL length is within browser limits.
 * Most browsers support ~2000 characters.
 */
export function isUrlLengthValid(url: string, maxLength: number = 2000): boolean {
  return url.length <= maxLength;
}

/**
 * Safely parse a URL parameter value, returning undefined for invalid/empty values.
 */
export function safeParseParam(value: string | null): string | undefined {
  if (!value || value.trim() === '') {
    return undefined;
  }
  return value;
}

/**
 * Parse numeric URL parameter, returning undefined for invalid values.
 */
export function parseNumericParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}

/**
 * Parse comma-separated array parameter.
 */
export function parseArrayParam(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const arr = value.split(',').map(s => s.trim()).filter(Boolean);
  return arr.length > 0 ? arr : undefined;
}

/**
 * Validate sort order parameter.
 * Returns the value if valid, undefined otherwise.
 */
export function validateSortOrder(value: string | undefined): 'asc' | 'desc' | undefined {
  if (value === 'asc' || value === 'desc') {
    return value;
  }
  return undefined;
}

/**
 * Validate a value against a list of allowed values.
 * Returns the value if it's in the allowed list, undefined otherwise.
 */
export function validateEnumParam<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[]
): T | undefined {
  if (value && allowedValues.includes(value as T)) {
    return value as T;
  }
  return undefined;
}

/**
 * Get the current URL with all search params for sharing.
 */
export function getCurrentShareableUrl(): string {
  return window.location.href;
}

/**
 * Warn if URL is approaching the length limit.
 * Returns true if URL is nearing the limit (>1800 chars).
 */
export function isUrlNearingLimit(url: string): boolean {
  return url.length > 1800;
}
