# MILP Platform Release Checklist

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] All required environment variables are set in Vercel
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_APP_URL` matches deployment domain
- [ ] No placeholder values remain
- [ ] No secrets in git repository

### 2. Database
- [ ] Production database provisioned (Supabase/Neon)
- [ ] Connection string in `DATABASE_URL`
- [ ] Run `npx prisma migrate deploy` successfully
- [ ] Backup policy configured
- [ ] Rollback script tested

### 3. Authentication (Clerk)
- [ ] Production app created in Clerk
- [ ] Live keys: `pk_live_*` and `sk_live_*`
- [ ] RBAC roles configured
- [ ] Protected routes validated
- [ ] Session settings reviewed

### 4. Rate Limiting (Upstash)
- [ ] Redis instance provisioned
- [ ] REST URL and token configured
- [ ] Distributed safety verified

### 5. Monitoring (Sentry)
- [ ] Project created in Sentry
- [ ] DSN configured
- [ ] Alert rules set up
- [ ] Error tracking verified

---

## Deployment Steps

```bash
# 1. Ensure local tests pass
npm run lint
npm run build

# 2. Deploy to Vercel
vercel --prod

# 3. Run migrations (if needed)
npx prisma migrate deploy

# 4. Verify deployment
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/readiness
curl https://your-app.vercel.app/api/config/validate
```

---

## Post-Deployment Verification

### API Endpoints
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] `/api/readiness` returns `{"status":"ready"}`
- [ ] `/api/config/validate` returns `{"production_ready":true}`

### Authentication Flow
- [ ] User can register
- [ ] User can login
- [ ] User can logout
- [ ] Protected routes redirect unauthenticated users

### Core Features
- [ ] Dashboard loads
- [ ] Claims module works
- [ ] ROI calculator works
- [ ] Reports generate
- [ ] Settings save correctly

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Redeploy previous version in Vercel dashboard
#    or run: vercel rollback

# 2. If database migration issue, run rollback:
psql $DATABASE_URL -f prisma/migrations/20250408000000_initial/rollback.sql

# 3. Re-run migrations for previous version:
npx prisma migrate deploy
```

---

## Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Clerk Support**: https://clerk.com/support
- **Sentry Support**: https://sentry.io/support

---

## Smoke Test Commands

```bash
DOMAIN="https://your-app.vercel.app"

# Health checks
curl -s $DOMAIN/api/health | jq .
curl -s $DOMAIN/api/readiness | jq .
curl -s $DOMAIN/api/config/validate | jq .

# API endpoints (require auth)
curl -s $DOMAIN/api/v1/claims | jq .
curl -s $DOMAIN/api/v1/dashboard | jq .
```
