import N8NResult, { IN8NResult } from '@/models/N8NResult';
import Module from '@/models/Module';
import AssessmentResponse from '@/models/AssessmentResponse';
import connectDB from './mongodb';

export interface N8NCacheOptions {
  uniqueId: string;
  resultType: 'assessment_questions' | 'assessment_analysis' | 'module_content' | 'transcript' | 'learning_path' | 'career_analysis';
  webhookUrl: string;
  requestPayload: any;
  forceRegenerate?: boolean;
  cacheExpiryHours?: number;
  metadata?: {
    studentId?: string;
    moduleId?: string;
    assessmentId?: string;
    contentType?: string;
    version?: string;
  };
}

export class N8NCacheService {
  /**
   * Get cached N8N result or generate new one
   */
  static async getOrGenerate<T = any>(
    options: N8NCacheOptions,
    generatorFunction: () => Promise<T>
  ): Promise<T> {
    await connectDB();

    const {
      uniqueId,
      resultType,
      webhookUrl,
      requestPayload,
      forceRegenerate = false,
      cacheExpiryHours = 24,
      metadata = {}
    } = options;

    // Check if we should use cache
    if (!forceRegenerate) {
      const cachedResult = await this.getCachedResult(uniqueId, resultType, cacheExpiryHours);
      if (cachedResult) {
        console.log(`🎯 Using cached N8N result for ${uniqueId} (${resultType})`);
        return cachedResult.processedData;
      }
    }

    console.log(`🔄 Generating new N8N result for ${uniqueId} (${resultType})`);

    try {
      // Generate new result
      const result = await generatorFunction();
      
      // Save to cache
      await this.saveResult({
        uniqueId,
        resultType,
        webhookUrl,
        requestPayload,
        responseData: result,
        processedData: result,
        status: 'completed',
        metadata,
        expiresAt: new Date(Date.now() + cacheExpiryHours * 60 * 60 * 1000)
      });

      return result;
    } catch (error) {
      console.error(`❌ Error generating N8N result for ${uniqueId}:`, error);
      
      // Save error to cache
      await this.saveResult({
        uniqueId,
        resultType,
        webhookUrl,
        requestPayload,
        responseData: null,
        processedData: null,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata
      });

      throw error;
    }
  }

  /**
   * Get cached result if available and not expired
   */
  static async getCachedResult(
    uniqueId: string,
    resultType: string,
    cacheExpiryHours: number = 24
  ): Promise<IN8NResult | null> {
    await connectDB();

    const expiryTime = new Date(Date.now() - cacheExpiryHours * 60 * 60 * 1000);
    
    const cachedResult = await N8NResult.findOne({
      uniqueId,
      resultType,
      status: 'completed',
      generatedAt: { $gte: expiryTime }
    }).sort({ generatedAt: -1 });

    return cachedResult;
  }

  /**
   * Save N8N result to cache
   */
  static async saveResult(data: {
    uniqueId: string;
    resultType: string;
    webhookUrl: string;
    requestPayload: any;
    responseData: any;
    processedData: any;
    status: 'pending' | 'completed' | 'failed';
    errorMessage?: string;
    metadata?: any;
    expiresAt?: Date;
  }): Promise<IN8NResult> {
    await connectDB();

    const n8nResult = new N8NResult({
      uniqueId: data.uniqueId,
      resultType: data.resultType,
      webhookUrl: data.webhookUrl,
      requestPayload: data.requestPayload,
      responseData: data.responseData,
      processedData: data.processedData,
      status: data.status,
      errorMessage: data.errorMessage,
      metadata: data.metadata || {},
      expiresAt: data.expiresAt
    });

    return await n8nResult.save();
  }

  /**
   * Update module with N8N generated content
   */
  static async updateModuleContent(
    moduleId: string,
    contentType: 'mcq' | 'flashcard' | 'transcript',
    content: any,
    n8nResultId: string
  ): Promise<void> {
    await connectDB();

    const updateData: any = {
      'n8nGeneratedContent.lastGeneratedAt': new Date(),
      'n8nGeneratedContent.generationStatus': 'completed'
    };

    if (contentType === 'mcq') {
      updateData['n8nGeneratedContent.mcqQuestions'] = content.map((item: any) => ({
        ...item,
        generatedAt: new Date(),
        n8nResultId
      }));
    } else if (contentType === 'flashcard') {
      updateData['n8nGeneratedContent.flashcards'] = content.map((item: any) => ({
        ...item,
        generatedAt: new Date(),
        n8nResultId
      }));
    } else if (contentType === 'transcript') {
      updateData['n8nGeneratedContent.transcript'] = {
        ...content,
        generatedAt: new Date(),
        n8nResultId
      };
    }

    await Module.findByIdAndUpdate(moduleId, updateData);
  }

