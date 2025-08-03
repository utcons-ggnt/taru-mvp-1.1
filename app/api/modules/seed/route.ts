import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Module from '@/models/Module';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { modules } = await request.json();
    
    if (!modules || !Array.isArray(modules)) {
      return NextResponse.json(
        { success: false, message: 'Invalid modules data' },
        { status: 400 }
      );
    }

    console.log('🌱 Seeding modules with transcribe IDs:', modules.length);

    // Clear existing modules first
    await Module.deleteMany({});
    console.log('🗑️ Cleared existing modules');

    // Insert new modules with transcribe IDs
    const insertedModules = await Module.insertMany(modules);
    console.log('✅ Inserted modules:', insertedModules.length);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedModules.length} modules with transcribe IDs`,
             modules: insertedModules.map(module => ({
         id: module._id,
         uniqueID: module.uniqueID,
         title: module.title,
         subject: module.subject,
         transcribeId: module.uniqueID // The uniqueID is the transcribe ID
       }))
    });

  } catch (error) {
    console.error('❌ Error seeding modules:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed modules', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
         const modules = await Module.find({}).select('uniqueID title subject description');
     
     return NextResponse.json({
       success: true,
       modules: modules.map(module => ({
         uniqueID: module.uniqueID,
         title: module.title,
         subject: module.subject,
         description: module.description,
         transcribeId: module.uniqueID // The uniqueID is the transcribe ID
       }))
    });

  } catch (error) {
    console.error('❌ Error fetching modules:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
} 