// ============================================================
// AgriCure — Data Hooks
// Wraps API calls with loading/error state.
// Polling interval configurable per hook.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/api';
import type {
  SystemStatus,
  DashboardStats,
  CameraFrame,
  StandPosition,
  Detection,
  PlantPassport,
  Treatment,
  EnvironmentReading,
} from '@/types';

// ── Generic polling hook ──────────────────────────────────

function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs = 5000
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref so the stable `fetch` callback always calls the latest fetcher
  // without being recreated on every render (which would restart the interval).
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetch = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []); // stable — never recreated

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, intervalMs);
    return () => clearInterval(id);
  }, [fetch, intervalMs]);

  return { data, loading, error, refetch: fetch };
}

// ── Domain hooks ──────────────────────────────────────────

export const useSystemStatus = () =>
  usePolling<SystemStatus>(api.getSystemStatus, 10_000);

export const useDashboardStats = () =>
  usePolling<DashboardStats>(api.getDashboardStats, 30_000);

export const useCameraFrame = () =>
  usePolling<CameraFrame>(api.getCameraFrame, 1_000); // 1s — near real-time

export const useStandPosition = () =>
  usePolling<StandPosition>(api.getStandPosition, 2_000);

export const useDetections = (limit = 20) =>
  usePolling<Detection[]>(() => api.getDetections(limit), 5_000);

export const useEnvironment = () =>
  usePolling<EnvironmentReading>(api.getEnvironment, 15_000);

export function usePassport(plantId: string | null) {
  return usePolling<PlantPassport>(
    () => api.getPassport(plantId ?? ''),
    60_000
  );
}

export function useTreatments(diseaseClass: string | null) {
  return usePolling<Treatment[]>(
    () => api.getTreatments(diseaseClass ?? ''),
    300_000 // treatments don't change often
  );
}
