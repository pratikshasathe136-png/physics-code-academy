# Render Deployment Setup Guide

## ✅ Step 1: GitHub Repository (COMPLETE)
Repository: https://github.com/pratikshasathe136-png/physics-code-academy

---

## 🚀 Step 2: Deploy to Render

### 2.1 Sign Up on Render
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your **GitHub account** (pratikshasathe136-png)
4. Authorize Render to access your repositories

### 2.2 Create PostgreSQL Database
1. In Render Dashboard, click **New +**
2. Select **PostgreSQL**
3. Name: `physics-db`
4. Region: **Oregon (US West)** or closest to India: **Singapore**
5. Plan: **Free**
6. Click **Create Database**
7. Wait for it to turn green (ready)
8. Copy the **Internal Database URL** (starts with `postgresql://...`)

### 2.3 Create Web Service
1. Click **New +** → **Web Service**
2. Connect your `physics-code-academy` GitHub repository
3. Configure:
   - **Name**: `physics-code-academy`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**
4. Click **Advanced** → **Add Environment Variables**:
   - Key: `DATABASE_URL` → Value: Paste the PostgreSQL URL from Step 2.2
   - Key: `NODE_ENV` → Value: `production`
   - Key: `ADMIN_USERNAME` → Value: `srujan sathe`
   - Key: `ADMIN_PASSWORD` → Value: `srujan@2004`
5. Click **Create Web Service**

### 2.4 Wait for Deployment
- Render will build and deploy (takes 2-5 minutes)
- Your URL will be: `https://physics-code-academy.onrender.com`

---

## 📱 The Website is Already Responsive!

Your website already works on:
- ✅ Mobile phones
- ✅ Tablets
- ✅ Laptops
- ✅ Desktop computers

The CSS includes:
- Mobile menu toggle
- Responsive grids
- Flexible typography
- Touch-friendly buttons

---

## 🔑 Admin Access
- URL: `https://physics-code-academy.onrender.com/admin.html`
- Username: `srujan sathe`
- Password: `srujan@2004`

---

## ⚠️ Important Notes

1. **Free tier sleeps after 15 min of inactivity** - first load may take 30-60 seconds
2. **Database persists permanently** on PostgreSQL free tier
3. To update your site later, just push new code to GitHub and Render will auto-deploy

---

## Need Help?

If anything fails:
1. Check Render **Logs** tab for errors
2. Verify `DATABASE_URL` is correctly pasted
3. Make sure GitHub repo is Public (it is!)
