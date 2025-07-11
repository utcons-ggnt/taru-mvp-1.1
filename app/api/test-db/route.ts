import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('🔍 MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    await connectDB();
    console.log('🔍 Database connection successful!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      envCheck: {
        mongodbUriExists: !!process.env.MONGODB_URI,
        jwtSecretExists: !!process.env.JWT_SECRET
      }
    });
  } catch (error) {
    console.error('🔍 Database connection failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      envCheck: {
        mongodbUriExists: !!process.env.MONGODB_URI,
        jwtSecretExists: !!process.env.JWT_SECRET
      }
    }, { status: 500 });
  }
} 