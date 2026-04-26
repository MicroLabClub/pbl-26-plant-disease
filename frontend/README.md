# AgriCure Dashboard

Intelligent Crop Disease Detection & Agricultural Advisory — Web Dashboard

Built with **React 18 + TypeScript + Vite**. Organic Biophilic design system.  
Ready to connect to your ZED 2 + Jetson Nano backend via REST API.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Start dev server (uses mock data by default)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project structure

```
src/
├── components/
│   ├── camera/         # CameraPanel — live feed, GPS, model output
│   ├── detection/      # DetectionList, PassportTimeline
│   ├── treatment/      # TreatmentPanel
│   ├── layout/         # Sidebar navigation
│   └── shared/         # Card, Chip, StatCard, AlertStrip, Skeleton
├── hooks/
│   └── useApi.ts       # Polling hooks for every data domain
├── pages/
│   └── Dashboard.tsx   # Main dashboard page
├── services/
│   └── api.ts          # API layer + mock data
├── styles/
│   └── globals.css     # Design tokens (CSS variables)
└── types/
    └── index.ts        # All TypeScript types for domain entities
```

---

## Connecting real APIs

### 1. Set your backend URL

```env
# .env
VITE_API_BASE_URL=http://192.168.1.50:8080   # your Jetson or backend IP
```

When `VITE_API_BASE_URL` is set, the app switches from mock data to real API calls automatically.

### 2. Expected API endpoints

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/system/status` | `SystemStatus` |
| GET | `/api/dashboard/stats` | `DashboardStats` |
| GET | `/api/camera/frame` | `CameraFrame` |
| GET | `/api/stand/position` | `StandPosition` |
| GET | `/api/detections?limit=N` | `Detection[]` |
| GET | `/api/detections/:id` | `Detection` |
| GET | `/api/passports/:plantId` | `PlantPassport` |
| GET | `/api/treatments?diseaseClass=X` | `Treatment[]` |
| GET | `/api/environment/latest` | `EnvironmentReading` |

All types are defined in `src/types/index.ts`.

### 3. Live camera stream

To show the actual ZED 2 feed, replace the placeholder `<div className={styles.camFoliage} />` in `src/components/camera/CameraPanel.tsx` with:

```tsx
// MJPEG stream (simplest — works with most Jetson HTTP servers)
<img
  src={`${import.meta.env.VITE_API_BASE_URL}/api/camera/stream`}
  className={styles.camStream}
  alt="Live camera feed"
/>

// Or WebRTC / HLS for lower latency — see commented WebSocket code in api.ts
```

### 4. Polling intervals

Adjust polling frequency in `src/hooks/useApi.ts`:

```ts
export const useCameraFrame = () =>
  usePolling<CameraFrame>(api.getCameraFrame, 1_000); // 1s

export const useDetections = (limit = 20) =>
  usePolling<Detection[]>(() => api.getDetections(limit), 5_000); // 5s
```

### 5. CORS

If your backend is on a different origin, add CORS headers on the server side.  
Or use the Vite dev proxy (uncomment in `vite.config.ts`):

```ts
proxy: {
  '/api': {
    target: 'http://192.168.1.50:8080',
    changeOrigin: true,
  },
},
```

---

## Build for production

```bash
npm run build
# Output: dist/
```

Deploy the `dist/` folder to any static host, or serve from your .NET backend.

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans (headings + body) |
| Styling | CSS Modules + CSS custom properties |
| Date | date-fns |

---

## Team

Mihaela Untu · Ciprian Moisenco · Maria-Elena Botnari · Andrei Ceaetchii · Loredana Costin  
Technical University of Moldova — FAF-232
