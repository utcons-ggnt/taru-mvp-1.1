# Data Synchronization System Guide

## Overview

The Taru2 educational platform implements a comprehensive data synchronization system that ensures all data is consistently updated across all components and displays throughout the application. This system prevents data loss and maintains real-time consistency without losing any existing content.

## Architecture

### Core Components

1. **DataSynchronizer** (`lib/dataSync.ts`)
   - Main synchronization engine
   - Event-driven architecture
   - Caching system with TTL
   - Debounced updates to prevent excessive API calls

2. **DataSyncProvider** (`lib/DataSyncProvider.tsx`)
   - React context provider
   - Global state management
   - Connection status monitoring
   - Automatic data refresh

3. **API Data Sync** (`lib/apiDataSync.ts`)
   - Server-side synchronization utility
   - API route integration
   - Batch updates support

4. **React Hooks** (`lib/useDataSync.ts`)
   - `useDataSync` - Basic data synchronization
   - `useAutoDataSync` - Automatic API integration
   - `useRealtimeDataSync` - Real-time updates
   - `useOptimisticDataSync` - Optimistic updates with rollback
   - `useMultiDataSync` - Multiple data subscriptions
   - `useGlobalDataSync` - Global state monitoring

## Data Sync Events

The system uses predefined event types to categorize different types of data updates:

```typescript
enum DataSyncEvents {
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
```

## Usage Examples

### 1. Basic Data Synchronization

```typescript
import { useDataSync } from '@/lib/useDataSync';
import { DataSyncEvents } from '@/lib/dataSync';

function MyComponent() {
  const { data, setData, isLoading, error, refreshData } = useDataSync(
    DataSyncEvents.PROGRESS_UPDATED,
    userId
  );

  const handleUpdate = (newData) => {
    setData(newData, 'component');
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && <div>{/* Display data */}</div>}
      <button onClick={refreshData}>Refresh</button>
    </div>
  );
}
```

### 2. Automatic API Integration

```typescript
import { useAutoDataSync } from '@/lib/DataSyncProvider';
import { DataSyncEvents } from '@/lib/dataSync';

function DashboardComponent() {
  const { data, isLoading, error, refetch } = useAutoDataSync(
    DataSyncEvents.DASHBOARD_UPDATED,
    async () => {
      const response = await fetch('/api/dashboard/student/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    userId,
    [userId] // Dependencies
  );

  return (
    <div>
      {isLoading && <div>Loading dashboard...</div>}
      {error && <div>Error: {error}</div>}
      {data && <DashboardContent data={data} />}
    </div>
  );
}
```

### 3. Real-time Updates

```typescript
import { useRealtimeDataSync } from '@/lib/DataSyncProvider';
import { DataSyncEvents } from '@/lib/dataSync';

function LiveProgressComponent() {
  const { data, isLoading } = useRealtimeDataSync(
    DataSyncEvents.PROGRESS_UPDATED,
    userId,
    30000 // 30 seconds polling interval
  );

  return (
    <div>
      {isLoading && <div>Updating...</div>}
      {data && <ProgressDisplay data={data} />}
    </div>
  );
}
```

### 4. Optimistic Updates

```typescript
import { useOptimisticDataSync } from '@/lib/DataSyncProvider';
import { DataSyncEvents } from '@/lib/dataSync';

function ModuleProgressComponent() {
  const { data, isUpdating, optimisticUpdate } = useOptimisticDataSync(
    DataSyncEvents.PROGRESS_UPDATED,
    userId
  );

  const handleCompleteModule = async () => {
    const optimisticData = { ...data, completed: true };
    
    await optimisticUpdate(
      optimisticData,
      async () => {
        // API call to update progress
        await fetch('/api/modules/123/progress', {
          method: 'POST',
          body: JSON.stringify({ completed: true })
        });
      }
    );
  };

  return (
    <div>
      {isUpdating && <div>Updating...</div>}
      <button onClick={handleCompleteModule}>Complete Module</button>
    </div>
  );
}
```

### 5. Multiple Data Subscriptions

```typescript
import { useMultiDataSync } from '@/lib/useDataSync';
import { DataSyncEvents } from '@/lib/dataSync';

function ComprehensiveDashboard() {
  const { data, loading, errors, updateData, refreshData } = useMultiDataSync(
    {
      user: DataSyncEvents.USER_UPDATED,
      progress: DataSyncEvents.PROGRESS_UPDATED,
      dashboard: DataSyncEvents.DASHBOARD_UPDATED,
      assessment: DataSyncEvents.ASSESSMENT_UPDATED
    },
    userId
  );

  return (
    <div>
      {loading.user && <div>Loading user data...</div>}
      {errors.progress && <div>Progress error: {errors.progress}</div>}
      {data.user && <UserInfo user={data.user} />}
      {data.progress && <ProgressInfo progress={data.progress} />}
    </div>
  );
}
```

## API Integration

### Server-side Data Sync

```typescript
import { syncMultipleDataInAPI } from '@/lib/apiDataSync';
import { DataSyncEvents } from '@/lib/dataSync';

export async function POST(request: NextRequest) {
  // ... API logic ...

  // Sync data across the application
  await syncMultipleDataInAPI([
    {
      eventType: DataSyncEvents.PROGRESS_UPDATED,
      data: progressData,
      userId: decoded.userId,
      source: 'api'
    },
    {
      eventType: DataSyncEvents.DASHBOARD_UPDATED,
      data: dashboardData,
      userId: decoded.userId,
      source: 'api'
    }
  ]);

  return NextResponse.json({ success: true });
}
```

### Single Update

