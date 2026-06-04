# Hostel Fee Manager - Deployment Guide

Complete setup for auto-deploy with GitHub → Render (backend) + Vercel (frontend).

---

## Step 1: Create GitHub Repository

### 1.1 Create repo on GitHub.com
1. Go to https://github.com/new
2. Repository name: `hostel-fee-manager`
3. Description: "Hostel Fee Management and Student Tracking System"
4. Public or Private (your choice)
5. Skip "Initialize with README" (we already have one)
6. Click **Create repository**

### 1.2 Push code to GitHub
In PowerShell, from the project root:

```powershell
cd c:\Users\user\.gemini\antigravity\scratch\hostel-fee-manager

# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: hostel fee manager project"

# Add remote (replace YOUR_USERNAME and hostel-fee-manager)
git remote add origin https://github.com/YOUR_USERNAME/hostel-fee-manager.git

# Push to main branch
git branch -M main
git push -u origin main
```

**Note:** You will need a GitHub Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Select: `repo` scope
4. Copy the token
5. When Git prompts for password, paste the token

---

## Step 2: Deploy Backend on Render

### 2.1 Create Render account
1. Go to https://render.com
2. Sign up with GitHub (recommended)
3. Authorize Render to access your GitHub account

### 2.2 Create Web Service for backend
1. Click **New +** → **Web Service**
2. Click **Connect a repository**
3. Search for `hostel-fee-manager` and select it
4. Click **Connect**

### 2.3 Configure the service
Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `hostel-fee-manager-backend` |
| **Environment** | `Node` |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start` |
| **Root Directory** | (leave blank) |

### 2.4 Add environment variables
Click **Environment** tab, then **Add Environment Variable**:

```
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/hostel-fee-manager?retryWrites=true&w=majority
JWT_SECRET=your_super_strong_jwt_secret_key_change_this_to_something_long_and_random
AADHAAR_ENCRYPTION_KEY=your_secure_32_character_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=https://your-frontend-vercel-url.vercel.app
NODE_ENV=production
```

**MongoDB Atlas Setup (first time only):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / login
3. Create a **Cluster**
4. Click **Connect**
5. Allow access from everywhere (0.0.0.0/0)
6. Choose **Drivers** → Node.js
7. Copy the connection string → use as `MONGO_URI`
8. Replace `<password>` in the URI with your actual password

### 2.5 Deploy
1. Click **Create Web Service**
2. Wait for build (3-5 minutes)
3. Once live, copy the URL (e.g., `https://hostel-fee-manager-backend.onrender.com`)
4. **Save this URL — you need it for Vercel**

### 2.6 Enable auto-deploy
- Go to your Render service
- **Settings** → **Auto-Deploy**
- Set to "Yes" for main branch

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize and continue

### 3.2 Import project
1. Click **Add New** → **Project**
2. Click **Import Git Repository**
3. Search for `hostel-fee-manager` and select it
4. Click **Import**

### 3.3 Configure the project
Fill in these fields:

| Field | Value |
|-------|-------|
| **Project Name** | `hostel-fee-manager-frontend` |
| **Framework Preset** | `Vite` |
| **Root Directory** | `./frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.4 Add environment variable
Under **Environment Variables**, add:

```
VITE_API_BASE_URL=https://hostel-fee-manager-backend.onrender.com
# or VITE_API_URL=https://hostel-fee-manager-backend.onrender.com
```

(Replace with your actual Render backend URL from Step 2.5)

### 3.5 Deploy
1. Click **Deploy**
2. Wait for build (2-3 minutes)
3. Once live, you'll get a URL like `https://hostel-fee-manager-frontend.vercel.app`

### 3.6 Update backend CORS
1. Go back to Render service
2. **Environment** → Edit `FRONTEND_URL`
3. Change to: `https://your-frontend-vercel-url.vercel.app`
4. **Deploy** → restart the service

---

## Step 4: Test the deployment

### 4.1 Test live site
1. Open https://your-frontend-vercel-app.vercel.app
2. Try login with: `admin@hostel.com` / `adminpassword`
3. Try student registration

### 4.2 Check logs
**Backend logs (Render):**
- Go to your Render service
- Click **Logs** tab
- Check for errors

**Frontend logs (Vercel):**
- Go to your Vercel project
- Click **Deployments**
- Click latest → **Logs**

---

## Step 5: Automatic deployment setup

### 5.1 Render auto-deploy (already done)
- Every push to main → backend redeploys

### 5.2 Vercel auto-deploy (already done)
- Every push to main → frontend redeploys

### 5.3 Test auto-deploy
1. Make a small code change locally
2. Commit: `git commit -am "Test auto-deploy"`
3. Push: `git push origin main`
4. Watch Render/Vercel redeploy in real-time

---

## Quick Reference: Making Changes

### Workflow
```powershell
# 1. Make code changes locally
# 2. Test locally (optional)
# 3. Commit changes
git commit -am "Describe your change"

# 4. Push to GitHub
git push origin main

# 5. Render + Vercel auto-redeploy
# Check status at:
# - https://dashboard.render.com (backend)
# - https://vercel.com/dashboard (frontend)
```

---

## Troubleshooting

### Backend won't build
- Check Build Command: `cd backend && npm install`
- Check if `backend/package.json` exists
- Check Render **Logs** for errors

### Frontend won't build
- Check Root Directory: `./frontend`
- Check if `frontend/package.json` exists
- Check Vercel **Logs** for errors

### API calls fail after deployment
- Check `FRONTEND_URL` in Render matches frontend URL
- Check `VITE_API_BASE_URL` or `VITE_API_URL` in Vercel matches backend URL
- Check MongoDB connection string is correct

### Can't login after deploy
- Seeded data is local only—run seed on production MongoDB first
- Or add owner manually in MongoDB Atlas dashboard

---

## MongoDB Atlas - Add Owner Manually

If you need to add an owner without running seeder:

1. Go to https://cloud.mongodb.com
2. Click **Collections** → `hostel-fee-manager` → `users`
3. Click **Insert Document**
4. Paste this (update password with a bcrypt hash):

```json
{
  "_id": { "$oid": "ObjectId" },
  "name": "Hostel Manager",
  "email": "admin@hostel.com",
  "password": "$2a$12$...", // bcrypt hash
  "role": "owner",
  "createdAt": { "$date": "2024-01-01T00:00:00Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00Z" }
}
```

**Or just run the seeder locally then copy the data.**

---

## Environment Variables Summary

### Render (Backend)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
AADHAAR_ENCRYPTION_KEY=32-char-key
NODE_ENV=production
FRONTEND_URL=https://frontend-url.vercel.app
```

### Vercel (Frontend)
```
VITE_API_BASE_URL=https://backend-url.onrender.com
# or VITE_API_URL=https://backend-url.onrender.com
```

---

## Done! 🎉

Your site now auto-deploys every time you push to GitHub.

- Backend: https://hostel-fee-manager-backend.onrender.com
- Frontend: https://hostel-fee-manager-frontend.vercel.app

