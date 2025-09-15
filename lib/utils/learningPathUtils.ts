import LearningPath from '@/models/LearningPath';
import LearningPathResponse from '@/models/LearningPathResponse';

export interface LearningPathValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProcessedLearningPath {
  pathId: string;
  uniqueId: string;
  name: string;
  description: string;
  category: string;
  targetGrade: string;
  careerGoal: string;
  milestones: any[];
  totalModules: number;
  totalDuration: number;
  totalXpPoints: number;
  source: string;
  metadata: any;
}

export interface LearningPathResponse {
  output: {
    greeting: string;
    overview: string[];
    timeRequired: string;
    focusAreas: string[];
    learningPath: Array<{
      module: string;
      description: string;
      submodules?: Array<{
        title: string;
        description: string;
        chapters: Array<{
          title: string;
        }>;
      }>;
    }>;
    finalTip: string;
  };
  uniqueid: string;
}

/**
 * Validates career details data structure from N8N output
 */
export function validateCareerDetailsData(careerDetails: any): LearningPathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if careerDetails exists
  if (!careerDetails) {
    errors.push('careerDetails is required');
    return { isValid: false, errors, warnings };
  }

  // Check if output exists
  if (!careerDetails.output) {
    errors.push('careerDetails.output is required');
    return { isValid: false, errors, warnings };
  }

  const output = careerDetails.output;

  // Validate required fields
  if (!output.greeting || typeof output.greeting !== 'string') {
    errors.push('greeting is required and must be a string');
  }

  if (!Array.isArray(output.overview) || output.overview.length === 0) {
    errors.push('overview must be a non-empty array');
  } else {
    output.overview.forEach((item: any, index: number) => {
      if (typeof item !== 'string') {
        errors.push(`overview[${index}] must be a string`);
      }
    });
  }

  if (!output.timeRequired || typeof output.timeRequired !== 'string') {
    errors.push('timeRequired is required and must be a string');
  }

  if (!Array.isArray(output.focusAreas) || output.focusAreas.length === 0) {
    errors.push('focusAreas must be a non-empty array');
  } else {
    output.focusAreas.forEach((item: any, index: number) => {
      if (typeof item !== 'string') {
        errors.push(`focusAreas[${index}] must be a string`);
      }
    });
  }

  if (!Array.isArray(output.learningPath) || output.learningPath.length === 0) {
    errors.push('learningPath must be a non-empty array');
  } else {
    output.learningPath.forEach((module: any, moduleIndex: number) => {
      if (!module.module || typeof module.module !== 'string') {
        errors.push(`learningPath[${moduleIndex}].module is required and must be a string`);
      }
      
      if (!module.description || typeof module.description !== 'string') {
        errors.push(`learningPath[${moduleIndex}].description is required and must be a string`);
      }

      if (!Array.isArray(module.submodules)) {
        errors.push(`learningPath[${moduleIndex}].submodules must be an array`);
      } else {
        module.submodules.forEach((submodule: any, subIndex: number) => {
          if (!submodule.title || typeof submodule.title !== 'string') {
            errors.push(`learningPath[${moduleIndex}].submodules[${subIndex}].title is required and must be a string`);
          }
          
          if (!submodule.description || typeof submodule.description !== 'string') {
            errors.push(`learningPath[${moduleIndex}].submodules[${subIndex}].description is required and must be a string`);
          }

          if (!Array.isArray(submodule.chapters)) {
            errors.push(`learningPath[${moduleIndex}].submodules[${subIndex}].chapters must be an array`);
          } else {
            submodule.chapters.forEach((chapter: any, chapterIndex: number) => {
              if (!chapter.title || typeof chapter.title !== 'string') {
                errors.push(`learningPath[${moduleIndex}].submodules[${subIndex}].chapters[${chapterIndex}].title is required and must be a string`);
              }
            });
          }
        });
      }
    });
  }

  if (!output.finalTip || typeof output.finalTip !== 'string') {
    errors.push('finalTip is required and must be a string');
  }

  // Check uniqueid
  if (!careerDetails.uniqueid || typeof careerDetails.uniqueid !== 'string') {
    errors.push('uniqueid is required and must be a string');
  }

  // Add warnings for best practices
  if (output.overview && output.overview.length < 3) {
    warnings.push('Consider providing at least 3 overview points for better context');
  }

  if (output.focusAreas && output.focusAreas.length < 4) {
    warnings.push('Consider providing at least 4 focus areas for comprehensive coverage');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates learning path data before saving
 */
export function validateLearningPathData(data: any): LearningPathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!data.uniqueId) {
    errors.push('uniqueId is required');
  }

  if (!data.name || data.name.trim().length === 0) {
    errors.push('name is required and cannot be empty');
  }

  if (!data.careerGoal || data.careerGoal.trim().length === 0) {
    errors.push('careerGoal is required and cannot be empty');
  }

  if (!data.milestones || !Array.isArray(data.milestones) || data.milestones.length === 0) {
    errors.push('milestones array is required and cannot be empty');
  }

  // Milestones validation
  if (data.milestones && Array.isArray(data.milestones)) {
    data.milestones.forEach((milestone: any, index: number) => {
      if (!milestone.milestoneId) {
        errors.push(`Milestone ${index + 1}: milestoneId is required`);
      }

      if (!milestone.name || milestone.name.trim().length === 0) {
        errors.push(`Milestone ${index + 1}: name is required`);
      }

      if (milestone.estimatedTime && (milestone.estimatedTime < 0 || milestone.estimatedTime > 10080)) {
        warnings.push(`Milestone ${index + 1}: estimatedTime should be between 0 and 10080 minutes (1 week)`);
      }

      if (milestone.progress && (milestone.progress < 0 || milestone.progress > 100)) {
        errors.push(`Milestone ${index + 1}: progress must be between 0 and 100`);
      }

      // Validate submodules if present
      if (milestone.submodules && Array.isArray(milestone.submodules)) {
        milestone.submodules.forEach((submodule: any, subIndex: number) => {
          if (!submodule.title || submodule.title.trim().length === 0) {
            warnings.push(`Milestone ${index + 1}, Submodule ${subIndex + 1}: title is recommended`);
          }

          if (submodule.chapters && Array.isArray(submodule.chapters)) {
            submodule.chapters.forEach((chapter: any, chIndex: number) => {
              if (!chapter.title || chapter.title.trim().length === 0) {
                warnings.push(`Milestone ${index + 1}, Submodule ${subIndex + 1}, Chapter ${chIndex + 1}: title is recommended`);
              }
            });
          }
        });
      }
    });
  }

  // Numeric validations
  if (data.totalDuration && (data.totalDuration < 0 || data.totalDuration > 10080)) {
    warnings.push('totalDuration should be between 0 and 10080 minutes (1 week)');
  }

  if (data.totalXpPoints && (data.totalXpPoints < 0 || data.totalXpPoints > 10000)) {
    warnings.push('totalXpPoints should be between 0 and 10000');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Creates a learning path response in the exact reference format from N8N output
 */
export function createLearningPathResponse(
  rawData: any,
  uniqueId: string
): LearningPathResponse {
  // Ensure exact mapping from N8N output structure
  return {
    output: {
      greeting: rawData.greeting || `🎮 You're on a thrilling path! As a professional, you'll blend creativity with technology to push the boundaries of innovation.`,
      overview: Array.isArray(rawData.overview) ? rawData.overview : [
        "This career path combines technical skills with creative problem-solving.",
        "You'll have the opportunity to work on exciting projects and cutting-edge technologies.",
        "The industry offers excellent growth potential and diverse career opportunities.",
        "You'll be at the forefront of innovation, making a real impact in your field."
      ],
      timeRequired: rawData.timeRequired || "2 Years",
      focusAreas: Array.isArray(rawData.focusAreas) ? rawData.focusAreas : [
        "Technical Skills",
        "Problem Solving",
        "Communication",
        "Project Management",
        "Continuous Learning",
        "Industry Knowledge"
      ],
      learningPath: Array.isArray(rawData.learningPath) ? rawData.learningPath.map((module: any) => ({
        module: module.module || "Module",
        description: module.description || "Learn essential skills and knowledge",
        submodules: Array.isArray(module.submodules) ? module.submodules.map((sub: any) => ({
          title: sub.title || "Submodule",
          description: sub.description || "Detailed learning content",
          chapters: Array.isArray(sub.chapters) ? sub.chapters.map((chapter: any) => ({
            title: chapter.title || "Chapter"
          })) : []
        })) : []
      })) : [],
      finalTip: rawData.finalTip || "🔍 Stay curious and keep experimenting with different techniques and technologies. Innovation is at the heart of success!"
    },
    uniqueid: uniqueId
  };
}

/**
 * Processes raw learning path data from N8N into a structured format
 * Updated to match the new reference format with proper output structure
 */
export function processLearningPathData(
  rawData: any,
  student: any,
  careerPath: string,
  source: string = 'n8n'
): ProcessedLearningPath {
  const pathId = `LP_DETAILED_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  // Process milestones from raw data
  const milestones = rawData.learningPath?.map((module: any, index: number) => {
    // Extract module modules (submodules and chapters)
    const moduleModules = module.submodules?.map((sub: any, subIndex: number) => 
      sub.chapters?.map((chapter: any, chIndex: number) => 
        `${module.module}_${sub.title}_${chapter.title}`.replace(/\s+/g, '_')
      ).join(',') || []
    ).flat() || [];

    // Process submodules with enhanced structure
    const processedSubmodules = module.submodules?.map((sub: any, subIndex: number) => ({
      title: sub.title || `Submodule ${subIndex + 1}`,
      description: sub.description || '',
      chapters: sub.chapters?.map((chapter: any, chIndex: number) => ({
        title: chapter.title || `Chapter ${chIndex + 1}`,
        description: chapter.description || '',
        estimatedTime: 30, // Default 30 minutes per chapter
        resources: [],
        completed: false
      })) || [],
      completed: false
    })) || [];

    return {
      milestoneId: `MIL_${pathId}_${index}`,
      name: module.module || `Module ${index + 1}`,
      description: module.description || '',
      modules: moduleModules,
      estimatedTime: 120, // Default 2 hours per module
      prerequisites: index === 0 ? [] : [`MIL_${pathId}_${index - 1}`],
      status: index === 0 ? 'available' : 'locked',
      progress: 0,
      submodules: processedSubmodules,
      difficulty: 'beginner',
      skills: extractSkillsFromModule(module),
      learningObjectives: extractLearningObjectives(module)
    };
  }) || [];

  // Calculate totals
  const totalModules = rawData.learningPath?.reduce((sum: number, module: any) => 
    sum + (module.submodules?.reduce((subSum: number, sub: any) => 
      subSum + (sub.chapters?.length || 0), 0) || 0), 0) || 0;

  const totalDuration = milestones.reduce((sum: number, milestone: any) => 
    sum + milestone.estimatedTime, 0);

  return {
    pathId,
    uniqueId: student.uniqueId,
    name: `${careerPath} Learning Path`,
    description: rawData.greeting || `Detailed learning path for ${careerPath}`,
    category: 'vocational',
    targetGrade: student.classGrade || '6',
    careerGoal: careerPath,
    milestones,
    totalModules,
    totalDuration,
    totalXpPoints: milestones.length * 100,
    source,
    metadata: {
      generatedAt: new Date().toISOString(),
      studentId: student.userId,
      totalMilestones: milestones.length,
      focusAreas: rawData.focusAreas || [],
      timeRequired: rawData.timeRequired || 'Unknown',
      finalTip: rawData.finalTip || ''
    }
  };
}

/**
 * Extracts skills from module data
 */
function extractSkillsFromModule(module: any): string[] {
  const skills: string[] = [];
  
  if (module.submodules) {
    module.submodules.forEach((sub: any) => {
      if (sub.title) {
        // Extract key terms from submodule titles
        const words = sub.title.toLowerCase().split(/\s+/);
        words.forEach((word: string) => {
          if (word.length > 3 && !['and', 'the', 'for', 'with', 'from'].includes(word)) {
            skills.push(word.charAt(0).toUpperCase() + word.slice(1));
          }
        });
      }
    });
  }
  
  return [...new Set(skills)]; // Remove duplicates
}

/**
 * Extracts learning objectives from module data
 */
function extractLearningObjectives(module: any): string[] {
  const objectives: string[] = [];
  
  if (module.description) {
    // Extract sentences that look like learning objectives
    const sentences = module.description.split(/[.!?]+/);
    sentences.forEach((sentence: string) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 10 && (
        trimmed.toLowerCase().includes('learn') ||
        trimmed.toLowerCase().includes('understand') ||
        trimmed.toLowerCase().includes('develop') ||
        trimmed.toLowerCase().includes('master')
      )) {
        objectives.push(trimmed);
      }
    });
  }
  
  return objectives;
}

/**
 * Saves N8N output directly in the exact database format
 */
export async function saveN8NLearningPathResponse(
  n8nOutput: any,
  uniqueId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Create exact format response from N8N output
    const exactFormatResponse = {
      output: {
        greeting: n8nOutput.greeting || `🎮 You're on a thrilling path! As a professional, you'll blend creativity with technology to push the boundaries of innovation.`,
        overview: Array.isArray(n8nOutput.overview) ? n8nOutput.overview : [],
        timeRequired: n8nOutput.timeRequired || "2 Years",
        focusAreas: Array.isArray(n8nOutput.focusAreas) ? n8nOutput.focusAreas : [],
        learningPath: Array.isArray(n8nOutput.learningPath) ? n8nOutput.learningPath.map((module: any) => ({
          module: module.module || "Module",
          description: module.description || "Learn essential skills and knowledge",
          submodules: Array.isArray(module.submodules) ? module.submodules.map((sub: any) => ({
            title: sub.title || "Submodule",
            description: sub.description || "Detailed learning content",
            chapters: Array.isArray(sub.chapters) ? sub.chapters.map((chapter: any) => ({
              title: chapter.title || "Chapter"
            })) : []
          })) : []
        })) : [],
        finalTip: n8nOutput.finalTip || "🔍 Stay curious and keep experimenting with different techniques and technologies. Innovation is at the heart of success!"
      },
      uniqueid: uniqueId
    };

    // Check for existing response
    const existingResponse = await LearningPathResponse.findOne({
      uniqueid: uniqueId,
      'output.greeting': { $regex: exactFormatResponse.output.greeting.split(',')[0], $options: 'i' }
    });

    if (existingResponse) {
      // Update existing response
      const updatedResponse = await LearningPathResponse.findByIdAndUpdate(
        existingResponse._id,
        exactFormatResponse,
        { new: true, upsert: true }
      );

      console.log('✅ N8N learning path response updated:', updatedResponse?._id);
      return {
        success: true,
        id: updatedResponse?._id.toString()
      };
    }

    // Create new response
    const newResponse = new LearningPathResponse(exactFormatResponse);
    await newResponse.save();

    console.log('✅ N8N learning path response saved:', newResponse._id);
    return {
      success: true,
      id: newResponse._id.toString()
    };

  } catch (error) {
    console.error('❌ Error saving N8N learning path response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Saves learning path response in the exact reference format
 */
export async function saveLearningPathResponse(
  learningPathResponse: LearningPathResponse
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Check if response already exists for this uniqueid and similar greeting
    const existingResponse = await LearningPathResponse.findOne({
      uniqueid: learningPathResponse.uniqueid,
      'output.greeting': { $regex: learningPathResponse.output.greeting.split(',')[0], $options: 'i' }
    });

    if (existingResponse) {
      // Update existing response with exact format mapping
      const updatedResponse = await LearningPathResponse.findByIdAndUpdate(
        existingResponse._id,
        {
          output: {
            greeting: learningPathResponse.output.greeting,
            overview: learningPathResponse.output.overview,
            timeRequired: learningPathResponse.output.timeRequired,
            focusAreas: learningPathResponse.output.focusAreas,
            learningPath: learningPathResponse.output.learningPath.map(module => ({
              module: module.module,
              description: module.description,
              submodules: module.submodules?.map(sub => ({
                title: sub.title,
                description: sub.description,
                chapters: sub.chapters.map(chapter => ({
                  title: chapter.title
                }))
              })) || []
            })),
            finalTip: learningPathResponse.output.finalTip
          },
          uniqueid: learningPathResponse.uniqueid
        },
        { new: true, upsert: true }
      );

      console.log('✅ Learning path response updated:', updatedResponse?._id);
      return {
        success: true,
        id: updatedResponse?._id.toString()
      };
    }

    // Create new response with exact format mapping
    const newResponse = new LearningPathResponse({
      output: {
        greeting: learningPathResponse.output.greeting,
        overview: learningPathResponse.output.overview,
        timeRequired: learningPathResponse.output.timeRequired,
        focusAreas: learningPathResponse.output.focusAreas,
        learningPath: learningPathResponse.output.learningPath.map(module => ({
          module: module.module,
          description: module.description,
          submodules: module.submodules?.map(sub => ({
            title: sub.title,
            description: sub.description,
            chapters: sub.chapters.map(chapter => ({
              title: chapter.title
            }))
          })) || []
        })),
        finalTip: learningPathResponse.output.finalTip
      },
      uniqueid: learningPathResponse.uniqueid
    });
    
    await newResponse.save();

    console.log('✅ Learning path response saved:', newResponse._id);
    return {
      success: true,
      id: newResponse._id.toString()
    };

  } catch (error) {
    console.error('❌ Error saving learning path response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Retrieves learning path responses by uniqueid in the exact format
 */
export async function getLearningPathResponses(
  uniqueid: string
): Promise<LearningPathResponse[]> {
  try {
    // Query with exact format projection to ensure perfect mapping
    const responses = await LearningPathResponse.find({ uniqueid })
      .sort({ createdAt: -1 })
      .select({
        'output.greeting': 1,
        'output.overview': 1,
        'output.timeRequired': 1,
        'output.focusAreas': 1,
        'output.learningPath.module': 1,
        'output.learningPath.description': 1,
        'output.learningPath.submodules.title': 1,
        'output.learningPath.submodules.description': 1,
        'output.learningPath.submodules.chapters.title': 1,
        'output.finalTip': 1,
        'uniqueid': 1,
        '_id': 0
      })
      .lean();

    // Return in exact format with explicit mapping
    return responses.map((response: any) => ({
      output: {
        greeting: response.output.greeting,
        overview: response.output.overview,
        timeRequired: response.output.timeRequired,
        focusAreas: response.output.focusAreas,
        learningPath: response.output.learningPath.map((module: any) => ({
          module: module.module,
          description: module.description,
          submodules: module.submodules?.map((sub: any) => ({
            title: sub.title,
            description: sub.description,
            chapters: sub.chapters.map((chapter: any) => ({
              title: chapter.title
            }))
          })) || []
        })),
        finalTip: response.output.finalTip
      },
      uniqueid: response.uniqueid
    }));

  } catch (error) {
    console.error('❌ Error retrieving learning path responses:', error);
    return [];
  }
}

/**
 * Saves learning path to database with validation and error handling
 */
export async function saveLearningPathToDatabase(
  processedData: ProcessedLearningPath
): Promise<{ success: boolean; pathId?: string; error?: string }> {
  try {
    // Validate data before saving
    const validation = validateLearningPathData(processedData);
    
    if (!validation.isValid) {
      console.error('❌ Learning path validation failed:', validation.errors);
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ Learning path validation warnings:', validation.warnings);
    }

    // Check for existing learning path
    const existingPath = await LearningPath.findOne({
      uniqueId: processedData.uniqueId,
      careerGoal: processedData.careerGoal
    });

    if (existingPath) {
      console.log('🔍 Learning path already exists, updating...');
      
      // Update existing path
      const updatedPath = await LearningPath.findByIdAndUpdate(
        existingPath._id,
        {
          ...processedData,
          updatedAt: new Date()
        },
        { new: true }
      );

      return {
        success: true,
        pathId: updatedPath?.pathId
      };
    }

    // Create new learning path
    const learningPath = new LearningPath({
      ...processedData,
      isActive: true,
      source: processedData.source,
      version: '1.0',
      tags: [processedData.careerGoal.toLowerCase().replace(/\s+/g, '-')],
      difficulty: 'beginner',
      prerequisites: [],
      learningOutcomes: processedData.milestones.flatMap(m => m.learningObjectives),
      resources: [],
      studentProgress: {
        currentMilestone: processedData.milestones[0]?.milestoneId || '',
        completedMilestones: [],
        totalTimeSpent: 0,
        lastAccessed: new Date(),
        completionPercentage: 0
      },
      ratings: [],
      averageRating: 0,
      totalEnrollments: 0,
      completionRate: 0
    });

    await learningPath.save();
    console.log('✅ Learning path saved successfully:', learningPath.pathId);

    return {
      success: true,
      pathId: learningPath.pathId
    };

  } catch (error) {
    console.error('❌ Error saving learning path to database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Retrieves learning path by uniqueId and careerGoal
 */
export async function getLearningPathByCareer(
  uniqueId: string,
  careerGoal: string
): Promise<any> {
  try {
    const learningPath = await LearningPath.findOne({
      uniqueId,
      careerGoal,
      isActive: true
    });

    return learningPath;
  } catch (error) {
    console.error('❌ Error retrieving learning path:', error);
    return null;
  }
}

/**
 * Updates learning path progress
 */
export async function updateLearningPathProgress(
  pathId: string,
  studentId: string,
  progressData: {
    currentMilestone?: string;
    completedMilestones?: string[];
    timeSpent?: number;
    milestoneProgress?: { [milestoneId: string]: number };
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const learningPath = await LearningPath.findOne({ pathId });
    
    if (!learningPath) {
      return {
        success: false,
        error: 'Learning path not found'
      };
    }

    // Update student progress
    if (progressData.currentMilestone) {
      learningPath.studentProgress.currentMilestone = progressData.currentMilestone;
    }

    if (progressData.completedMilestones) {
      learningPath.studentProgress.completedMilestones = progressData.completedMilestones;
    }

    if (progressData.timeSpent) {
      learningPath.studentProgress.totalTimeSpent += progressData.timeSpent;
    }

    if (progressData.milestoneProgress) {
      learningPath.milestones.forEach((milestone: any) => {
        if (progressData.milestoneProgress![milestone.milestoneId] !== undefined) {
          milestone.progress = progressData.milestoneProgress![milestone.milestoneId];
        }
      });
    }

    // Calculate completion percentage
    const totalMilestones = learningPath.milestones.length;
    const completedMilestones = learningPath.studentProgress.completedMilestones.length;
    learningPath.studentProgress.completionPercentage = Math.round((completedMilestones / totalMilestones) * 100);

    learningPath.studentProgress.lastAccessed = new Date();
    learningPath.updatedAt = new Date();

    await learningPath.save();

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating learning path progress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
