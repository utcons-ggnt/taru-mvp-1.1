import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import YoutubeUrl from '@/models/YoutubeUrl';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uniqueid = searchParams.get('uniqueid');
    
    if (!uniqueid) {
      return NextResponse.json({
        success: false,
        message: 'uniqueid parameter is required'
      }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    // Check if there's any YouTube data for this uniqueid
    const youtubeData = await YoutubeUrl.findOne({ uniqueid })
      .sort({ createdAt: -1 })
      .lean() as any;
    
    if (youtubeData) {
      // Data exists, check if it's recent (within last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const isRecent = new Date(youtubeData.createdAt) > tenMinutesAgo;
      
      return NextResponse.json({
        success: true,
        hasData: true,
        isRecent,
        dataExists: true,
        lastUpdated: youtubeData.createdAt,
        message: isRecent ? 'Data is available and recent' : 'Data is available but not recent'
      });
    } else {
      // No data found, scraper might be processing
      return NextResponse.json({
        success: true,
        hasData: false,
        isRecent: false,
        dataExists: false,
        message: 'No data found - scraper may be processing'
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking webhook status:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error checking webhook status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
