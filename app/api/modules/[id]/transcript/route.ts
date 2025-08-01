import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Module from '@/models/Module';
import { N8NService } from '@/app/modules/[id]/services/N8NService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moduleId } = await params;
    const { action, videoUrl, options } = await request.json();
    
    // Get token from HTTP-only cookie
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get module
    const module = await Module.findOne({ moduleId, isActive: true });
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    const n8nService = new N8NService();

    switch (action) {
      case 'generate_transcript':
        try {
          // Generate transcript directly using N8N webhook
          const transcriptPayload = {
            videoUrl: videoUrl || module.videoUrl,
            moduleId,
            options: {
              language: options?.language || 'en',
              accuracy: options?.accuracy || 'high',
              includeTimestamps: options?.includeTimestamps !== false,
              ...options
            },
            type: 'transcript_generation',
            timestamp: new Date().toISOString()
          };

          console.log('📤 Requesting transcript generation from N8N:', {
            moduleId,
            videoUrl: (videoUrl || module.videoUrl).substring(0, 50) + '...'
          });

          const transcriptResponse = await fetch(process.env.N8N_WEBHOOK_URL || 'https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transcriptPayload)
          });

          if (!transcriptResponse.ok) {
            throw new Error(`N8N transcript generation failed: ${transcriptResponse.status}`);
          }

          const transcriptData = await transcriptResponse.json();

          if (transcriptData) {
            // Send transcript data to N8N for analysis
            const analysisPayload = {
              moduleId,
              videoData: {
                id: module.moduleId,
                title: module.title,
                url: videoUrl || module.videoUrl,
                duration: module.duration
              },
              transcriptData: {
                transcriptId: transcriptData.transcriptId || `transcript_${moduleId}`,
                segments: transcriptData.segments || transcriptData.transcript || [],
                totalSegments: transcriptData.segments?.length || transcriptData.transcript?.length || 0,
                language: transcriptData.language || 'en',
                confidence: transcriptData.confidence || 0.9
              },
              context: {
                action: 'transcript_generated',
                userInteraction: 'api_request',
                userId: decoded.userId,
                userRole: user.role
              },
              type: 'transcript_analysis',
              timestamp: new Date().toISOString()
            };

            const analysisResponse = await fetch(process.env.N8N_WEBHOOK_URL || 'https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(analysisPayload)
            });

            if (analysisResponse.ok) {
              console.log('📤 Transcript analysis sent to N8N successfully');
            }

            return NextResponse.json({
              success: true,
              message: 'Transcript generated successfully',
              transcriptData: {
                transcriptId: transcriptData.transcriptId || `transcript_${moduleId}_${Date.now()}`,
                segments: transcriptData.segments || [],
                totalSegments: transcriptData.segments?.length || 0,
                language: transcriptData.language || 'en',
                confidence: transcriptData.confidence || 0.9,
                generatedAt: new Date().toISOString(),
                source: 'n8n'
              }
            });
          } else {
            return NextResponse.json(
              { error: 'Failed to generate transcript' },
              { status: 500 }
            );
          }
        } catch (error) {
          console.error('Transcript generation error:', error);
          return NextResponse.json(
            { error: 'Failed to generate transcript' },
            { status: 500 }
          );
        }

      case 'send_transcript_data':
        try {
          const { payload } = await request.json();
          
          // Send transcript data directly to N8N webhook
          const transcriptResponse = await fetch(process.env.N8N_WEBHOOK_URL || 'https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          if (!transcriptResponse.ok) {
            throw new Error(`N8N transcript data send failed: ${transcriptResponse.status}`);
          }

          const responseData = await transcriptResponse.json();

          return NextResponse.json({
            success: true,
            message: 'Transcript data sent to N8N successfully',
            data: responseData
          });
        } catch (error) {
          console.error('Send transcript data error:', error);
          return NextResponse.json(
            { error: 'Failed to send transcript data' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be one of: generate_transcript, send_transcript_data' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Transcript API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moduleId } = await params;
    
    // Get token from HTTP-only cookie
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get module
    const module = await Module.findOne({ moduleId, isActive: true });
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      moduleId,
      videoUrl: module.videoUrl,
      title: module.title,
      duration: module.duration,
      hasTranscript: false, // This would be true if transcript exists in database
      transcriptStatus: 'not_generated'
    });

  } catch (error) {
    console.error('Get transcript info error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 