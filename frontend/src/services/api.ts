/// <reference types="vite/client" />

import type {
  Detection,
  DashboardStats,
  StandPosition,
  CameraFrame,
  PlantPassport,
  Treatment,
  EnvironmentReading,
  SystemStatus,
  CreateDetectionRequest,
  UpdateDetectionRequest,
} from "@/types";
import { authApi } from "@/services/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

// ── Token storage ─────────────────────────────────────────

const ACCESS_KEY  = "agricure_access_token";
const REFRESH_KEY = "agricure_refresh_token";

export const tokenStore = {
  getAccess:  () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    window.dispatchEvent(new Event("agricure:logout"));
  },
};

export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AuthError";
  }
}

// ── Generic fetch helper ──────────────────────────────────

interface FetchOptions {
  method?: string;
  body?: unknown;
}

async function apiFetch<T>(path: string, options?: FetchOptions): Promise<T> {
  if (!API_BASE) {
    return getMockData(path) as T;
  }
  return doFetch<T>(path, options);
}

async function doFetch<T>(path: string, options?: FetchOptions, retried = false): Promise<T> {
  const token = tokenStore.getAccess();
  const method = options?.method ?? "GET";
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options?.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 && !retried) {
    const refresh = tokenStore.getRefresh();
    if (refresh) {
      try {
        const result = await authApi.refresh(refresh);
        tokenStore.set(result.accessToken, result.refreshToken);
        return doFetch<T>(path, options, true);
      } catch {
        // refresh failed — fall through to clear + throw
      }
    }
    tokenStore.clear();
    throw new AuthError();
  }

  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── API functions ─────────────────────────────────────────

export const api = {
  /** GET /api/system/status */
  getSystemStatus: () => apiFetch<SystemStatus>("/api/system/status"),

  /** GET /api/dashboard/stats */
  getDashboardStats: () => apiFetch<DashboardStats>("/api/dashboard/stats"),

  /** GET /api/camera/frame — latest frame metadata */
  getCameraFrame: () => apiFetch<CameraFrame>("/api/camera/frame"),

  /** GET /api/stand/position — current stand GPS + row position */
  getStandPosition: () => apiFetch<StandPosition>("/api/stand/position"),

  /** GET /api/detections?limit=20 — recent detections */
  getDetections: (limit = 20) =>
    apiFetch<Detection[]>(`/api/detections?limit=${limit}`),

  /** GET /api/detections/:id */
  getDetection: (id: string) => apiFetch<Detection>(`/api/detections/${id}`),

  /** POST /api/detections */
  createDetection: (data: CreateDetectionRequest) =>
    apiFetch<{ id: string }>("/api/detections", { method: "POST", body: data }),

  /** PUT /api/detections/:id */
  updateDetection: (id: string, data: UpdateDetectionRequest) =>
    apiFetch<void>(`/api/detections/${id}`, { method: "PUT", body: data }),

  /** DELETE /api/detections/:id */
  deleteDetection: (id: string) =>
    apiFetch<void>(`/api/detections/${id}`, { method: "DELETE" }),

  /** GET /api/passports/:plantId */
  getPassport: (plantId: string) =>
    apiFetch<PlantPassport>(`/api/passports/${plantId}`),

  /** GET /api/treatments?diseaseClass=late_blight */
  getTreatments: (diseaseClass: string) =>
    apiFetch<Treatment[]>(`/api/treatments?diseaseClass=${diseaseClass}`),

  /** GET /api/environment/latest */
  getEnvironment: () => apiFetch<EnvironmentReading>("/api/environment/latest"),
};

// ============================================================
// MOCK DATA — used when VITE_API_BASE_URL is not set
// ============================================================

function getMockData(path: string): unknown {
  if (path.includes("/api/system/status")) return MOCK_SYSTEM;
  if (path.includes("/api/dashboard/stats")) return MOCK_STATS;
  if (path.includes("/api/camera/frame")) return MOCK_FRAME;
  if (path.includes("/api/stand/position")) return MOCK_POSITION;
  if (path.includes("/api/detections") && !path.includes("/api/detections/"))
    return MOCK_DETECTIONS;
  if (path.includes("/api/passports/")) return MOCK_PASSPORT;
  if (path.includes("/api/treatments")) return MOCK_TREATMENTS;
  if (path.includes("/api/environment")) return MOCK_ENV;
  return null;
}

const MOCK_SYSTEM: SystemStatus = {
  deviceStatus: "online",
  cameraConnected: true,
  gpsActive: true,
  modelLoaded: true,
  modelName: "YOLOv8s-tomato-v2",
  syncedAt: new Date().toISOString(),
  pendingAlerts: 2,
};

const MOCK_STATS: DashboardStats = {
  detectionsToday: 17,
  detectionsDelta: 5,
  avgConfidence: 0.914,
  rowsScanned: 12,
  totalRows: 14,
  plantsTracked: 284,
};