  /**
   * Update assessment response with N8N results
   */
  static async updateAssessmentResults(
    uniqueId: string,
    resultType: 'questions' | 'analysis',
    data: any,
    n8nResultId: string
  ): Promise<void> {
    await connectDB();

    const updateData: any = {
      'n8nResults.lastGeneratedAt': new Date()
    };

    if (resultType === 'questions') {
      updateData['n8nResults.questions'] = {
        data,
        generatedAt: new Date(),
        n8nResultId,
        status: 'completed'
      };
    } else if (resultType === 'analysis') {
      updateData['n8nResults.analysis'] = {
        data,
        generatedAt: new Date(),
        n8nResultId,
        status: 'completed'
      };
    }

    await AssessmentResponse.findOneAndUpdate(
      { uniqueId },
      updateData
    );
  }

  /**
   * Get cached module content
   */
  static async getCachedModuleContent(
    moduleId: string,
    contentType: 'mcq' | 'flashcard' | 'transcript',
    cacheExpiryHours: number = 24
  ): Promise<any> {
    await connectDB();

    const module = await Module.findById(moduleId);
    if (!module) return null;

    const lastGenerated = module.n8nGeneratedContent?.lastGeneratedAt;
    if (!lastGenerated) return null;

    const expiryTime = new Date(Date.now() - cacheExpiryHours * 60 * 60 * 1000);
    if (lastGenerated < expiryTime) return null;

    if (contentType === 'mcq') {
      return module.n8nGeneratedContent?.mcqQuestions || null;
    } else if (contentType === 'flashcard') {
      return module.n8nGeneratedContent?.flashcards || null;
    } else if (contentType === 'transcript') {
      return module.n8nGeneratedContent?.transcript || null;
    }

    return null;
  }

  /**
   * Get cached assessment results
   */
  static async getCachedAssessmentResults(
    uniqueId: string,
    resultType: 'questions' | 'analysis',
    cacheExpiryHours: number = 24
  ): Promise<any> {
    await connectDB();

    const assessment = await AssessmentResponse.findOne({ uniqueId });
    if (!assessment) return null;

    const lastGenerated = assessment.n8nResults?.lastGeneratedAt;
    if (!lastGenerated) return null;

    const expiryTime = new Date(Date.now() - cacheExpiryHours * 60 * 60 * 1000);
    if (lastGenerated < expiryTime) return null;

    if (resultType === 'questions') {
      return assessment.n8nResults?.questions?.data || null;
    } else if (resultType === 'analysis') {
      return assessment.n8nResults?.analysis?.data || null;
    }

    return null;
  }

  /**
   * Clear cache for specific uniqueId and resultType
   */
  static async clearCache(uniqueId: string, resultType?: string): Promise<void> {
    await connectDB();

    const query: any = { uniqueId };
    if (resultType) {
      query.resultType = resultType;
    }

    await N8NResult.deleteMany(query);
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalResults: number;
    completedResults: number;
    failedResults: number;
    pendingResults: number;
    byType: Record<string, number>;
  }> {
    await connectDB();

    const stats = await N8NResult.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await N8NResult.aggregate([
      {
        $group: {
          _id: '$resultType',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      totalResults: 0,
      completedResults: 0,
      failedResults: 0,
      pendingResults: 0,
      byType: {} as Record<string, number>
    };

    stats.forEach(stat => {
      result.totalResults += stat.count;
      if (stat._id === 'completed') result.completedResults = stat.count;
      if (stat._id === 'failed') result.failedResults = stat.count;
      if (stat._id === 'pending') result.pendingResults = stat.count;
    });

    typeStats.forEach(stat => {
      result.byType[stat._id] = stat.count;
    });

    return result;
  }
}
