import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const N8N_CAREER_DETAILS_WEBHOOK_URL = 'https://nclbtaru.app.n8n.cloud/webhook/detail-career-path';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

interface Chapter {
  title: string;
}

interface Submodule {
  title: string;
  description: string;
  chapters: Chapter[];
}

interface Module {
  module: string;
  description: string;
  submodules: Submodule[];
}

interface CareerDetails {
  _id: {
    $oid: string;
  };
  uniqueid: string;
  output: {
    greeting: string;
    overview: string[];
    timeRequired: string;
    focusAreas: string[];
    learningPath: Module[];
    finalTip: string;
  };
}

// Dummy data fallback function
const getDummyCareerDetails = (careerPath: string) => {
  const careerData: { [key: string]: any } = {

    "Cyber Security Analyst": {
      greeting: "🔒 Great choice! Becoming a Cyber Security Analyst is a thrilling career that keeps the digital world safe and secure!",
      overview: [
        "Cybersecurity Analysts protect sensitive information and data from cyber attacks.",
        "This field is rapidly expanding with high demand over the next decade.",
        "Opportunities to work in various industries including finance, healthcare, and government.",
        "Playing a crucial role in safeguarding personal and organizational information."
      ],
      timeRequired: "1 Year",
      focusAreas: [
        "Network Security",
        "Encryption",
        "Ethical Hacking",
        "Incident Response",
        "Cyber Laws",
        "Security Protocols"
      ],
      learningPath: [
        {
          module: "Module 1: Introduction to Cybersecurity",
          description: "Get familiar with the basics of cybersecurity, understand what the threats are, and how to protect against them.",
          submodules: [
            {
              title: "Submodule 1: Understanding Cyber Threats",
              description: "Learn about different types of cybersecurity threats.",
              chapters: [
                { title: "Chapter 1: Malware and Viruses" },
                { title: "Chapter 2: Phishing Attacks" },
                { title: "Chapter 3: Denial-of-Service (DoS) Attacks" }
              ]
            },
            {
              title: "Submodule 2: Basics of Network Security",
              description: "Understand the essentials of securing networks.",
              chapters: [
                { title: "Chapter 4: Network Protocols" },
                { title: "Chapter 5: Firewalls and VPNs" },
                { title: "Chapter 6: Intrusion Detection Systems" }
              ]
            }
          ]
        },
        {
          module: "Module 2: Cybersecurity Tools and Techniques",
          description: "Learn about various tools and techniques used by cybersecurity professionals to protect systems.",
          submodules: [
            {
              title: "Submodule 3: Encryption Techniques",
              description: "Comprehend the art of encryption to protect data.",
              chapters: [
                { title: "Chapter 7: Basics of Encryption" },
                { title: "Chapter 8: Symmetric vs Asymmetric Encryption" },
                { title: "Chapter 9: Hashing Algorithms" }
              ]
            },
            {
              title: "Submodule 4: Ethical Hacking and Penetration Testing",
              description: "Explore how ethical hackers find and fix security weaknesses.",
              chapters: [
                { title: "Chapter 10: Introduction to Ethical Hacking" },
                { title: "Chapter 11: Tools for Penetration Testing" },
                { title: "Chapter 12: Reporting and Mitigating Vulnerabilities" }
              ]
            }
          ]
        },
        {
          module: "Module 3: Handling Security Incidents",
          description: "Understand how to respond effectively to security breaches and minimize damage.",
          submodules: [
            {
              title: "Submodule 5: Incident Response Planning",
              description: "Learn to create plans for responding to security incidents.",
              chapters: [
                { title: "Chapter 13: Incident Response Life Cycle" },
                { title: "Chapter 14: Developing an Incident Response Plan" },
                { title: "Chapter 15: Post-Incident Activities" }
              ]
            },
            {
              title: "Submodule 6: Cyber Laws and Regulations",
              description: "Learn about the laws that govern cybersecurity practices.",
              chapters: [
                { title: "Chapter 16: Introduction to Cyber Laws" },
                { title: "Chapter 17: International Cybersecurity Regulations" },
                { title: "Chapter 18: Compliance and Legal Responsibilities" }
              ]
            }
          ]
        }
      ],
      finalTip: "🛡 Keep learning and stay updated with the latest cybersecurity trends and threats to stay one step ahead!"
    },
    "Creative Explorer": {
      greeting: "Welcome to your Creative Explorer journey!",
      overview: [
        "Develop artistic and design thinking skills",
        "Learn digital creation tools and techniques", 
        "Build a portfolio of creative projects",
        "Understand visual communication principles",
        "Explore storytelling across different mediums"
      ],
      timeRequired: "6-12 months for foundational skills",
      focusAreas: ["Digital Design", "Visual Arts", "Creative Writing", "Animation", "UI/UX Design"],
      learningPath: [
        {
          module: "Introduction to Creative Design",
          description: "Learn the fundamentals of design thinking and creative processes",
          submodules: [
            {
              title: "Design Principles",
              description: "Understanding color, composition, and visual hierarchy",
              chapters: [
                { title: "Color Theory Basics" },
                { title: "Typography Fundamentals" },
                { title: "Layout and Composition" }
              ]
            }
          ]
        }
      ],
      finalTip: "Remember, creativity thrives on experimentation. Don't be afraid to try new things and learn from mistakes!"
    },
    "Logical Leader": {
      greeting: "Welcome to your Logical Leader pathway!",
      overview: [
        "Develop analytical and problem-solving skills",
        "Learn project management and leadership principles",
        "Understand business strategy and planning",
        "Build communication and team management skills",
        "Explore entrepreneurship and innovation"
      ],
      timeRequired: "8-15 months for comprehensive development",
      focusAreas: ["Strategic Thinking", "Project Management", "Leadership", "Business Analysis", "Innovation"],
      learningPath: [
        {
          module: "Leadership Fundamentals",
          description: "Core principles of effective leadership and team management",
          submodules: [
            {
              title: "Leadership Styles",
              description: "Understanding different approaches to leadership",
              chapters: [
                { title: "Transformational Leadership" },
                { title: "Situational Leadership" },
                { title: "Team Dynamics" }
              ]
            }
          ]
        }
      ],
      finalTip: "Great leaders are made, not born. Focus on continuous learning and self-improvement!"
    },
    "Science Detective": {
      greeting: "Welcome to your Science Detective adventure!",
      overview: [
        "Develop scientific inquiry and research methods",
        "Learn experimental design and data analysis",
        "Understand scientific communication",
        "Explore various scientific disciplines",
        "Build critical thinking and observation skills"
      ],
      timeRequired: "10-18 months for solid foundation",
      focusAreas: ["Research Methods", "Data Analysis", "Scientific Writing", "Laboratory Skills", "Critical Thinking"],
      learningPath: [
        {
          module: "Scientific Method",
          description: "Understanding how science works and how to conduct research",
          submodules: [
            {
              title: "Research Design",
              description: "Planning and conducting scientific investigations",
              chapters: [
                { title: "Hypothesis Formation" },
                { title: "Experimental Controls" },
                { title: "Data Collection Methods" }
              ]
            }
          ]
        }
      ],
      finalTip: "Science is about asking the right questions. Stay curious and never stop questioning!"
    },
    "Tech Innovator": {
      greeting: "Welcome to your Tech Innovator journey!",
      overview: [
        "Learn programming and software development",
        "Understand emerging technologies and trends",
        "Develop problem-solving through technology",
        "Build technical projects and applications",
        "Explore innovation and entrepreneurship in tech"
      ],
      timeRequired: "12-24 months for strong foundation",
      focusAreas: ["Programming", "Software Development", "AI/ML", "Web Technologies", "Innovation"],
      learningPath: [
        {
          module: "Programming Fundamentals",
          description: "Learn the basics of coding and software development",
          submodules: [
            {
              title: "Programming Concepts",
              description: "Core concepts that apply across all programming languages",
              chapters: [
                { title: "Variables and Data Types" },
                { title: "Control Structures" },
                { title: "Functions and Methods" }
              ]
            }
          ]
        }
      ],
      finalTip: "Technology evolves rapidly. Focus on learning fundamentals and stay adaptable to new tools and trends!"
    }
  };

  return careerData[careerPath] || careerData["Creative Explorer"];
};

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

    // Get student profile
    const student = await Student.findOne({ 
      userId: decoded.userId,
      onboardingCompleted: true 
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get request body for career path details
    const { careerPath, description } = await request.json();

    if (!careerPath) {
      return NextResponse.json(
        { error: 'Career path is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Sending uniqueID, career path, and description to N8N career details webhook:', {
      uniqueId: student.uniqueId,
      careerPath,
      description,
      webhookUrl: N8N_CAREER_DETAILS_WEBHOOK_URL
    });

    // Send uniqueID, career path, and description to N8N webhook using GET request
    const params = new URLSearchParams({
      uniqueId: student.uniqueId,
      careerPath: careerPath,
      description: description || ''
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for detailed generation

    let n8nOutput: any;
    try {
      const response = await fetch(`${N8N_CAREER_DETAILS_WEBHOOK_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('🔍 N8N career details webhook request failed:', response.status, response.statusText);
        return NextResponse.json(
          { error: 'Failed to get career details' },
          { status: 500 }
        );
      }

      const responseText = await response.text();
      console.log('🔍 Raw N8N career details response text:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.log('⚠️ N8N returned empty response, using dummy data fallback');
        return NextResponse.json({
          success: true,
          careerDetails: { output: getDummyCareerDetails(careerPath) }
        });
      }
      
      n8nOutput = JSON.parse(responseText);
      console.log('🔍 Parsed N8N career details response:', n8nOutput);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('🔍 N8N career details webhook request timed out after 30 seconds');
      } else {
        console.error('🔍 N8N career details webhook request failed:', fetchError);
      }
      
      // Return fallback result with dummy data instead of failing
      return NextResponse.json({
        success: true,
        careerDetails: { output: getDummyCareerDetails(careerPath) }
      });
    }

    // Parse the N8N output format
    let careerDetails: CareerDetails | null = null;
    
    // N8N returns an array with one object, so we need to extract it
    if (n8nOutput && Array.isArray(n8nOutput) && n8nOutput.length > 0) {
      careerDetails = n8nOutput[0];
      console.log('🔍 Using array first element:', careerDetails);
    } else if (n8nOutput && typeof n8nOutput === 'object' && !Array.isArray(n8nOutput)) {
      careerDetails = n8nOutput;
      console.log('🔍 Using direct object:', careerDetails);
    }

    console.log('🔍 Extracted career details:', careerDetails);
    if (careerDetails?.output) {
      console.log('🔍 Career details output structure:', {
        greeting: careerDetails.output.greeting,
        overviewLength: careerDetails.output.overview?.length,
        focusAreasLength: careerDetails.output.focusAreas?.length,
        learningPathLength: careerDetails.output.learningPath?.length,
        timeRequired: careerDetails.output.timeRequired,
        finalTip: careerDetails.output.finalTip
      });
      console.log('🔍 Overview array content:', careerDetails.output.overview);
      console.log('🔍 Focus areas array content:', careerDetails.output.focusAreas);
      console.log('🔍 Learning path array content:', careerDetails.output.learningPath);
    }

    // Ensure the data structure is properly formatted for the frontend
    const responseData = {
      success: true,
      careerDetails: careerDetails,
      n8nResults: n8nOutput
    };
    
    console.log('🔍 Final API response:', JSON.stringify(responseData, null, 2));
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Career details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    // Get student profile
    const student = await Student.findOne({ 
      userId: decoded.userId,
      onboardingCompleted: true 
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get career path and description from query parameters
    const { searchParams } = new URL(request.url);
    const careerPath = searchParams.get('careerPath');
    const description = searchParams.get('description');

    if (!careerPath) {
      return NextResponse.json(
        { error: 'Career path is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Sending uniqueID, career path, and description to N8N career details webhook (GET):', {
      uniqueId: student.uniqueId,
      careerPath,
      description
    });

    // Send uniqueID, career path, and description to N8N webhook using GET request
    const params = new URLSearchParams({
      uniqueId: student.uniqueId,
      careerPath: careerPath,
      description: description || ''
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for detailed generation

    let n8nOutput: any;
    try {
      const response = await fetch(`${N8N_CAREER_DETAILS_WEBHOOK_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('🔍 N8N career details webhook request failed:', response.status, response.statusText);
        return NextResponse.json(
          { error: 'Failed to get career details' },
          { status: 500 }
        );
      }

      const responseText = await response.text();
      console.log('🔍 Raw N8N career details response text:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.log('⚠️ N8N returned empty response, using dummy data fallback');
        return NextResponse.json({
          success: true,
          careerDetails: { output: getDummyCareerDetails(careerPath) }
        });
      }
      
      n8nOutput = JSON.parse(responseText);
      console.log('🔍 Parsed N8N career details response:', n8nOutput);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('🔍 N8N career details webhook request timed out after 30 seconds');
      } else {
        console.error('🔍 N8N career details webhook request failed:', fetchError);
      }
      
      // Return fallback result with dummy data instead of failing
      return NextResponse.json({
        success: true,
        careerDetails: { output: getDummyCareerDetails(careerPath) }
      });
    }

    // Parse the N8N output format
    let careerDetails: CareerDetails | null = null;
    
    // N8N returns an array with one object, so we need to extract it
    if (n8nOutput && Array.isArray(n8nOutput) && n8nOutput.length > 0) {
      careerDetails = n8nOutput[0];
      console.log('🔍 Using array first element:', careerDetails);
    } else if (n8nOutput && typeof n8nOutput === 'object' && !Array.isArray(n8nOutput)) {
      careerDetails = n8nOutput;
      console.log('🔍 Using direct object:', careerDetails);
    }

    console.log('🔍 Extracted career details:', careerDetails);
    if (careerDetails?.output) {
      console.log('🔍 Career details output structure:', {
        greeting: careerDetails.output.greeting,
        overviewLength: careerDetails.output.overview?.length,
        focusAreasLength: careerDetails.output.focusAreas?.length,
        learningPathLength: careerDetails.output.learningPath?.length,
        timeRequired: careerDetails.output.timeRequired,
        finalTip: careerDetails.output.finalTip
      });
      console.log('🔍 Overview array content:', careerDetails.output.overview);
      console.log('🔍 Focus areas array content:', careerDetails.output.focusAreas);
      console.log('🔍 Learning path array content:', careerDetails.output.learningPath);
    }

    // Ensure the data structure is properly formatted for the frontend
    const responseData = {
      success: true,
      careerDetails: careerDetails,
      n8nResults: n8nOutput
    };
    
    console.log('🔍 Final API response:', JSON.stringify(responseData, null, 2));
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Career details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
