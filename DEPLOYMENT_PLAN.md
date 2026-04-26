# Deployment Plan: Launch Website Publicly

## Current Stack
- **Backend:** Node.js + Express
- **Database:** SQLite (file-based)
- **Frontend:** Static HTML/CSS/JS

## Challenge
SQLite is a file-based database. Most free serverless hosts (Vercel, Netlify) do NOT support persistent file storage, meaning your database would reset on every deploy.

## Option 1: Instant Public Access (Temporary) — ngrok
**Best for:** Quick demos, testing, sharing with friends
- Exposes your local server (`localhost:3000`) to a public URL
- No code changes required
- URL changes every time you restart ngrok (unless you pay)
- Your computer must stay on

## Option 2: Permanent Deployment — Render + PostgreSQL
**Best for:** Production, permanent public URL
- **Render** offers free Node.js hosting + free PostgreSQL database
- Requires migrating from SQLite to PostgreSQL
- Gives you a permanent `your-app.onrender.com` URL
- Free tier spins down after inactivity (slow first load)

## Option 3: Permanent Deployment — Railway
**Best for:** Keeping SQLite, minimal code changes
- **Railway** supports persistent disk volumes
- Can keep your existing SQLite database
- Free tier available with usage limits

---

## Recommended Plan (Option 2: Render + PostgreSQL)

### Step 1: Install Prerequisites
- Install Git for Windows
- Install GitHub CLI (optional) or use GitHub web interface

### Step 2: Update Database Layer
- Install `pg` (PostgreSQL driver for Node.js)
- Update `db.js` to use PostgreSQL instead of SQLite
- Update `server.js` to handle PostgreSQL connection string from environment variables

### Step 3: Prepare for Deployment
- Add `.gitignore` file (exclude `node_modules/`, `database.sqlite`)
- Ensure `package.json` has correct `start` script (already done)
- Add `engines` field to `package.json` to specify Node.js version

### Step 4: Create GitHub Repository
- Initialize git repo
- Push code to GitHub

### Step 5: Deploy to Render
- Sign up at render.com (free, can use GitHub account)
- Create a new **Web Service** connected to your GitHub repo
- Create a free **PostgreSQL** database on Render
- Copy the database connection string into environment variables
- Deploy!

### Result
- Public URL: `https://physics-code-web.onrender.com`
- Admin panel accessible at `/admin.html`
- Database persists permanently

---

## Alternative Quick Plan (Option 1: ngrok)

### Step 1: Download ngrok
- Get ngrok from https://ngrok.com/download
- Sign up for free authtoken

### Step 2: Run ngrok
```bash
ngrok http 3000
```

### Result
- Instant public URL like `https://abc123.ngrok.io`
- No code changes needed

