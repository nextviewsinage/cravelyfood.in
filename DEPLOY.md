# 🚀 Live Deployment Guide

## Backend → Railway (Free)

1. railway.app pe account banao
2. "New Project" → "Deploy from GitHub repo" → apna repo select karo
3. Root directory: `mysite`
4. Environment Variables set karo:

```
SECRET_KEY=koi-bhi-random-64-char-string
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app
DATABASE_URL=  (Railway automatically set karta hai PostgreSQL ke saath)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

5. Railway automatically `Procfile` detect karega aur deploy karega
6. Deploy hone ke baad run karo:
   - Settings → Deploy → "Run Command" mein: `python manage.py migrate`

---

## Frontend → Vercel (Free)

1. vercel.com pe account banao
2. "New Project" → GitHub repo → Root Directory: `food-frontend`
3. Environment Variable add karo:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```
4. Deploy karo — Vercel automatically `npm run build` chalata hai

---

## Local mein test karna

**Backend:**
```bash
cd mysite
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd food-frontend
npm install
npm start
```