export const MOCK_POSITION: StandPosition = {
  gps: { lat: 47.0245, lon: 28.8323 },
  row: 7,
  totalRows: 14,
  positionMeters: 12.4,
  heightMeters: 1.2,
  speedMs: 0.3,
};

const MOCK_FRAME: CameraFrame = {
  frameId: 4821,
  timestamp: new Date().toISOString(),
  resolution: "1080p",
  fps: 30,
  isRecording: true,
  depthMeters: 0.42,
  position: MOCK_POSITION,
};

export const MOCK_DETECTIONS: Detection[] = [
  {
    id: "det-001",
    frameId: 4821,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    severity: "critical",
    topPrediction: {
      diseaseClass: "late_blight",
      confidence: 0.942,
      label: "Late Blight (P. infestans)",
    },
    allPredictions: [
      { diseaseClass: "late_blight", confidence: 0.942, label: "Late Blight" },
      { diseaseClass: "healthy", confidence: 0.04, label: "Healthy" },
      { diseaseClass: "early_blight", confidence: 0.02, label: "Early Blight" },
    ],
    boundingBox: {
      x: 0.52,
      y: 0.32,
      width: 0.24,
      height: 0.28,
      depthMeters: 0.42,
      affectedAreaPercent: 18,
    },
    inferenceMs: 38,
    confidenceGatePassed: true,
    row: 7,
    plantId: "P023",
    positionMeters: 12.4,
  },
  {
    id: "det-002",
    frameId: 4763,
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    severity: "warning",
    topPrediction: {
      diseaseClass: "early_blight",
      confidence: 0.876,
      label: "Early Blight (A. solani)",
    },
    allPredictions: [
      {
        diseaseClass: "early_blight",
        confidence: 0.876,
        label: "Early Blight",
      },
      { diseaseClass: "healthy", confidence: 0.08, label: "Healthy" },
    ],
    boundingBox: {
      x: 0.35,
      y: 0.4,
      width: 0.18,
      height: 0.22,
      depthMeters: 0.9,
      affectedAreaPercent: 11,
    },
    inferenceMs: 35,
    confidenceGatePassed: true,
    row: 4,
    plantId: "P011",
    positionMeters: 8.1,
  },
  {
    id: "det-003",
    frameId: 4701,
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    severity: "healthy",
    topPrediction: {
      diseaseClass: "healthy",
      confidence: 1.0,
      label: "Healthy",
    },
    allPredictions: [
      { diseaseClass: "healthy", confidence: 1.0, label: "Healthy" },
    ],
    boundingBox: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      depthMeters: 0,
      affectedAreaPercent: 0,
    },
    inferenceMs: 33,
    confidenceGatePassed: true,
    row: 2,
    plantId: "P008",
    positionMeters: 5.2,
  },
];

export const MOCK_PASSPORT: PlantPassport = {
  id: "passport-P023",
  plantIndex: 23,
  row: 7,
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  currentStatus: "critical",
  events: [
    {
      id: "ev-004",
      type: "disease",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      title: "Late blight detected — high severity",
      description: "94.2% confidence · 18% leaf area · depth 0.42m",
      confidence: 0.942,
      severity: "critical",
    },
    {
      id: "ev-003",
      type: "symptom",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      title: "Early symptom — leaf discoloration",
      description: "71% confidence · flagged for watch",
      confidence: 0.71,
      severity: "warning",
    },
    {
      id: "ev-002",
      type: "healthy",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      title: "Healthy scan — no disease",
      description: "Full row scan · depth 1.1m",
      severity: "healthy",
    },
    {
      id: "ev-001",
      type: "created",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      title: "Passport created — transplant day",
      description: "Plant registered in system",
    },
  ],
  severityHistory: Array.from({ length: 9 }, (_, i) => ({
    date: new Date(Date.now() - (8 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    value: [18, 22, 16, 25, 20, 32, 48, 80, 97][i],
  })),
};

export const MOCK_TREATMENTS: Treatment[] = [
  {
    id: "tr-001",
    name: "Trichoderma harzianum",
    type: "biological",
    rank: 1,
    description:
      "Apply 2g/L foliar spray. Works against 9 of 9 tomato disease classes.",
    dosage: "2g/L foliar spray",
    repeatAfterDays: 7,
    phiDays: 0,
    costLevel: "low",
    tags: ["Biological", "PHI: 0 days", "Low cost"],
  },
  {
    id: "tr-002",
    name: "Chlorothalonil 75% WP",
    type: "chemical",
    rank: 2,
    description: "Use if spread exceeds 3+ rows. Use protective gear.",
    dosage: "1.5g/L",
    repeatAfterDays: 10,
    phiDays: 7,
    costLevel: "medium",
    tags: ["Chemical", "PHI: 7 days", "Moderate cost"],
  },
];

const MOCK_ENV: EnvironmentReading = {
  timestamp: new Date().toISOString(),
  temperatureC: 24.3,
  humidityPercent: 68,
};
