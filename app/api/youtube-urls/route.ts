import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import YoutubeUrl from '@/models/YoutubeUrl';

export async function GET(request: NextRequest) {
  try {
    // Get uniqueid from query parameters
    const { searchParams } = new URL(request.url);
    const uniqueid = searchParams.get('uniqueid');

    if (!uniqueid) {
      return NextResponse.json(
        { error: 'uniqueid parameter is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    console.log('🎬 Fetching YouTube data for uniqueid:', uniqueid);
    
    // Find the most recent YouTube data for this uniqueid
    const youtubeData = await YoutubeUrl.findOne({ uniqueid: uniqueid })
      .sort({ createdAt: -1 })
      .lean() as any;
    
    if (!youtubeData) {
      return NextResponse.json({
        success: false,
        message: 'No YouTube data found for the provided uniqueid',
        data: null
      }, { status: 404 });
    }
    
    // Convert the Module array to a more usable format
    // Each item in Module array contains one chapter (e.g., {"Chapter 1": {...}})
    const chapters = youtubeData.Module.map((moduleItem: any, index: number) => {
      // Each moduleItem is an object like {"Chapter 1": {videoUrl: "...", videoTitle: "..."}}
      const chapterKey = Object.keys(moduleItem)[0]; // e.g., "Chapter 1"
      const chapterData = moduleItem[chapterKey];
      
      return {
        chapterIndex: index + 1,
        chapterKey,
        videoTitle: chapterData.videoTitle,
        videoUrl: chapterData.videoUrl
      };
    });

    const formattedData = {
      _id: youtubeData._id,
      uniqueid: youtubeData.uniqueid,
      chapters: chapters,
      totalChapters: chapters.length,
      createdAt: youtubeData.createdAt,
      updatedAt: youtubeData.updatedAt
    };
    
    return NextResponse.json({
      success: true,
      message: 'YouTube data fetched successfully',
      data: formattedData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching YouTube data:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error fetching YouTube data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
