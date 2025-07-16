import { EventEmitter } from 'events';

// Data synchronization event types
export enum DataSyncEvents {
  USER_UPDATED = 'user:updated',
  PROGRESS_UPDATED = 'progress:updated',
  MODULE_UPDATED = 'module:updated',
  ASSESSMENT_UPDATED = 'assessment:updated',
  DASHBOARD_UPDATED = 'dashboard:updated',
  LEARNING_PATH_UPDATED = 'learningPath:updated',
  STUDENT_PROGRESS_UPDATED = 'studentProgress:updated',
  PARENT_DASHBOARD_UPDATED = 'parentDashboard:updated',
  TEACHER_DASHBOARD_UPDATED = 'teacherDashboard:updated',
  ADMIN_DASHBOARD_UPDATED = 'adminDashboard:updated',
  GLOBAL_STATE_UPDATED = 'globalState:updated'
}

// Data types for synchronization
export interface SyncData {
  type: DataSyncEvents;
  userId?: string;
  data: Record<string, unknown>;
  timestamp: number;
  source: string;
}

// Cache for storing synchronized data
class DataCache {
  private cache = new Map<string, { data: Record<string, unknown>; timestamp: number; ttl: number }>();

  set(key: string, data: Record<string, unknown>, ttl: number = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): Record<string, unknown> | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Get all keys for a specific pattern
  getKeys(pattern: string): string[] {
    return Array.from(this.cache.keys()).filter(key => key.includes(pattern));
  }
}

