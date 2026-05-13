# خطة تشغيل Cinemora — كاملة

## 1. Vercel Dashboard — Environment Variables

**Project Settings → Environment Variables → Add:**

| Variable | Value |
|----------|-------|
| `VITE_ENGINE_URL` | `http://51.254.207.214:5555` |
| `VITE_TMDB_API_KEY` | `YOUR_TMDB_API_KEY` |

---

## 2. VPS — SSH & تحديث الكود

### أ. حل مشكلة SSH
```bash
# من OVH/Soyoustart Console:
systemctl status sshd
ufw status
iptables -L -n
# لو مقفول، افتح port 22:
ufw allow 22
```

### ب. تحديث ملفات VPS
```bash
# بعد دخول SSH:
cd /path/to/cinemora-engine
# اسحب أحدث كود من GitHub أو انسخ الملفات الجديدة:
# vps-engine/src/routes/auth.js
# vps-engine/src/index.js

# أو استخدم git pull لو الريبو موجود
```

### ج. إعداد .env على VPS
```env
PORT=5555
NODE_ENV=production
DATABASE_URL=postgresql://cinemora:YOUR_DB_PASSWORD@localhost:5433/cinemora
REDIS_URL=redis://localhost:6379
JWT_SECRET=YOUR_JWT_SECRET
ADMIN_EMAIL=YOUR_ADMIN_EMAIL
ADMIN_KEY=YOUR_ADMIN_KEY
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET=YOUR_DISCORD_CLIENT_SECRET
FRONTEND_URL=https://cinemora-theta.vercel.app
TMDB_API_KEY=YOUR_TMDB_API_KEY
```

### د. إعادة تشغيل VPS
```bash
# لو Docker:
docker-compose down && docker-compose up -d

# لو systemd:
systemctl restart cinemora

# أو nodemon/Pm2:
pm2 restart all
```

---

## 3. Google Cloud Console

**OAuth 2.0 Client ID → Authorized Redirect URIs:**
```
https://cinemora-theta.vercel.app/auth/callback/google
```
**لما يجي الدومين، ضيف جنبها:**
```
https://cinemora.com/auth/callback/google
```

---

## 4. Discord Developer Portal

**OAuth2 → Redirects:**
```
https://cinemora-theta.vercel.app/auth/callback/discord
```

---

## 5. بعد ما يجي الدومين

| الخطوة | من | إلى |
|--------|----|-----|
| Vercel env | `VITE_ENGINE_URL=http://51.254.207.214:5555` | `VITE_ENGINE_URL=https://api.cinemora.com` |
| VPS env | `FRONTEND_URL=https://cinemora-theta.vercel.app` | `FRONTEND_URL=https://cinemora.com` |
| VPS nginx | إعداد reverse proxy لـ `api.cinemora.com` + SSL |
| Google Cloud | ضيف `https://cinemora.com/auth/callback/google` |
| Discord | ضيف `https://cinemora.com/auth/callback/discord` |

تعديل env vars فقط — **لا تغيير في الكود**.
