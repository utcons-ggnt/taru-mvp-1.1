# Deployment Guide

## 🚨 **Vercel Deployment Issue**

The build is failing because environment variables are not set in Vercel.

## ✅ **Quick Fix**

### **Set Environment Variables in Vercel:**

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add these variables:**

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority
N8N_WEBHOOK_URL=https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY
```

4. **Set Environment to:** `Production, Preview, Development`
5. **Click "Save"**

### **Redeploy:**
- Push any change to your GitHub repository
- Vercel will automatically redeploy

## 🔧 **Required Variables**

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `N8N_WEBHOOK_URL` - Your n8n webhook URL

That's it! The build should complete successfully after setting these variables. 