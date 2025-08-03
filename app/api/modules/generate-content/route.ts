import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const N8N_MODULE_ASSESSMENT_WEBHOOK_URL = process.env.N8N_MODULE_ASSESSMENT_WEBHOOK_URL || 'https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
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

    // Verify user is a student
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can generate content' },
        { status: 403 }
      );
    }

    const { type, uniqueId } = await request.json();

    // Validate required fields
    if (!type || !uniqueId) {
      return NextResponse.json({ 
        error: 'Type and uniqueId are required' 
      }, { status: 400 });
    }

    // Validate type
    if (!['mcq', 'flash'].includes(type.toLowerCase())) {
      return NextResponse.json({ 
        error: 'Type must be either "mcq" or "flash"' 
      }, { status: 400 });
    }

    // Prepare query parameters for N8N GET request
    const params = new URLSearchParams({
      uniqueID: 'TRANSCRIBE_003',
      submittedAt: new Date().toISOString()
    });

    const webhookUrl = `${N8N_MODULE_ASSESSMENT_WEBHOOK_URL}?${params.toString()}`;
    console.log(`📤 Sending ${type} generation request to N8N:`, webhookUrl);

    // Call N8N webhook
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`📥 N8N ${type} response:`, data);
        
        // Parse the output to extract content
        if (data && data.length > 0 && data[0].output) {
          try {
            const contentData = JSON.parse(data[0].output);
            
            if (Array.isArray(contentData)) {
              return NextResponse.json({
                success: true,
                type,
                content: contentData,
                count: contentData.length,
                metadata: {
                  generatedAt: new Date().toISOString(),
                  studentId: decoded.userId,
                  uniqueId,
                  source: 'n8n'
                }
              });
            } else {
              throw new Error('Content data is not an array');
            }
          } catch (parseError) {
            console.error(`Failed to parse ${type} content:`, parseError);
            return NextResponse.json({
              success: false,
              error: 'Invalid response format from N8N',
              details: parseError instanceof Error ? parseError.message : String(parseError)
            }, { status: 500 });
          }
        } else {
          return NextResponse.json({
            success: false,
            error: 'No content found in N8N response'
          }, { status: 404 });
        }
      } else {
        throw new Error(`N8N returned ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error(`N8N ${type} generation error:`, error);
      
      // Return fallback content
      const fallbackContent = generateFallbackContent(type);
      
      return NextResponse.json({
        success: true,
        type,
        content: fallbackContent,
        count: fallbackContent.length,
        fallback: true,
        metadata: {
          generatedAt: new Date().toISOString(),
          studentId: decoded.userId,
          uniqueId,
          error: `Using fallback content due to N8N error: ${
            error instanceof Error ? error.message : String(error)
          }`
        }
      });
    }

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Generate fallback content when N8N is unavailable
function generateFallbackContent(type: string) {
  if (type === 'MCQ') {
    return [
      {
        Q: "1",
        level: "Basic",
        question: "What is the primary purpose of education?",
        options: [
          "To memorize facts",
          "To develop critical thinking skills",
          "To pass exams",
          "To get a job"
        ],
        answer: "To develop critical thinking skills"
      },
      {
        Q: "2",
        level: "Medium",
        question: "Which of the following is NOT a key component of effective learning?",
        options: [
          "Active engagement",
          "Regular practice",
          "Passive listening",
          "Feedback and reflection"
        ],
        answer: "Passive listening"
      },
      {
        Q: "3",
        level: "Basic",
        question: "What is the best way to retain information?",
        options: [
          "Cramming the night before",
          "Spaced repetition",
          "Reading once",
          "Avoiding practice"
        ],
        answer: "Spaced repetition"
      },
      {
        Q: "4",
        level: "Medium",
        question: "Which learning method is most effective for understanding complex concepts?",
        options: [
          "Rote memorization",
          "Teaching others",
          "Avoiding questions",
          "Skipping difficult topics"
        ],
        answer: "Teaching others"
      },
      {
        Q: "5",
        level: "Advanced",
        question: "What is the relationship between curiosity and learning?",
        options: [
          "Curiosity has no impact on learning",
          "Curiosity can interfere with learning",
          "Curiosity enhances learning and retention",
          "Curiosity only matters for children"
        ],
        answer: "Curiosity enhances learning and retention"
      }
    ];
  } else if (type === 'Flash') {
    return [
      {
        question: "What is the difference between learning and memorization?",
        answer: "Learning involves understanding and applying concepts, while memorization is just recalling facts without comprehension.",
        explanation: "True learning requires critical thinking and the ability to apply knowledge in new situations."
      },
      {
        term: "Active Learning",
        definition: "A learning approach where students engage with the material through discussion, practice, and application rather than passive listening.",
        explanation: "Active learning has been shown to improve retention and understanding compared to passive methods."
      },
      {
        question: "How can you improve your study habits?",
        answer: "Create a consistent schedule, use active learning techniques, take regular breaks, and review material regularly.",
        explanation: "Good study habits are essential for long-term academic success and knowledge retention."
      }
    ];
  }
  
  return [];
} 