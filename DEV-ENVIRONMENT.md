# 🛠️ Development Environment Configuration

## 🔧 Environment Variables

### **Required Variables**
```bash
MONGODB_URI=mongodb://localhost:27017/jioworld-learning
JWT_SECRET=your-super-secret-jwt-key-for-development
NODE_ENV=development
```

### **Optional Development Variables**

#### **n8n Webhook Bypass**
```bash
# Skip n8n webhook during development (automatically enabled in development mode)
SKIP_N8N_WEBHOOK=true
```

## 🚀 Development Setup

### **1. Standard Development Mode**
```bash
# Create .env.local file with required variables
MONGODB_URI=mongodb://localhost:27017/jioworld-learning
JWT_SECRET=dev-secret-key-12345
NODE_ENV=development

# Start development server
npm run dev
```

### **2. Development with n8n Webhook Bypass (Default)**
When `NODE_ENV=development` (default for `npm run dev`), the system automatically:
- ✅ Skips n8n webhook calls
- ✅ Uses fallback assessment questions
- ✅ Creates assessment response entries for testing
- ✅ Maintains full flow functionality

### **3. Production-like Testing**
To test with n8n webhooks in development:
```bash
# Set these in .env.local
NODE_ENV=production
SKIP_N8N_WEBHOOK=false

# Start development server
npm run dev
```

## 🧪 Testing Modes

### **Development Mode (Default)**
- ✅ **n8n Webhook**: Bypassed
- ✅ **Assessment Questions**: Uses fallback questions
- ✅ **Database**: Full functionality
- ✅ **Authentication**: Full functionality
- ✅ **User Flow**: Complete end-to-end

### **Production Mode**
- ✅ **n8n Webhook**: Active
- ✅ **Assessment Questions**: Generated via n8n
- ✅ **Database**: Full functionality
- ✅ **Authentication**: Full functionality
- ✅ **User Flow**: Complete end-to-end

## 📋 Development Benefits

### **Faster Development**
- No dependency on external n8n service
- Faster onboarding completion
- Reliable testing environment
- No network timeout issues

### **Consistent Testing**
- Predictable fallback questions
- Same assessment flow
- Deterministic behavior
- Easier debugging

### **Flexible Configuration**
- Easy switch between modes
- Environment-based control
- Override via environment variables
- Production testing capability

## 🔍 Debugging

### **Check Current Mode**
Look for these log messages during onboarding:

**Development Mode:**
```
🔍 Skipping n8n webhook (development mode or SKIP_N8N_WEBHOOK=true)
🔍 Assessment will use fallback questions from API
🔍 Created assessment response entry for development mode
```

**Production Mode:**
```
🔍 Triggering n8n webhook with payload: [{"UniqueID":"STUABC123","submittedAt":"2025-08-02T19:21:31.609Z"}]
🔍 n8n webhook triggered successfully, response: {...}
🔍 Generated questions stored for student: STUABC123
```

## 🎯 Recommended Development Workflow

1. **Start with Development Mode** (default)
   - Test complete user flow
   - Verify all functionality
   - Debug issues faster

2. **Switch to Production Mode** when needed
   - Test n8n integration
   - Verify webhook payload
   - Test error handling

3. **Use Test Scripts**
   ```bash
   # Run comprehensive tests
   node tests/run-all-tests.js
   
   # Debug specific issues
   node tests/debug-onboarding.js
   ```

## ⚡ Quick Setup

```bash
# Clone project
git clone <repository>
cd taru2

# Install dependencies
npm install

# Create environment file
echo "MONGODB_URI=mongodb://localhost:27017/jioworld-learning" > .env.local
echo "JWT_SECRET=dev-secret-key-12345" >> .env.local
echo "NODE_ENV=development" >> .env.local

# Start development server (with n8n bypass)
npm run dev

# Test the flow
node tests/run-all-tests.js
```

🎉 **Ready for development with full functionality and no external dependencies!**