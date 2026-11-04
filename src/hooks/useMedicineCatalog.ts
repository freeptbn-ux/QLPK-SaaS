'use client';

import { useSyncExternalStore, useEffect, useCallback, useMemo } from 'react';
import { getAllActiveMedicines } from '@/actions/medicines';
import { Medicine } from '@/types/database';

export interface MedicineCatalogState {
  medicines: Medicine[];
  isLoading: boolean;
  isValidating: boolean;
  error: Error | string | null;
  timestamp: number;
}

export interface UseMedicineCatalogOptions {
  clinicId?: string | number;
  ttlMs?: number;
  enabled?: boolean;
}

export interface UseMedicineCatalogReturn {
  medicines: Medicine[];
  isLoading: boolean;
  isValidating: boolean;
  error: Error | string | null;
  invalidate: () => Promise<Medicine[]>;
  refetch: () => Promise<Medicine[]>;
}

export const DEFAULT_CATALOG_TTL_MS = 5 * 60 * 1000; // 5 minutes

const DEFAULT_SNAPSHOT: MedicineCatalogState = Object.freeze({
  medicines: [],
  isLoading: false,
  isValidating: false,
  error: null,
  timestamp: 0,
});

// Cache store keyed by tenant / clinic
const cacheByTenant = new Map<string, MedicineCatalogState>();
const listenersByTenant = new Map<string, Set<() => void>>();
const inFlightRequestsByTenant = new Map<string, Promise<Medicine[]>>();
const requestCounterByTenant = new Map<string, number>();

function getTenantKey(clinicId?: string | number): string {
  return clinicId !== undefined && clinicId !== null ? String(clinicId) : 'default';
}

export function getMedicineCatalogSnapshot(clinicId?: string | number): MedicineCatalogState {
  const key = getTenantKey(clinicId);
  return cacheByTenant.get(key) || DEFAULT_SNAPSHOT;
}

function getServerSnapshot(): MedicineCatalogState {
  return DEFAULT_SNAPSHOT;
}

function subscribe(tenantKey: string, listener: () => void): () => void {
  let listeners = listenersByTenant.get(tenantKey);
  if (!listeners) {
    listeners = new Set();
    listenersByTenant.set(tenantKey, listeners);
  }
  listeners.add(listener);

  return () => {
    listeners?.delete(listener);
    if (listeners && listeners.size === 0) {
      listenersByTenant.delete(tenantKey);
    }
  };
}

function notify(tenantKey: string) {
  const listeners = listenersByTenant.get(tenantKey);
  if (listeners) {
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in medicine catalog subscriber listener:', err);
      }
    });
  }
}

async function fetchCatalog(tenantKey: string = 'default', force: boolean = false): Promise<Medicine[]> {
  const inFlight = inFlightRequestsByTenant.get(tenantKey);
  if (inFlight && !force) {
    return inFlight;
  }

  const currentCount = (requestCounterByTenant.get(tenantKey) || 0) + 1;
  requestCounterByTenant.set(tenantKey, currentCount);

  const prevEntry = cacheByTenant.get(tenantKey) || DEFAULT_SNAPSHOT;
  const isInitialLoad = prevEntry.medicines.length === 0;

  // Set loading / validating state
  const loadingEntry: MedicineCatalogState = {
    ...prevEntry,
    isLoading: isInitialLoad,
    isValidating: true,
  };
  cacheByTenant.set(tenantKey, loadingEntry);
  notify(tenantKey);

  const promise = (async () => {
    try {
      const res = await getAllActiveMedicines();

      // Check if superseded by another request
      if (requestCounterByTenant.get(tenantKey) !== currentCount) {
        return (cacheByTenant.get(tenantKey) || DEFAULT_SNAPSHOT).medicines;
      }

      if (res?.error) {
        throw new Error(res.error);
      }

      const medicines = Array.isArray(res?.data) ? res.data : [];
      const newEntry: MedicineCatalogState = {
        medicines,
        isLoading: false,
        isValidating: false,
        error: null,
        timestamp: Date.now(),
      };
      cacheByTenant.set(tenantKey, newEntry);
      notify(tenantKey);
      return medicines;
    } catch (err: any) {
      if (requestCounterByTenant.get(tenantKey) === currentCount) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        const current = cacheByTenant.get(tenantKey) || DEFAULT_SNAPSHOT;
        const failedEntry: MedicineCatalogState = {
          ...current,
          isLoading: false,
          isValidating: false,
          error: errorObj,
        };
        cacheByTenant.set(tenantKey, failedEntry);
        notify(tenantKey);
      }
      throw err;
    } finally {
      if (requestCounterByTenant.get(tenantKey) === currentCount) {
        inFlightRequestsByTenant.delete(tenantKey);
      }
    }
  })();

  inFlightRequestsByTenant.set(tenantKey, promise);
  return promise;
}