// Main data synchronization class
class DataSynchronizer extends EventEmitter {
  private cache = new DataCache();
  private pendingUpdates = new Map<string, NodeJS.Timeout>();
  private syncQueue: SyncData[] = [];
  private isProcessing = false;

  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle data updates
    this.on(DataSyncEvents.USER_UPDATED, (data: SyncData) => this.handleUserUpdate(data));
    this.on(DataSyncEvents.PROGRESS_UPDATED, (data: SyncData) => this.handleProgressUpdate(data));
    this.on(DataSyncEvents.MODULE_UPDATED, (data: SyncData) => this.handleModuleUpdate(data));
    this.on(DataSyncEvents.ASSESSMENT_UPDATED, (data: SyncData) => this.handleAssessmentUpdate(data));
    this.on(DataSyncEvents.DASHBOARD_UPDATED, (data: SyncData) => this.handleDashboardUpdate(data));
  }

  // Update data and notify all listeners
  updateData(eventType: DataSyncEvents, data: Record<string, unknown>, userId?: string, source: string = 'unknown') {
    const syncData: SyncData = {
      type: eventType,
      userId,
      data,
      timestamp: Date.now(),
      source
    };

    // Add to sync queue
    this.syncQueue.push(syncData);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processSyncQueue();
    }

    // Emit event for immediate listeners
    this.emit(eventType, syncData);

    // Cache the data
    const cacheKey = this.generateCacheKey(eventType, userId);
    this.cache.set(cacheKey, data);

    // Debounce updates to prevent excessive API calls
    this.debounceUpdate(eventType, userId);
  }

  private async processSyncQueue() {
    if (this.isProcessing || this.syncQueue.length === 0) return;

    this.isProcessing = true;

    try {
      while (this.syncQueue.length > 0) {
        const syncData = this.syncQueue.shift();
        if (!syncData) continue;

        // Process the sync data
        await this.processSyncData(syncData);
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processSyncData(syncData: SyncData) {
    try {
      // Update cache
      const cacheKey = this.generateCacheKey(syncData.type, syncData.userId);
      this.cache.set(cacheKey, syncData.data);

      // Emit global update event
      this.emit(DataSyncEvents.GLOBAL_STATE_UPDATED, syncData);

      // Handle specific update types
      switch (syncData.type) {
        case DataSyncEvents.PROGRESS_UPDATED:
          await this.handleProgressUpdate(syncData);
          break;
        case DataSyncEvents.USER_UPDATED:
          await this.handleUserUpdate(syncData);
          break;
        case DataSyncEvents.MODULE_UPDATED:
          await this.handleModuleUpdate(syncData);
          break;
        case DataSyncEvents.ASSESSMENT_UPDATED:
          await this.handleAssessmentUpdate(syncData);
          break;
        case DataSyncEvents.DASHBOARD_UPDATED:
          await this.handleDashboardUpdate(syncData);
          break;
      }
    } catch (error) {
      console.error('Error processing sync data:', error);
    }
  }

  private debounceUpdate(eventType: DataSyncEvents, userId?: string) {
    const key = `${eventType}:${userId || 'global'}`;
    
    if (this.pendingUpdates.has(key)) {
      clearTimeout(this.pendingUpdates.get(key)!);
    }

    const timeout = setTimeout(() => {
      this.pendingUpdates.delete(key);
      this.emit(`${eventType}:debounced`, { eventType, userId });
    }, 1000); // 1 second debounce

    this.pendingUpdates.set(key, timeout);
  }

  private generateCacheKey(eventType: DataSyncEvents, userId?: string): string {
    return `${eventType}:${userId || 'global'}`;
  }

  // Get cached data
  getCachedData(eventType: DataSyncEvents, userId?: string): Record<string, unknown> | null {
    const cacheKey = this.generateCacheKey(eventType, userId);
    return this.cache.get(cacheKey);
  }

  // Clear cache for specific data type
  clearCache(eventType: DataSyncEvents, userId?: string) {
    const cacheKey = this.generateCacheKey(eventType, userId);
    this.cache.delete(cacheKey);
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear();
  }

  // Handle specific update types
  private async handleUserUpdate(syncData: SyncData) {
    // Update user-related caches
    this.cache.set(`user:${syncData.userId}`, syncData.data);
    
    // Clear related caches that depend on user data
    this.cache.delete(`dashboard:${syncData.userId}`);
    this.cache.delete(`progress:${syncData.userId}`);
    
    // Emit user-specific events
    this.emit(`${DataSyncEvents.USER_UPDATED}:${syncData.userId}`, syncData);
  }

  private async handleProgressUpdate(syncData: SyncData) {
    // Update progress cache
    this.cache.set(`progress:${syncData.userId}`, syncData.data);
    
    // Clear dependent caches
    this.cache.delete(`dashboard:${syncData.userId}`);
    this.cache.delete(`studentProgress:${syncData.userId}`);
    
    // Emit progress-specific events
    this.emit(`${DataSyncEvents.PROGRESS_UPDATED}:${syncData.userId}`, syncData);
    
    // Update parent dashboard if user is a student
    if ((syncData.data as Record<string, unknown>).role === 'student') {
      this.emit(DataSyncEvents.PARENT_DASHBOARD_UPDATED, {
        ...syncData,
        studentId: syncData.userId
      });
    }
  }

  private async handleModuleUpdate(syncData: SyncData) {
    // Update module cache
    this.cache.set(`module:${syncData.data.moduleId}`, syncData.data);
    
    // Clear dependent caches
    this.cache.delete('modules:recommended');
    this.cache.delete('learningPaths:all');
    
    // Emit module-specific events
    this.emit(`${DataSyncEvents.MODULE_UPDATED}:${syncData.data.moduleId}`, syncData);
  }

  private async handleAssessmentUpdate(syncData: SyncData) {
    // Update assessment cache
    this.cache.set(`assessment:${syncData.userId}`, syncData.data);
    
    // Clear dependent caches
    this.cache.delete(`dashboard:${syncData.userId}`);
    this.cache.delete('modules:recommended');
    
    // Emit assessment-specific events
    this.emit(`${DataSyncEvents.ASSESSMENT_UPDATED}:${syncData.userId}`, syncData);
  }

  private async handleDashboardUpdate(syncData: SyncData) {
    // Update dashboard cache
    this.cache.set(`dashboard:${syncData.userId}`, syncData.data);
    
    // Emit dashboard-specific events
    this.emit(`${DataSyncEvents.DASHBOARD_UPDATED}:${syncData.userId}`, syncData);
  }

  // Subscribe to data updates
  subscribe(eventType: DataSyncEvents, callback: (data: SyncData) => void, userId?: string) {
    const eventKey = userId ? `${eventType}:${userId}` : eventType;
    this.on(eventKey, callback);
    
    // Return unsubscribe function
    return () => {
      this.off(eventKey, callback);
    };
  }

  // Subscribe to global updates
  subscribeToGlobal(callback: (data: SyncData) => void) {
    this.on(DataSyncEvents.GLOBAL_STATE_UPDATED, callback);
    
    return () => {
      this.off(DataSyncEvents.GLOBAL_STATE_UPDATED, callback);
    };
  }

  // Force refresh data from server
  async refreshData(eventType: DataSyncEvents, userId?: string) {
    const cacheKey = this.generateCacheKey(eventType, userId);
    this.cache.delete(cacheKey);
    
    // Emit refresh event
    this.emit(`${eventType}:refresh`, { eventType, userId });
  }

  // Get sync statistics
  getStats() {
    return {
      cacheSize: this.cache.getKeys('').length,
      pendingUpdates: this.pendingUpdates.size,
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Create singleton instance
const dataSync = new DataSynchronizer();

// Export the singleton and types
export default dataSync;
export { DataSynchronizer, DataCache }; 