```typescript
import { syncDataInAPI } from '@/lib/apiDataSync';
import { DataSyncEvents } from '@/lib/dataSync';

export async function PUT(request: NextRequest) {
  // ... API logic ...

  await syncDataInAPI(
    DataSyncEvents.USER_UPDATED,
    userData,
    userId,
    'api'
  );

  return NextResponse.json({ success: true });
}
```

## Caching Strategy

The system implements a sophisticated caching strategy:

- **TTL-based caching**: Data is cached for 5 minutes by default
- **Automatic invalidation**: Related caches are cleared when dependent data changes
- **Smart updates**: Only affected components are notified of changes
- **Offline support**: Cached data is available when offline

## Error Handling

The system includes comprehensive error handling:

```typescript
// Error states in hooks
const { data, isLoading, error, refreshData } = useDataSync(...);

// Error boundaries
if (error) {
  return <ErrorComponent error={error} onRetry={refreshData} />;
}

// API error handling
try {
  await syncDataInAPI(...);
} catch (error) {
  console.error('Data sync error:', error);
  // Handle gracefully
}
```

## Performance Optimizations

1. **Debounced Updates**: Prevents excessive API calls
2. **Selective Updates**: Only updates affected components
3. **Caching**: Reduces redundant API calls
4. **Batch Updates**: Groups multiple updates together
5. **Connection Monitoring**: Handles offline/online states

## Best Practices

### 1. Use Appropriate Hooks

- Use `useAutoDataSync` for API data that needs automatic fetching
- Use `useRealtimeDataSync` for data that needs frequent updates
- Use `useOptimisticDataSync` for user interactions that need immediate feedback
- Use `useMultiDataSync` for components that need multiple data sources

### 2. Handle Loading States

```typescript
const { data, isLoading, error } = useAutoDataSync(...);

if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage error={error} />;
}

return <DataDisplay data={data} />;
```

### 3. Update Data Correctly

```typescript
// Good: Update through the sync system
const { setData } = useDataSync(...);
setData(newData, 'component');

// Bad: Direct state manipulation
setLocalData(newData); // This won't sync across components
```

### 4. Use Appropriate Event Types

```typescript
// User-specific data
DataSyncEvents.USER_UPDATED

// Progress data
DataSyncEvents.PROGRESS_UPDATED

// Module data
DataSyncEvents.MODULE_UPDATED

// Dashboard data
DataSyncEvents.DASHBOARD_UPDATED
```

### 5. Handle Dependencies

```typescript
// Include all dependencies that should trigger a refresh
const { data } = useAutoDataSync(
  DataSyncEvents.DASHBOARD_UPDATED,
  fetchFunction,
  userId,
  [userId, someOtherDependency]
);
```

## Monitoring and Debugging

### Sync Statistics

```typescript
import { useDataSyncContext } from '@/lib/DataSyncProvider';

function DebugComponent() {
  const { getStats } = useDataSyncContext();
  const stats = getStats();

  return (
    <div>
      <p>Cache Size: {stats.cacheSize}</p>
      <p>Pending Updates: {stats.pendingUpdates}</p>
      <p>Queue Length: {stats.queueLength}</p>
      <p>Is Processing: {stats.isProcessing}</p>
    </div>
  );
}
```

### Global Updates Monitoring

```typescript
import { useGlobalDataSync } from '@/lib/useDataSync';

function GlobalMonitor() {
  const { globalUpdates, clearUpdates } = useGlobalDataSync();

  return (
    <div>
      <h3>Recent Updates ({globalUpdates.length})</h3>
      {globalUpdates.map((update, index) => (
        <div key={index}>
          {update.type} - {update.source} - {new Date(update.timestamp).toLocaleTimeString()}
        </div>
      ))}
      <button onClick={clearUpdates}>Clear</button>
    </div>
  );
}
```

## Migration Guide

### From Manual State Management

**Before:**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/data');
    const result = await response.json();
    setData(result);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
const { data, isLoading, error, refetch } = useAutoDataSync(
  DataSyncEvents.MY_DATA_UPDATED,
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  },
  userId,
  []
);
```

### From Context Providers

**Before:**
```typescript
const DataContext = createContext();

function DataProvider({ children }) {
  const [data, setData] = useState(null);
  
  const updateData = (newData) => {
    setData(newData);
  };

  return (
    <DataContext.Provider value={{ data, updateData }}>
      {children}
    </DataContext.Provider>
  );
}
```

**After:**
```typescript
import { DataSyncProvider } from '@/lib/DataSyncProvider';

function App() {
  return (
    <DataSyncProvider>
      {children}
    </DataSyncProvider>
  );
}
```

## Troubleshooting

### Common Issues

1. **Data not updating across components**
   - Ensure you're using the sync system instead of local state
   - Check that the correct event type is being used
   - Verify that the userId is consistent

2. **Excessive API calls**
   - Use debounced updates
   - Implement proper caching
   - Use appropriate polling intervals

3. **Memory leaks**
   - Always unsubscribe from data sync events
   - Clean up intervals and timeouts
   - Use React's cleanup functions

4. **Offline issues**
   - Check connection status
   - Implement offline caching
   - Handle reconnection gracefully

### Debug Commands

```typescript
// Check sync statistics
console.log(dataSync.getStats());

// Clear all cache
dataSync.clearAllCache();

// Force refresh specific data
await dataSync.refreshData(DataSyncEvents.PROGRESS_UPDATED, userId);
```

## Conclusion

The data synchronization system ensures that all data in the Taru2 platform remains consistent across all components and displays. By following this guide and using the provided hooks and utilities, developers can build robust, real-time applications that maintain data integrity without losing any existing content.

For additional support or questions, refer to the code examples in the `lib/` directory or consult the API documentation. 