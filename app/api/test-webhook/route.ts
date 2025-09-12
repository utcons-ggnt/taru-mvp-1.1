import { NextRequest, NextResponse } from 'next/server';
import { N8NCacheService } from '@/lib/N8NCacheService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get('uniqueid') || 'test-unique-id';
    
    console.log('🧪 Testing YouTube Link Scrapper webhook with uniqueId:', uniqueId);
    
    const result = await N8NCacheService.callYouTubeLinkScrapper(uniqueId);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook test completed successfully',
      uniqueId,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Webhook test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uniqueId = body.uniqueid || body.uniqueId || 'test-unique-id';
    
    console.log('🧪 Testing YouTube Link Scrapper webhook (POST) with uniqueId:', uniqueId);
    
    const result = await N8NCacheService.callYouTubeLinkScrapper(uniqueId);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook test completed successfully',
      uniqueId,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Webhook test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
