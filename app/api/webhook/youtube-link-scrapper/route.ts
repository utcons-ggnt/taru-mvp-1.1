import { NextRequest, NextResponse } from 'next/server';
import { N8NCacheService } from '@/lib/N8NCacheService';
import connectDB from '@/lib/mongodb';
import YoutubeUrl from '@/models/YoutubeUrl';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get('uniqueid');
    
    if (!uniqueId) {
      return NextResponse.json({
        success: false,
        message: 'uniqueid parameter is required'
      }, { status: 400 });
    }
    
    console.log('🔄 Server-side YouTube Link Scrapper webhook call for uniqueId:', uniqueId);
    
    // Call the N8N webhook
    const webhookResult = await N8NCacheService.callYouTubeLinkScrapper(uniqueId);
    
    // Wait a bit for N8N to process and save data to MongoDB
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to fetch the generated YouTube data
    let youtubeData = null;
    try {
      await connectDB();
      const youtubeRecord = await YoutubeUrl.findOne({ uniqueid: uniqueId })
        .sort({ createdAt: -1 })
        .lean() as any;
      
      if (youtubeRecord) {
        // Format the data for easier consumption
        youtubeData = {
          _id: youtubeRecord._id.toString(),
          uniqueid: youtubeRecord.uniqueid,
          modules: youtubeRecord.Module.map((module: any, index: number) => {
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
          createdAt: youtubeRecord.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: youtubeRecord.updatedAt?.toISOString() || new Date().toISOString()
        };
        
        console.log('✅ YouTube data found:', {
          moduleCount: youtubeData.modules.length,
          totalChapters: youtubeData.modules.reduce((sum: number, module: any) => sum + module.chapters.length, 0)
        });
      } else {
        console.log('⚠️ No YouTube data found yet, N8N may still be processing');
      }
    } catch (dbError) {
      console.error('❌ Error fetching YouTube data from database:', dbError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Webhook called successfully',
      uniqueId,
      webhookResult,
      youtubeData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Server-side webhook call failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Webhook call failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uniqueId = body.uniqueid || body.uniqueId;
    
    if (!uniqueId) {
      return NextResponse.json({
        success: false,
        message: 'uniqueid is required in request body'
      }, { status: 400 });
    }
    
    console.log('🔄 Server-side YouTube Link Scrapper webhook call (POST) for uniqueId:', uniqueId);
    
    // Call the N8N webhook
    const webhookResult = await N8NCacheService.callYouTubeLinkScrapper(uniqueId);
    
    // Wait a bit for N8N to process and save data to MongoDB
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to fetch the generated YouTube data
    let youtubeData = null;
    try {
      await connectDB();
      const youtubeRecord = await YoutubeUrl.findOne({ uniqueid: uniqueId })
        .sort({ createdAt: -1 })
        .lean() as any;
      
      if (youtubeRecord) {
        // Format the data for easier consumption
        youtubeData = {
          _id: youtubeRecord._id.toString(),
          uniqueid: youtubeRecord.uniqueid,
          modules: youtubeRecord.Module.map((module: any, index: number) => {
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
          createdAt: youtubeRecord.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: youtubeRecord.updatedAt?.toISOString() || new Date().toISOString()
        };
        
        console.log('✅ YouTube data found (POST):', {
          moduleCount: youtubeData.modules.length,
          totalChapters: youtubeData.modules.reduce((sum: number, module: any) => sum + module.chapters.length, 0)
        });
      } else {
        console.log('⚠️ No YouTube data found yet, N8N may still be processing');
      }
    } catch (dbError) {
      console.error('❌ Error fetching YouTube data from database:', dbError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Webhook called successfully',
      uniqueId,
      webhookResult,
      youtubeData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Server-side webhook call failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Webhook call failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
