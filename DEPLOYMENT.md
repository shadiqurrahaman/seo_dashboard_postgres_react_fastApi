# Deployment Guide — Growmos

Deploy the full stack for free using **Vercel** (frontend), **Render** (backend), and **Neon** (PostgreSQL).

Total time: ~30 minutes. No credit card required for any service.

---

## Step 1 — Push to GitHub

From the project root (`seo_dashboard/`):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Create a new repo at https://github.com/new (do NOT add README/license/.gitignore — we already have them), then:

```bash
git remote add origin https://github.com/<your-username>/growmos.git
git push -u origin main
```

---

## Step 2 — PostgreSQL on Neon

1. Sign up at https://neon.tech (use your GitHub account)
2. Create a new project, name it `growmos`
3. From the dashboard, copy the **connection string** — it looks like:
   ```
   postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/neondb
   ```
4. **Important**: change the scheme to async — replace `postgresql://` with `postgresql+asyncpg://`
5. Save this string — you will paste it into Render in Step 3

---

## Step 3 — Backend on Render

1. Sign up at https://render.com (use your GitHub account)
2. Click **New +** → **Blueprint**
3. Connect your `growmos` GitHub repo
4. Render will auto-detect `render.yaml` and create the backend service
5. Fill in the secret env vars when prompted:
   - `DATABASE_URL` → paste your Neon connection string (with `+asyncpg`)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` → from Step 5 (leave blank for now)
   - `GOOGLE_REDIRECT_URI` → leave blank for now
   - `GOOGLE_BQ_REDIRECT_URI` → leave blank for now
   - `FRONTEND_URL` → leave blank for now
6. Click **Apply** — Render will build and deploy. Wait ~5 minutes.
7. Once deployed, copy the backend URL — it looks like `https://growmos-backend.onrender.com`

### Get the deploy hook for auto-deploys
- In Render, go to your service → **Settings** → **Deploy Hook**
- Copy the URL
- In GitHub, go to your repo → **Settings** → **Secrets and variables** → **Actions**
- Add a new secret named `RENDER_DEPLOY_HOOK` and paste the URL

---

## Step 4 — Frontend on Vercel

1. Sign up at https://vercel.com (use your GitHub account)
2. Click **Add New** → **Project**
3. Import your `growmos` GitHub repo
4. **Important — Root Directory**: click **Edit** and set it to `frontend`
5. Framework: Vite (auto-detected)
6. Add environment variables:
   - `VITE_API_URL` = `https://growmos-backend.onrender.com` (from Step 3)
   - `VITE_GOOGLE_CLIENT_ID` = (from Step 5)
7. Click **Deploy**. Wait ~2 minutes.
8. Copy your Vercel URL — it looks like `https://growmos.vercel.app`

### Add the GitHub Actions secrets
- Repo → **Settings** → **Secrets and variables** → **Actions**
- Add: `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` (same values as above)

---

## Step 5 — Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project (e.g. `growmos-prod`)
3. **APIs & Services** → **OAuth consent screen** → External → fill in app name, your email
4. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID** → Web application
5. Add Authorized redirect URIs:
   ```
   https://growmos-backend.onrender.com/auth/google/callback
   https://growmos-backend.onrender.com/datasources/bigquery/callback
   ```
6. Copy the **Client ID** and **Client Secret**
7. Go back to Render → your backend → **Environment** and update:
   - `GOOGLE_CLIENT_ID` = your client ID
   - `GOOGLE_CLIENT_SECRET` = your client secret
   - `GOOGLE_REDIRECT_URI` = `https://growmos-backend.onrender.com/auth/google/callback`
   - `GOOGLE_BQ_REDIRECT_URI` = `https://growmos-backend.onrender.com/datasources/bigquery/callback`
   - `FRONTEND_URL` = `https://growmos.vercel.app`
8. Click **Save Changes** — Render will redeploy
9. Also update Vercel env: `VITE_GOOGLE_CLIENT_ID` = your client ID, then redeploy

### Enable BigQuery API (optional)
If you want BigQuery as a data source, go to **APIs & Services** → **Library** → search "BigQuery API" → Enable.

---

## Step 6 — Verify CI/CD

Push any change to your `main` branch:

```bash
echo "" >> README.md
git add . && git commit -m "Test CI/CD" && git push
```

You should see:
1. GitHub Actions running tests (Actions tab)
2. Vercel auto-deploying the frontend
3. Render auto-deploying the backend

---

## Free tier limits to know

| Service | Limit | Behavior |
|---|---|---|
| **Vercel** | 100 GB bandwidth/month | Frontend is always-on |
| **Render Free** | 750 hrs/month | Backend sleeps after 15 min idle, cold start ~30s |
| **Neon Free** | 0.5 GB storage | DB suspends after 5 min idle, cold start ~1s |
| **GitHub Actions** | 2000 min/month (private repos) | Free for public repos |

### Avoiding Render cold starts (free workarounds)
- Use a free uptime monitor like https://cron-job.org to ping `/health` every 10 minutes
- Or upgrade to Render Starter ($7/month) for always-on

---

## Common issues

**"500 Internal Server Error on first request"**
Render free tier sleeps — first request after idle takes ~30s. Subsequent requests are fast.

**"CORS error from frontend"**
Make sure `FRONTEND_URL` env var on Render exactly matches your Vercel URL (no trailing slash).

**"Database connection error"**
Make sure the connection string uses `postgresql+asyncpg://` not `postgresql://`.

**"Google OAuth redirect_uri_mismatch"**
The redirect URI in Google Cloud Console must EXACTLY match `GOOGLE_REDIRECT_URI` (including https and no trailing slash).

---

## What's next

- Add a custom domain (Vercel: free SSL, Render: free SSL on `.onrender.com`)
- Set up Sentry for error monitoring (free tier: 5k events/month)
- Add automated DB backups via Neon's point-in-time recovery (free for 7 days)
