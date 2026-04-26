# Deploy to Render (Permanent Public Website)

## What We Changed
Your code now supports **both SQLite (local)** and **PostgreSQL (production)** automatically:
- If `DATABASE_URL` is set → uses PostgreSQL (Render)
- If `DATABASE_URL` is not set → uses SQLite (your computer)

---

## Step 1: Install Git for Windows

1. Download from: https://git-scm.com/download/win
2. Run the installer (accept all defaults)
3. Restart your terminal / VS Code

Verify installation:
```bash
git --version
```

---

## Step 2: Create a GitHub Account & Repository

1. Go to https://github.com and sign up (free)
2. Click **New Repository**
3. Name it: `physics-code-web`
4. Make it **Public**
5. Do NOT initialize with README (we already have files)
6. Click **Create repository**
7. Copy the two lines under **"…or push an existing repository from the command line"**

They will look like:
```bash
git remote add origin https://github.com/YOUR_USERNAME/physics-code-web.git
git branch -M main
```

---

## Step 3: Initialize Git & Push Code

Open terminal in VS Code and run:

```bash
cd "c:\Users\Acer\Desktop\physics code web"
git init
git add .
git commit -m "Initial commit - ready for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/physics-code-web.git
git branch -M main
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 4: Sign Up for Render

1. Go to https://render.com
2. Sign up with your **GitHub account**
3. Authorize Render to access your repositories

---

## Step 5: Create PostgreSQL Database on Render

1. In Render dashboard, click **New +**
2. Select **PostgreSQL**
3. Name it: `physics-db`
4. Region: Choose closest to your users (e.g., Oregon/US West)
5. Plan: **Free**
6. Click **Create Database**
7. Wait for it to provision (status turns green)
8. Copy the **Internal Database URL** (starts with `postgresql://...`)

---

## Step 6: Create Web Service on Render

1. Click **New +** → **Web Service**
2. Connect your `physics-code-web` GitHub repository
3. Configure:
   - **Name**: `physics-code-web`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**
4. Click **Advanced** → **Add Environment Variable**:
   - Key: `DATABASE_URL`
   - Value: Paste the Internal Database URL from Step 5
   - Add another:
   - Key: `NODE_ENV`
   - Value: `production`
5. Click **Create Web Service**

---

## Step 7: Wait & Test

- Render will build and deploy your site (takes 2-5 minutes)
- You will get a URL like: `https://physics-code-web.onrender.com`
- Open it in your browser!

**Note:** Free tier spins down after 15 minutes of inactivity. The first request after inactivity may take 30-60 seconds to wake up.

---

## Admin Access

Your admin credentials are still:
- Username: `srujan sathe`
- Password: `srujan@2004`

Access the admin panel at: `https://physics-code-web.onrender.com/admin.html`

---

## Need Help?

If anything fails:
1. Check Render **Logs** tab for errors
2. Make sure `DATABASE_URL` is correctly pasted
3. Ensure your GitHub repo is Public

