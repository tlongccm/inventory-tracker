/**
 * Custom hook for synchronizing component state with URL parameters.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { parseUrlParams, serializeFilters } from '../utils/urlParams';

type FilterValue = string | string[] | number | boolean | undefined | null;

interface UseUrlStateOptions {
  /** Whether to replace history entry on state change (default: true for filters) */
  replaceHistory?: boolean;
}

interface UseUrlStateReturn<T extends Record<string, FilterValue>> {
  /** Current URL params parsed into an object */
  params: Partial<T>;
  /** Update URL params (merges with existing) */
  setParams: (newParams: Partial<T>, options?: { replace?: boolean }) => void;
  /** Clear all URL params */
  clearParams: () => void;
  /** Get the current full URL for sharing */
  getCurrentUrl: () => string;
}

/**
 * Hook for managing URL state synchronization.
 *
 * Usage:
 * ```tsx
 * const { params, setParams, clearParams, getCurrentUrl } = useUrlState<MyFilters>();
 *
 * // Read a param
 * const status = params.status;
 *
 * // Update params (replaces history by default)
 * setParams({ status: 'Active' });
 *
 * // Update params with push to history
 * setParams({ tab: 'subscriptions' }, { replace: false });
 *
 * // Get shareable URL
 * const shareUrl = getCurrentUrl();
 * ```
 */
export function useUrlState<T extends Record<string, FilterValue>>(
  options: UseUrlStateOptions = {}
): UseUrlStateReturn<T> {
  const { replaceHistory = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Parse current URL params
  const params = useMemo(() => {
    return parseUrlParams(searchParams) as Partial<T>;
  }, [searchParams]);

  // Update URL params
  const setParams = useCallback(
    (newParams: Partial<T>, opts?: { replace?: boolean }) => {
      const shouldReplace = opts?.replace ?? replaceHistory;

      // Merge new params with existing
      const currentParams = parseUrlParams(searchParams);
      const mergedParams = { ...currentParams, ...newParams };

      // Remove undefined/null values
      const cleanedParams: Record<string, FilterValue> = {};
      Object.entries(mergedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedParams[key] = value;
        }
      });

      const newSearchParams = serializeFilters(cleanedParams);
      setSearchParams(newSearchParams, { replace: shouldReplace });
    },
    [searchParams, setSearchParams, replaceHistory]
  );

  // Clear all URL params
  const clearParams = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Get current full URL for sharing
  const getCurrentUrl = useCallback(() => {
    return `${window.location.origin}${location.pathname}${location.search}`;
  }, [location.pathname, location.search]);

  return {
    params,
    setParams,
    clearParams,
    getCurrentUrl,
  };
}

/**
 * Hook specifically for managing tab state in URL.
 * Tab changes push to history (for back/forward navigation).
 */
export function useUrlTab(defaultTab: string = 'equipment') {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const currentTab = searchParams.get('tab') || defaultTab;

  const setTab = useCallback(
    (tab: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', tab);
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: false });
    },
    [navigate, searchParams, location.pathname]
  );

  return { currentTab, setTab };
}

/**
 * Hook for syncing filter state with URL.
 * Returns both the parsed filter values and sync functions.
 */
export function useFilterSync<T extends Record<string, FilterValue>>(
  _initialFilters: T,
  setFilters: (filters: T) => void
) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync filters to URL when they change
  const syncToUrl = useCallback(
    (newFilters: T) => {
      const params = serializeFilters(newFilters as Record<string, FilterValue>);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Load filters from URL on mount
  useEffect(() => {
    const urlParams = parseUrlParams(searchParams);
    if (Object.keys(urlParams).length > 0) {
      setFilters(urlParams as T);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return { syncToUrl };
}

export default useUrlState;
