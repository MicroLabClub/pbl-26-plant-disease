# AgriCure Dashboard

Intelligent Crop Disease Detection & Agricultural Advisory — Web Dashboard

Built with **React 18 + TypeScript + Vite**. Organic Biophilic design system, fully
responsive (desktop sidebar / mobile bottom navigation).

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and point it at your backend
cp .env.example .env

# 3. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

There is no mock-data mode — the app talks to the real AgriCure backend (see
`../backend`) for everything, including authentication.

---

## Project structure

```
src/
├── components/
│   ├── auth/            # ProtectedRoute / AdminRoute guards
│   ├── camera/           # CameraPanel — live stream, GPS, model output
│   ├── detection/        # DetectionList, passport timeline, lightbox
│   ├── treatment/         # TreatmentPanel — recommended treatments
│   ├── layout/            # Sidebar (desktop) + bottom tab bar (mobile)
│   └── shared/            # Card, Chip, AlertStrip, custom Select, Skeleton
├── context/
│   └── AuthContext.tsx    # Auth state, token refresh, roles (admin / agriculture)
├── hooks/
│   └── useApi.ts          # Polling hooks for every data domain
├── i18n/
│   ├── index.ts           # i18next setup (English only)
│   └── locales/en.json
├── pages/
│   ├── Landing.tsx         # Public landing / home dashboard
│   ├── Login.tsx
│   ├── LiveCamera.tsx
│   ├── Plants.tsx
│   ├── PlantPassport.tsx
│   ├── Treatments.tsx
│   ├── TreatmentHistory.tsx
│   ├── AdminUsers.tsx      # admin-only
│   └── AdminApiKeys.tsx    # admin-only
├── services/
│   ├── api.ts              # API client + endpoint definitions
│   └── auth.ts             # Login/register/refresh/logout calls
├── styles/
│   └── globals.css         # Design tokens (CSS custom properties)
└── types/
    └── index.ts            # All TypeScript types for domain entities
```

---

## Routing & access control

| Path | Page | Access |
|------|------|--------|
| `/welcome` | Landing page | Public |
| `/login` | Login / register | Public |
| `/` | Home dashboard | Authenticated |
| `/camera` | Live camera | Authenticated |
| `/plants` | Plant list | Authenticated |
| `/passport` | Plant passport (history for one plant) | Authenticated |
| `/treatments` | Treatment recommendations | Authenticated |
| `/history` | Applied-treatment history | Authenticated |
| `/admin/users` | User management | Admin only |
| `/admin/api-keys` | API key management | Admin only |

`ProtectedRoute` redirects unauthenticated users to `/login`. `AdminRoute` further
restricts the `/admin/*` pages to users whose JWT carries the `admin` role.

---

## Connecting to the backend

### 1. Set the backend URL

```env
# .env
VITE_API_BASE_URL=http://localhost:8080
```

If the frontend and backend are served from the same origin, this can be left
empty and requests will be relative.

### 2. Authentication

The app authenticates against the AgriCure API via JWT access/refresh tokens:

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/login` |
| POST | `/api/auth/register` |
| POST | `/api/auth/refresh` |
| POST | `/api/auth/logout` |

Tokens are stored in `localStorage` (`agricure_access_token` /
`agricure_refresh_token`) via `tokenStore` in `src/services/api.ts`. The access
token is attached as a `Bearer` header on every request, and is silently
refreshed via the refresh token when expired.

### 3. API endpoints used by the dashboard

| Method | Endpoint | Used by |
|--------|----------|---------|
| GET | `/api/system/status` | Home dashboard |
| GET | `/api/dashboard/stats` | Home dashboard |
| GET | `/api/camera/frame` | Live camera |
| GET | `/api/camera/token` | Live camera (stream auth) |
| GET | `/api/camera/stream?token=...` | Live camera (MJPEG/video stream) |
| GET | `/api/stand/position` | Live camera |
| GET | `/api/detections?limit=N` | Home dashboard, Plants |
| GET / POST / PUT / DELETE | `/api/detections[/:id]` | Detection management |
| GET | `/api/plants` | Plants page |
| GET | `/api/passports/:plantId` | Plant passport |
| GET | `/api/treatments?diseaseClass=X` | Treatments page |
| GET / POST | `/api/treatments/applied` | Treatment history |
| GET / POST | `/api/admin/users` | Admin → Users |
| PUT | `/api/admin/users/:id/agriculture` | Admin → Users |
| GET / POST / DELETE | `/api/admin/api-keys[/:id]` | Admin → API keys |

All request/response types are defined in `src/types/index.ts`.

### 4. Polling intervals

Adjust polling frequency per data domain in `src/hooks/useApi.ts`.

### 5. CORS

If the backend runs on a different origin in development, either enable CORS on
the backend or add a Vite dev proxy for `/api` in `vite.config.ts`.

---

## Responsive layout

- **Desktop (>900px):** fixed sidebar on the left with grouped navigation.
- **Mobile/tablet (≤900px):** sidebar is hidden; an Instagram-style bottom tab
  bar (Home, Live camera, Plants, Recommendations, More) is shown instead. The
  "More" tab opens a sheet with Plant passport, Treatment history, admin links
  (if applicable) and Sign out.

---

## Build for production

```bash
npm run build
# Output: dist/
```

Deploy the `dist/` folder to any static host, or serve it from the .NET backend.

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| i18n | i18next / react-i18next (English) |
| PDF export | @react-pdf/renderer |
| Styling | CSS Modules + CSS custom properties |
| Date | date-fns |

---

## Team

Mihaela Untu · Ciprian Moisenco · Maria-Elena Botnari · Andrei Ceaetchii · Loredana Costin
Technical University of Moldova — FAF-232
