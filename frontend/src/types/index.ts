export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

// ── Camera & Position ────────────────────────────────────

export interface GpsCoordinates {
  lat: number;
  lon: number;
}

export interface StandPosition {
  gps: GpsCoordinates;
  row: number;
  totalRows: number;
  positionMeters: number;
  heightMeters: number;
  speedMs: number;
}

export interface CameraFrame {
  frameId: number;
  timestamp: string;
  resolution: string;
  fps: number;
  isRecording: boolean;
  depthMeters: number;
  position: StandPosition;
}

// ── Detection ────────────────────────────────────────────

export type DiseaseClass =
  | 'late_blight'
  | 'early_blight'
  | 'fusarium_wilt'
  | 'powdery_mildew'
  | 'bacterial_spot'
  | 'leaf_mold'
  | 'septoria_leaf_spot'
  | 'spider_mites'
  | 'healthy';

export type DetectionSeverity = 'critical' | 'warning' | 'healthy';

export interface ClassPrediction {
  diseaseClass: DiseaseClass;
  confidence: number; // 0–1
  label: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  depthMeters: number;
  affectedAreaPercent: number;
}

export interface Detection {
  id: string;
  frameId: number;
  timestamp: string;
  severity: DetectionSeverity;
  topPrediction: ClassPrediction;
  allPredictions: ClassPrediction[];
  boundingBox: BoundingBox;
  inferenceMs: number;
  confidenceGatePassed: boolean; // >= 60%
  row: number;
  plantId: string;
  positionMeters: number;
}

// ── Detection write DTOs ─────────────────────────────────

export interface DetectionWriteBase {
  frameId: number;
  timestamp: string;
  severity: DetectionSeverity;
  predictions: ClassPrediction[];
  boundingBox: BoundingBox;
  inferenceMs: number;
  confidenceGatePassed: boolean;
  row: number;
  plantId: string;
  positionMeters: number;
}

export type CreateDetectionRequest = DetectionWriteBase;

export interface UpdateDetectionRequest extends DetectionWriteBase {
  id: string;
}

// ── Plant Passport ───────────────────────────────────────

export type PassportEventType = 'created' | 'healthy' | 'symptom' | 'disease' | 'treatment' | 'resolved';

export interface PassportEvent {
  id: string;
  type: PassportEventType;
  timestamp: string;
  title: string;
  description: string;
  detectionId?: string;
  confidence?: number;
  severity?: DetectionSeverity;
}

export interface PlantPassport {
  id: string;
  plantIndex: number;
  row: number;
  createdAt: string;
  currentStatus: DetectionSeverity;
  events: PassportEvent[];
  severityHistory: { date: string; value: number }[]; // 0–100
}

// ── Treatment ────────────────────────────────────────────

export type TreatmentType = 'biological' | 'chemical';

export interface Treatment {
  id: string;
  name: string;
  type: TreatmentType;
  rank: number; // 1 = bio-first
  description: string;
  dosage: string;
  repeatAfterDays: number;
  phiDays: number; // pre-harvest interval
  costLevel: 'low' | 'medium' | 'high';
  tags: string[];
}

// ── Environment ──────────────────────────────────────────

export interface EnvironmentReading {
  timestamp: string;
  temperatureC: number;
  humidityPercent: number;
  row?: number;
}

// ── System ───────────────────────────────────────────────

export type DeviceStatus = 'online' | 'offline' | 'error';

export interface SystemStatus {
  deviceStatus: DeviceStatus;
  cameraConnected: boolean;
  gpsActive: boolean;
  modelLoaded: boolean;
  modelName: string;
  syncedAt: string;
  pendingAlerts: number;
}

// ── Dashboard summary ────────────────────────────────────

export interface DashboardStats {
  detectionsToday: number;
  detectionsDelta: number;
  avgConfidence: number;
  rowsScanned: number;
  totalRows: number;
  plantsTracked: number;
}
