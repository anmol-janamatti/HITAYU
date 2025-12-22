# Hitayu Deployment Guide

## Overview
- **Frontend**: Vercel (free)
- **Backend**: Render (free)
- **Database**: MongoDB Atlas (free)

---

## Step 1: MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user (remember username/password)
4. Add `0.0.0.0/0` to IP whitelist (allows all IPs)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/hitayu
   ```

---

## Step 2: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repo, select the `backend` folder
4. Configure:
   - **Name**: `hitayu-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

5. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-a-random-32-char-string>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   FRONTEND_URL=<your-vercel-url>  (add after deploying frontend)
   EMAIL_USER=<your-email>
   EMAIL_PASS=<your-app-password>
   ```

6. Click **Create Web Service**
7. Wait for deployment (takes 5-10 minutes)
8. Note your backend URL: `https://hitayu-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://hitayu-api.onrender.com
   VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
   ```

6. Click **Deploy**
7. Note your frontend URL: `https://hitayu.vercel.app`

---

## Step 4: Update Backend CORS

Go back to Render dashboard and add/update:
```
FRONTEND_URL=https://hitayu.vercel.app
```

---

## Step 5: Update Google OAuth

In Google Cloud Console, add authorized origins:
- `https://hitayu.vercel.app`
- `https://hitayu-api.onrender.com`

---

## Done! 🎉

Your app is now live at your Vercel URL!

---

## Troubleshooting

**CORS errors?** 
- Ensure `FRONTEND_URL` is set correctly in Render

**Database connection failed?**
- Check MongoDB Atlas IP whitelist
- Verify connection string format

**Images not loading?**
- Render free tier has ephemeral storage
- For production, use Cloudinary or AWS S3

**Socket.IO not working?**
- Ensure backend URL is correct in frontend env
- Check WebSocket support on Render
