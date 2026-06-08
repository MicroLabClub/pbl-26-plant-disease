# MicroLab deploy (frontend-only) — plant-disease-26

This deploys **only the frontend** to the shared MicroLab server, pointing it
at the already-running backend on `agricure.online`. Backend, MinIO and
Postgres are **not** deployed here — they live on the agricure.online VPS.

```
[browser]
  ├─ https://plant-disease-26.microlab.club/      → host nginx → 127.0.0.1:9005 → web container (SPA)
  └─ https://api.agricure.online/api/...          → existing backend (separate VPS)
```

The frontend bundle is built with `VITE_API_BASE_URL=https://api.agricure.online`,
so the browser calls the API directly (cross-origin).

## ⚠️ One-time backend change required: CORS

Because the SPA is served from `plant-disease-26.microlab.club` but calls
`api.agricure.online`, **every API call is cross-origin** and the browser will
block it until the backend allows the new origin.

On the **agricure.online** deployment, add the origin and redeploy the API:

```
CORS_ALLOWED_ORIGIN_1=https://plant-disease-26.microlab.club
```

The prod compose already wires `Cors__AllowedOrigins__1` from
`CORS_ALLOWED_ORIGIN_1` (see `ops/docker-compose.prod.yml` / `ops/README.md`).
Add it as a GitHub Actions repo variable/secret and re-run the backend deploy.
Until this is done, login and all data fetches will fail with CORS errors in
the console (the app falls back to nothing — `VITE_API_BASE_URL` is set, so the
mock data path is disabled).

## First deploy (on the server)

```bash
ssh plant-disease-26_admin@plant-disease-26.microlab.club
cd ~
git clone https://github.com/MicroLabClub/pbl-26-plant-disease.git
cd pbl-26-plant-disease
docker compose up -d --build
curl -s http://127.0.0.1:9005/        # local sanity check first
# then open https://plant-disease-26.microlab.club/
```

The root `docker-compose.yml` is already the frontend-only stack — no editing
needed, it binds `127.0.0.1:9005` and caps memory at 256m.

## Redeploy after a code change

```bash
cd ~/pbl-26-plant-disease
git pull
docker compose up -d --build
docker compose logs -f web
```

## Note: building on the shared box

`docker compose up --build` runs `npm ci && npm run build` on the server. The
host has 3.8 GB RAM shared with other teams; a Vite build can be memory-hungry.
If the build OOMs, the cleaner path is to build the image elsewhere (laptop/CI)
and push it to a registry, then `image:` it here instead of `build:`. Start
with on-server build; only switch if it fails.

## Fallback: build in CI, pull on the server (GitHub Actions)

If the on-box build OOMs, let GitHub's runners build the image and have the
server only pull + run it. This is wired up in
`.github/workflows/microlab-frontend.yml` + `ops/docker-compose.microlab.yml`.

Flow on every push to `main` (or manual **Run workflow**):

1. **build-and-push** — builds `./frontend` with
   `VITE_API_BASE_URL` baked in, pushes
   `ghcr.io/microlabclub/pbl-26-plant-disease-frontend:{latest,<sha>}` to GHCR.
2. **deploy** — SCPs `ops/docker-compose.microlab.yml` + a generated `.env`
   (just `IMAGE_FRONTEND=...:<sha>`) to `~/apps/plant-disease` on the server,
   SSHes in, `docker login ghcr.io`, `docker compose pull && up -d`.

This deploys into `~/apps/plant-disease`, separate from a manual
`~/pbl-26-plant-disease` clone. Both use the same container name and host port
`127.0.0.1:9005`, so **run only one path**. If you switch from the manual build
to CI, stop the manual stack first: `cd ~/pbl-26-plant-disease && docker compose down`.

### Secrets & variables to add (in the GitHub repo: Settings → Secrets and variables → Actions)

**Secrets** (encrypted):

| Name | Value | Notes |
|---|---|---|
| `SSH_HOST` | `194.180.191.175` (or `plant-disease-26.microlab.club`) | the deploy target |
| `SSH_USER` | `plant-disease-26_admin` | the server login user |
| `SSH_PASSWORD` | the SSH password for that user | **or** use `SSH_KEY` instead — see below |

**Variables** (plain, optional — sane defaults exist). If omitted entirely the
defaults below apply. `SSH_PORT` is also read from the Secrets tab if you put it
there:

| Name | Value | Default if unset |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.agricure.online` | `https://api.agricure.online` |
| `SSH_PORT` | `22` | `22` |

`GITHUB_TOKEN` is **automatic** — you do **not** add it. The workflow uses it to
push to GHCR and to `docker login` on the server (no Personal Access Token
needed). It needs no extra config because the workflow grants `packages: write`
(build job) and `packages: read` (deploy job).

### Key auth instead of a password (recommended)

If the server account uses key-only SSH:

1. Generate a key, add the **public** key to the server's `~/.ssh/authorized_keys`.
2. Add the **private** key as a secret `SSH_KEY`.
3. In `microlab-frontend.yml`, in both the scp and ssh steps, replace
   `password: ${{ secrets.SSH_PASSWORD }}` with `key: ${{ secrets.SSH_KEY }}`
   (commented-out lines are already there as a guide).

### GHCR package visibility

First run creates the package as **private**; the workflow's `docker login` with
`GITHUB_TOKEN` pulls it fine. If you'd rather pull with no auth, after the first
successful run go to the org's **Packages → pbl-26-plant-disease-frontend →
Package settings → Change visibility → Public**, then you can drop the
`docker login` line.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Welcome page on public URL | container down or wrong binding | `docker compose ps`; `curl -v http://127.0.0.1:9005/` |
| App loads but no data / login fails | backend CORS not updated | add `CORS_ALLOWED_ORIGIN_1` on agricure.online and redeploy API |
| 404 on deep-link refresh | (shouldn't happen) | frontend nginx already has SPA `try_files` fallback |
| Build killed / OOM | host memory during `npm run build` | use the CI fallback above (builds on GitHub runners) |
| CI deploy: `port is already allocated` | manual stack still running on 9005 | `cd ~/pbl-26-plant-disease && docker compose down` |
| CI deploy: `denied` / `unauthorized` pulling image | GHCR auth/visibility | check the `docker login` step, or make the package public |
| CI deploy: SSH `permission denied` | wrong `SSH_USER`/`SSH_PASSWORD`/`SSH_KEY` | verify the secrets; for key auth see above |
