# Vercel Deployment Guide

## 🚨 **Current Issue**
The build is failing because the `MONGODB_URI` environment variable is not set in Vercel.

## ✅ **Solution: Set Environment Variables in Vercel**

### **Method 1: Vercel Dashboard (Recommended)**

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following environment variables:**

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority
N8N_WEBHOOK_URL=https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY
```

4. **Set Environment to:** `Production, Preview, Development`
5. **Click "Save"**

### **Method 2: Vercel CLI**

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add MONGODB_URI
vercel env add N8N_WEBHOOK_URL

# Deploy
vercel --prod
```

### **Method 3: .env.local file (for local development)**

Create a `.env.local` file in your project root:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority
N8N_WEBHOOK_URL=https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY
```

## 🔧 **Required Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ Yes |
| `N8N_WEBHOOK_URL` | n8n webhook URL for chat integration | ✅ Yes |

## 📋 **MongoDB Atlas Setup (if needed)**

1. **Create MongoDB Atlas account** at https://cloud.mongodb.com
2. **Create a new cluster**
3. **Get your connection string:**
   - Go to "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with your database name

## 🚀 **After Setting Environment Variables**

1. **Redeploy your application:**
   ```bash
   vercel --prod
   ```

2. **Or trigger a new deployment from GitHub:**
   - Push any change to your main branch
   - Vercel will automatically redeploy

## ✅ **Verification**

After deployment, check:
- ✅ Build completes successfully
- ✅ No MongoDB connection errors
- ✅ Chat functionality works
- ✅ All API routes respond correctly

## 🔍 **Troubleshooting**

### **If build still fails:**
1. Check that environment variables are set correctly
2. Verify MongoDB Atlas connection string
3. Ensure MongoDB Atlas IP whitelist includes Vercel's IPs (or set to 0.0.0.0/0 for testing)

### **If MongoDB connection fails in production:**
1. Check MongoDB Atlas Network Access settings
2. Verify database user credentials
3. Check if database exists

## 📞 **Support**

If you continue to have issues:
1. Check Vercel deployment logs
2. Verify environment variables in Vercel dashboard
3. Test MongoDB connection locally first 