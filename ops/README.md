# ops/

Production deployment artifacts. Local development still uses
`backend/docker-compose.yml` + `backend/docker-compose.override.yml` —
nothing here is meant to be run on a developer machine.

## What's in here

| File | Purpose |
|---|---|
| `docker-compose.prod.yml` | Compose file shipped to the VPS by CI. Pulls images from GHCR (no `build:`), wires `postgres` + `api` + `frontend`. API and frontend bind to **loopback only** — host nginx is the public entry point. |

The companion workflow is `.github/workflows/build-and-deploy.yml`.

## Topology

```
   https://agricure.online      ┐
   https://api.agricure.online  │ ──▶  host nginx (:80, :443) ──▶  127.0.0.1:8082 (frontend)
                                ┘                                  127.0.0.1:8090 (api → :8080 in container)
```

Nginx runs **on the VPS host** (you manage it). The compose stack only
binds container ports to `127.0.0.1` so they're not exposed to the
public internet — nginx is the only thing that talks to them.

## Deploy flow

`push` to `develop` →

1. `build-and-push` job builds and publishes two images to GHCR:
   - `ghcr.io/<owner>/agricure-api:latest` (and `:<sha>`)
   - `ghcr.io/<owner>/agricure-frontend:latest` (and `:<sha>`) — frontend image bakes in `VITE_API_BASE_URL` at build time.
2. `deploy` job assembles `.deploy/.env` from repo secrets, copies it together with `docker-compose.prod.yml` to `~/apps/agricure` on the VPS via SCP, then SSHes in to run `docker compose pull && down && up -d`.

## Pre-flight (one-time setup)

### 1. DNS

At your registrar, add two A records pointing at the VPS IP:

```
agricure.online        A    <VPS_IP>
api.agricure.online    A    <VPS_IP>
```

### 2. Host nginx + TLS

Install nginx and certbot on the VPS, then drop the snippet below at
`/etc/nginx/sites-available/agricure` and symlink it into `sites-enabled`.

```nginx
# /etc/nginx/sites-available/agricure
# After saving, run: sudo certbot --nginx -d agricure.online -d api.agricure.online
# Certbot will inject the listen 443 / ssl_certificate lines automatically.

server {
    listen 80;
    listen [::]:80;
    server_name agricure.online;

    location / {
        proxy_pass         http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name api.agricure.online;

    # Increase if your image-detection upload payloads are large.
    client_max_body_size 25m;

    location / {
        proxy_pass         http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Pass through SSE / long-poll without buffering.
        proxy_read_timeout 300s;
        proxy_buffering    off;
    }
}
```

Enable + obtain certs:

```bash
sudo ln -s /etc/nginx/sites-available/agricure /etc/nginx/sites-enabled/agricure
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d agricure.online -d api.agricure.online
```

Certbot's package installs a renewal timer automatically; verify with
`systemctl list-timers | grep certbot`.

### 3. VPS firewall

Open `80` and `443` for inbound; the API/frontend host ports
(`8082`, `8090`) stay closed because they're already bound to
`127.0.0.1` only.

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 4. Docker on the VPS

The SSH user must be in the `docker` group (`sudo usermod -aG docker $USER`, re-login). Verify with `docker compose version`.

## Required GitHub configuration

### Secrets — Settings → Secrets and variables → Actions → Secrets

| Secret | Used for | Example |
|---|---|---|
| `SSH_HOST` | VPS IP / hostname | `144.91.110.197` |
| `SSH_USER` | VPS SSH user | `root` |
| `SSH_PASSWORD` | VPS SSH password | — |
| `POSTGRES_DB` | Database name | `agricure` |
| `POSTGRES_USER` | Database user | `agricure` |
| `POSTGRES_PASSWORD` | Database password | strong random |
| `JWT_ISSUER` | Maps to `Jwt__Issuer` | `agricure-api` |
| `JWT_AUDIENCE` | Maps to `Jwt__Audience` | `agricure-dashboard` |
| `JWT_SIGNING_KEY` | Maps to `Jwt__SigningKey`; ≥32 chars (validated at startup) | `openssl rand -base64 48` |
| `ADMIN_EMAIL` | Optional initial admin seed | `admin@agricure.online` |
| `ADMIN_PASSWORD` | Optional initial admin seed | strong random |
| `CORS_ALLOWED_ORIGIN_0` | Production frontend origin (no trailing slash) | `https://agricure.online` |

### Variables — Settings → Secrets and variables → Actions → Variables

| Variable | Value | Default |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.agricure.online` | — (required) |
| `API_HOST_PORT` | Loopback port the API binds to | `8090` |
| `FRONTEND_HOST_PORT` | Loopback port nginx-in-frontend-container binds to | `8082` |

If you change `API_HOST_PORT` or `FRONTEND_HOST_PORT`, also update the
`proxy_pass` lines in your nginx config.

## Smoke test after first deploy

```bash
ssh "$SSH_USER@$SSH_HOST" "cd ~/apps/agricure && docker compose ps"
# postgres, api, frontend should all be Up.

# Containers are loopback-only — verify from the VPS shell:
ssh "$SSH_USER@$SSH_HOST" "curl -s http://127.0.0.1:8090/health/ready"
ssh "$SSH_USER@$SSH_HOST" "curl -sI http://127.0.0.1:8082/"

# Then publicly, through nginx + TLS:
curl https://api.agricure.online/health/ready    # → "Healthy"
curl -I https://agricure.online/                 # → 200
```

Then open `https://agricure.online` in a browser and exercise the login
flow. If you see CORS errors in the console, `CORS_ALLOWED_ORIGIN_0`
doesn't match the browser's `Origin` header — fix the secret and re-run
the workflow.
