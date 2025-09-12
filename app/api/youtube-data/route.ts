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
    
    console.log('🔍 Fetching YouTube data for uniqueid:', uniqueid);
    
    // Find the most recent YouTube data for this uniqueid
    const youtubeData = await YoutubeUrl.findOne({ uniqueid })
      .sort({ createdAt: -1 })
      .lean() as any;
    
    if (!youtubeData) {
      return NextResponse.json({
        success: false,
        message: 'No YouTube data found for this uniqueid',
        data: null
      }, { status: 404 });
    }
    
    // Convert the Module array to a more usable format
    const formattedData = {
      _id: youtubeData._id,
      uniqueid: youtubeData.uniqueid,
      modules: youtubeData.Module.map((module: any, index: number) => {
        const chapters = Object.entries(module).map(([chapterKey, chapterData]: [string, any]) => ({
          chapterKey,
          videoTitle: chapterData.videoTitle,
          videoUrl: chapterData.videoUrl
        }));
        
        return {
          moduleIndex: index,
          chapters
        };
      }),
      createdAt: youtubeData.createdAt,
      updatedAt: youtubeData.updatedAt
    };
    
    console.log('✅ YouTube data fetched successfully:', {
      uniqueid,
      moduleCount: formattedData.modules.length,
      totalChapters: formattedData.modules.reduce((sum: number, module: any) => sum + module.chapters.length, 0)
    });
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uniqueid } = body;
    
    if (!uniqueid) {
      return NextResponse.json({
        success: false,
        message: 'uniqueid is required in request body'
      }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    console.log('🔍 Fetching YouTube data (POST) for uniqueid:', uniqueid);
    
    // Find the most recent YouTube data for this uniqueid
    const youtubeData = await YoutubeUrl.findOne({ uniqueid })
      .sort({ createdAt: -1 })
      .lean() as any;
    
    if (!youtubeData) {
      return NextResponse.json({
        success: false,
        message: 'No YouTube data found for this uniqueid',
        data: null
      }, { status: 404 });
    }
    
    // Convert the Module array to a more usable format
    const formattedData = {
      _id: youtubeData._id,
      uniqueid: youtubeData.uniqueid,
      modules: youtubeData.Module.map((module: any, index: number) => {
        const chapters = Object.entries(module).map(([chapterKey, chapterData]: [string, any]) => ({
          chapterKey,
          videoTitle: chapterData.videoTitle,
          videoUrl: chapterData.videoUrl
        }));
        
        return {
          moduleIndex: index,
          chapters
        };
      }),
      createdAt: youtubeData.createdAt,
      updatedAt: youtubeData.updatedAt
    };
    
    console.log('✅ YouTube data fetched successfully (POST):', {
      uniqueid,
      moduleCount: formattedData.modules.length,
      totalChapters: formattedData.modules.reduce((sum: number, module: any) => sum + module.chapters.length, 0)
    });
    
    return NextResponse.json({
      success: true,
      message: 'YouTube data fetched successfully',
      data: formattedData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching YouTube data (POST):', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error fetching YouTube data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
