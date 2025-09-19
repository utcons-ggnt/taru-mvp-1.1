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
    
    // Check if Module exists and is an array
    if (!youtubeData.Module || !Array.isArray(youtubeData.Module)) {
      console.log('⚠️ Module data is missing or not an array:', youtubeData.Module);
      return NextResponse.json({
        success: false,
        message: 'YouTube data exists but Module array is missing or invalid',
        data: {
          _id: youtubeData._id,
          uniqueid: youtubeData.uniqueid,
          chapters: [],
          totalChapters: 0,
          createdAt: youtubeData.createdAt,
          updatedAt: youtubeData.updatedAt
        }
      }, { status: 200 });
    }

    // Convert the Module array to a more usable format
    // Each item in Module array contains one chapter (e.g., {"Chapter 1": {...}})
    const chapters = youtubeData.Module.map((moduleItem: any, index: number) => {
      // Validate moduleItem structure
      if (!moduleItem || typeof moduleItem !== 'object') {
        console.warn(`⚠️ Invalid module item at index ${index}:`, moduleItem);
        return {
          chapterIndex: index + 1,
          chapterKey: `Chapter ${index + 1}`,
          videoTitle: 'Invalid Chapter',
          videoUrl: ''
        };
      }

      // Each moduleItem is an object like {"Chapter 1": {videoUrl: "...", videoTitle: "..."}}
      const chapterKey = Object.keys(moduleItem)[0]; // e.g., "Chapter 1"
      const chapterData = moduleItem[chapterKey];
      
      // Validate chapterData structure
      if (!chapterData || typeof chapterData !== 'object') {
        console.warn(`⚠️ Invalid chapter data for ${chapterKey}:`, chapterData);
        return {
          chapterIndex: index + 1,
          chapterKey: chapterKey || `Chapter ${index + 1}`,
          videoTitle: 'Invalid Chapter Data',
          videoUrl: ''
        };
      }
      
      return {
        chapterIndex: index + 1,
        chapterKey,
        videoTitle: chapterData.videoTitle || 'Untitled Video',
        videoUrl: chapterData.videoUrl || ''
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
