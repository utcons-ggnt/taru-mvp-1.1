import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI;
const MONGODB_SIMPLE_URI = process.env.MONGODB_SIMPLE_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // Validate MongoDB URI only when actually connecting
  if (!MONGODB_URI && !MONGODB_DIRECT_URI && !MONGODB_SIMPLE_URI) {
    console.error('No MongoDB URI environment variables are set. Please create a .env.local file with your MongoDB Atlas connection string.');
    throw new Error('No MongoDB URI environment variables are set');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true
    };

    // Try connection strings in order of preference
    const connectionStrings = [
      MONGODB_URI,
      MONGODB_DIRECT_URI,
      MONGODB_SIMPLE_URI
    ].filter((uri): uri is string => Boolean(uri));

    cached.promise = tryConnectWithFallback(connectionStrings, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

async function tryConnectWithFallback(connectionStrings: string[], opts: any) {
  let lastError: any = null;

  for (let i = 0; i < connectionStrings.length; i++) {
    const uri = connectionStrings[i];
    const connectionType = i === 0 ? 'SRV' : i === 1 ? 'Direct' : 'Simple';
    
    console.log(`🔄 Attempting ${connectionType} connection (${i + 1}/${connectionStrings.length})...`);
    
    try {
      const connection = await mongoose.connect(uri, opts);
      console.log(`✅ MongoDB connected successfully using ${connectionType} connection`);
      return connection;
    } catch (error: any) {
      console.error(`❌ ${connectionType} connection failed:`, error.message);
      lastError = error;
      
      // Provide helpful error messages
      if (error.code === 'ECONNREFUSED') {
        console.error('   - Connection refused. Possible causes:');
        console.error('     • MongoDB Atlas cluster is paused');
        console.error('     • Network connectivity issues');
        console.error('     • Firewall blocking MongoDB Atlas');
        console.error('     • IP not whitelisted in MongoDB Atlas');
        console.error('     • DNS resolution issues');
      } else if (error.name === 'MongoServerSelectionError') {
        console.error('   - Server selection timeout. Possible causes:');
        console.error('     • Network connectivity issues');
        console.error('     • MongoDB Atlas cluster is not accessible');
        console.error('     • IP whitelist restrictions');
      }
      
      // If this isn't the last attempt, continue to next connection string
      if (i < connectionStrings.length - 1) {
        console.log('   Trying next connection method...');
        continue;
      }
    }
  }
  
  // If all connection attempts failed
  console.error('❌ All MongoDB connection attempts failed');
  throw lastError;
}

export default connectDB; 