export async function invalidateMedicineCatalog(clinicId?: string | number): Promise<Medicine[]> {
  const key = getTenantKey(clinicId);
  return fetchCatalog(key, true);
}

export function clearMedicineCatalogCache(clinicId?: string | number): void {
  if (clinicId !== undefined && clinicId !== null) {
    const key = getTenantKey(clinicId);
    requestCounterByTenant.set(key, (requestCounterByTenant.get(key) || 0) + 1);
    inFlightRequestsByTenant.delete(key);
    cacheByTenant.delete(key);
    notify(key);
  } else {
    for (const key of Array.from(cacheByTenant.keys())) {
      requestCounterByTenant.set(key, (requestCounterByTenant.get(key) || 0) + 1);
      notify(key);
    }
    inFlightRequestsByTenant.clear();
    cacheByTenant.clear();
    requestCounterByTenant.clear();
  }
}

export function prefetchMedicineCatalog(clinicId?: string | number): Promise<Medicine[]> {
  const key = getTenantKey(clinicId);
  const entry = cacheByTenant.get(key);
  if (entry && entry.medicines.length > 0 && Date.now() - entry.timestamp < DEFAULT_CATALOG_TTL_MS) {
    return Promise.resolve(entry.medicines);
  }
  return fetchCatalog(key, false);
}

export function useMedicineCatalog(options?: UseMedicineCatalogOptions): UseMedicineCatalogReturn {
  const clinicId = options?.clinicId;
  const ttl = options?.ttlMs ?? DEFAULT_CATALOG_TTL_MS;
  const enabled = options?.enabled ?? true;
  const tenantKey = getTenantKey(clinicId);

  const subscribeTenant = useCallback(
    (listener: () => void) => subscribe(tenantKey, listener),
    [tenantKey]
  );

  const getSnapshotTenant = useCallback(
    () => getMedicineCatalogSnapshot(tenantKey),
    [tenantKey]
  );

  const state = useSyncExternalStore(
    subscribeTenant,
    getSnapshotTenant,
    getServerSnapshot
  );

  useEffect(() => {
    if (!enabled) return;

    const isStale = Date.now() - state.timestamp > ttl;
    const hasData = state.medicines.length > 0;

    if (!hasData && state.timestamp === 0) {
      fetchCatalog(tenantKey, false).catch(() => {});
    } else if (isStale) {
      fetchCatalog(tenantKey, false).catch(() => {});
    }
  }, [tenantKey, enabled, state.timestamp, state.medicines.length, ttl]);

  const invalidate = useCallback(() => {
    return invalidateMedicineCatalog(clinicId);
  }, [clinicId]);

  const refetch = useCallback(() => {
    return invalidateMedicineCatalog(clinicId);
  }, [clinicId]);

  return {
    medicines: state.medicines,
    isLoading: state.isLoading,
    isValidating: state.isValidating,
    error: state.error,
    invalidate,
    refetch,
  };
}

export default useMedicineCatalog;

