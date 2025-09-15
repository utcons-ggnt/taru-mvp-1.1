# Data Persistence Guide

This guide explains how to use the comprehensive data persistence system that preserves all data, content, and results during navigation and page reloads.

## Overview

The data persistence system provides multiple layers of data preservation:

1. **Automatic State Preservation** - Saves and restores page state automatically
2. **Form Data Persistence** - Preserves form inputs across navigation
3. **Scroll Position Memory** - Remembers scroll position on each page
4. **Offline Support** - Falls back to localStorage when offline
5. **Data Recovery UI** - Shows recovery options when data is available
6. **Auto-save** - Periodically saves data without user intervention

## Quick Start

### Basic Usage with useDataPersistence Hook

```tsx
import { useDataPersistence } from '@/lib/hooks/useDataPersistence';

function MyComponent() {
  const {
    data,
    updateData,
    save,
    load,
    clear,
    isLoading,
    isSaving,
    lastSaved,
    error
  } = useDataPersistence('my-page', { 
    formData: {},
    userInput: '',
    progress: 0 
  });

  const handleInputChange = (value: string) => {
    updateData({ ...data, userInput: value });
  };

  const handleSave = () => {
    save(true); // Immediate save
  };

  return (
    <div>
      <input 
        value={data.userInput} 
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="This will be preserved on navigation"
      />
      
      {isSaving && <span>Saving...</span>}
      {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
      
      <button onClick={handleSave}>Save Now</button>
    </div>
  );
}
```

### Form Persistence

```tsx
import { useDataPersistence } from '@/lib/hooks/useDataPersistence';

function ContactForm() {
  const { data, updateData } = useDataPersistence('contact-form', {
    name: '',
    email: '',
    message: '',
    preferences: {}
  }, {
    preserveForm: true, // Automatically saves form data
    autoRestore: true,  // Restores form on page load
    debounceMs: 1000   // Saves 1 second after user stops typing
  });

  return (
    <form>
      <input
        name="name"
        value={data.name}
        onChange={(e) => updateData({ ...data, name: e.target.value })}
        placeholder="Name (auto-saved)"
      />
      
      <input
        name="email"
        type="email"
        value={data.email}
        onChange={(e) => updateData({ ...data, email: e.target.value })}
        placeholder="Email (auto-saved)"
      />
      
      <textarea
        name="message"
        value={data.message}
        onChange={(e) => updateData({ ...data, message: e.target.value })}
        placeholder="Message (auto-saved)"
      />
    </form>
  );
}
```

### Navigation with State Preservation

```tsx
import { useNavigationWithState } from '@/lib/hooks/useNavigationWithState';

function NavigationExample() {
  const { navigateWithState, loadPageState } = useNavigationWithState();

  const handleNavigate = async (path: string) => {
    // Current page data will be automatically saved
    await navigateWithState(path, {
      currentFormData: extractCurrentFormData(),
      userProgress: getCurrentProgress(),
      timestamp: Date.now()
    }, {
      preserveState: true,
      preserveScroll: true,
      preserveFormState: true
    });
  };

  const handleLoadPreviousState = async () => {
    const previousState = await loadPageState('/previous-page');
    if (previousState) {
      // Restore scroll position and form data automatically
      console.log('Previous state restored:', previousState);
    }
  };

  return (
    <div>
      <button onClick={() => handleNavigate('/next-page')}>
        Go to Next Page (with state preservation)
      </button>
      
      <button onClick={handleLoadPreviousState}>
        Load Previous State
      </button>
    </div>
  );
}
```

## Advanced Usage

### Custom Persistence Manager

```tsx
import { PersistenceManager } from '@/lib/utils/persistenceUtils';

// Create a custom persistence manager
const customManager = PersistenceManager.getInstance('custom-data', {
  autoSave: true,
  autoSaveInterval: 5000, // Save every 5 seconds
  fallbackToLocalStorage: true,
  onSave: (data) => console.log('Data saved:', data),
  onLoad: (data) => console.log('Data loaded:', data),
  onError: (error) => console.error('Persistence error:', error)
});

// Use the manager
const saveData = async (data: any) => {
  await customManager.save(data);
};

const loadData = async () => {
  return await customManager.load();
};
```

### Form-Specific Persistence

```tsx
import { createFormPersistence } from '@/lib/utils/persistenceUtils';

function AdvancedForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { manager, extractFormData, restoreFormData } = createFormPersistence('advanced-form', {
    autoSave: true,
    autoSaveInterval: 2000
  });

  useEffect(() => {
    // Auto-save form data every 2 seconds
    manager.startAutoSave();
    
    // Load and restore form data on mount
    manager.load().then((data) => {
      if (data && formRef.current) {
        restoreFormData(formRef.current, data);
      }
    });

    return () => manager.stopAutoSave();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formRef.current) {
      const formData = extractFormData(formRef.current);
      await manager.save(formData);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleFormSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Scroll Position Persistence

```tsx
import { createScrollPersistence } from '@/lib/utils/persistenceUtils';

function ScrollablePage() {
  const { saveScrollPosition, restoreScrollPosition } = createScrollPersistence('scrollable-page');

  useEffect(() => {
    // Restore scroll position on mount
    restoreScrollPosition();
    
    // Save scroll position on unmount
    return () => {
      saveScrollPosition();
    };
  }, []);

  return (
    <div style={{ height: '2000px' }}>
      {/* Long content */}
    </div>
  );
}
```

## Configuration Options

### useDataPersistence Options

```tsx
const options: DataPersistenceOptions = {
  // Basic options
  key: 'unique-page-key',           // Unique identifier for this data
  autoRestore: true,                // Automatically restore data on mount
  preserveScroll: true,             // Save/restore scroll position
  preserveForm: true,               // Auto-save form data
  
  // Timing options
  debounceMs: 1000,                 // Debounce save operations
  
  // Persistence options
  autoSave: true,                   // Enable automatic saving
  autoSaveInterval: 30000,          // Auto-save interval (ms)
  fallbackToLocalStorage: true,     // Use localStorage as fallback
  
  // Callbacks
  onSave: (data) => console.log('Saved:', data),
  onLoad: (data) => console.log('Loaded:', data),
  onError: (error) => console.error('Error:', error)
};
```

### Navigation Options

```tsx
const navigationOptions: NavigationOptions = {
  preserveState: true,              // Preserve navigation state
  saveCurrentState: true,           // Save current page data
  preserveScroll: true,             // Preserve scroll position
  preserveFormState: true,          // Preserve form state
  replace: false,                   // Use replace instead of push
  delay: 0                          // Delay before navigation (ms)
};
```

## Data Recovery

The system automatically detects when recoverable data is available and shows a recovery UI. Users can:

- **Recover Data** - Restore all saved form data, scroll position, and page state
- **Start Fresh** - Ignore saved data and start with a clean slate

### Custom Recovery Handler

```tsx
import DataRecoveryUI from '@/app/components/DataRecoveryUI';

function MyPage() {
  const handleDataRecovered = (recoveredData: any) => {
    console.log('Data recovered:', recoveredData);
    // Process recovered data
  };

  const handleRecoveryDismissed = () => {
    console.log('Recovery dismissed');
    // Handle when user chooses to start fresh
  };

  return (
    <div>
      <DataRecoveryUI
        onDataRecovered={handleDataRecovered}
        onRecoveryDismissed={handleRecoveryDismissed}
        showOfflineIndicator={true}
      />
      {/* Your page content */}
    </div>
  );
}
```

## Offline Support

The system automatically handles offline scenarios:

1. **Online Mode** - Data is saved to the server and localStorage
2. **Offline Mode** - Data is saved only to localStorage
3. **Reconnection** - When back online, localStorage data is synced to server

### Offline Indicator

The system shows visual indicators for:
- **Offline Status** - Yellow indicator when offline
- **Saving Status** - Blue indicator when saving changes
- **Last Saved** - Green indicator showing when data was last saved

## Best Practices

### 1. Use Descriptive Keys

```tsx
// Good - descriptive and unique
useDataPersistence('assessment-form-step-1', data)

// Bad - generic and might conflict
useDataPersistence('form', data)
```

### 2. Handle Loading States

```tsx
const { data, isLoading, isSaving } = useDataPersistence('my-page', initialData);

if (isLoading) {
  return <div>Loading saved data...</div>;
}

return (
  <div>
    {isSaving && <span>Saving...</span>}
    {/* Your content */}
  </div>
);
```

### 3. Error Handling

```tsx
const { data, error, updateData } = useDataPersistence('my-page', initialData);

if (error) {
  return (
    <div className="error">
      <p>Error saving data: {error.message}</p>
      <button onClick={() => updateData(data)}>Retry</button>
    </div>
  );
}
```

### 4. Clean Up on Unmount

```tsx
useEffect(() => {
  return () => {
    // The system automatically handles cleanup, but you can add custom cleanup
    save(true); // Force immediate save on unmount
  };
}, []);
```

## Troubleshooting

### Common Issues

1. **Data Not Persisting**
   - Check if the key is unique
   - Verify localStorage is available
   - Check browser console for errors

2. **Form Data Not Restoring**
   - Ensure form elements have `name` attributes
   - Check if `preserveForm` is enabled
   - Verify form structure matches expected format

3. **Scroll Position Not Working**
   - Ensure `preserveScroll` is enabled
   - Check if page has scrollable content
   - Verify timing of scroll restoration

### Debug Mode

Enable debug logging by setting localStorage:

```javascript
localStorage.setItem('debug-persistence', 'true');
```

This will log all persistence operations to the console.

## API Reference

### useDataPersistence Hook

```tsx
const {
  data,           // Current data state
  updateData,     // Update data and trigger save
  save,           // Force immediate save
  load,           // Load data from storage
  clear,          // Clear all data
  isLoading,      // Loading state
  isSaving,       // Saving state
  lastSaved,      // Last save timestamp
  error,          // Error state
  isOnline,       // Online status
  hasUnsavedChanges // Unsaved changes flag
} = useDataPersistence(key, initialData, options);
```

### useNavigationWithState Hook

```tsx
const {
  navigateWithState,    // Navigate with state preservation
  loadPageState,        // Load previous page state
  savePageState,        // Save current page state
  saveScrollPosition,   // Save scroll position
  restoreScrollPosition, // Restore scroll position
  saveFormState,        // Save form state
  restoreFormState,     // Restore form state
  extractFormData,      // Extract form data
  restoreFormData,      // Restore form data
  isLoading            // Loading state
} = useNavigationWithState();
```

This comprehensive data persistence system ensures that users never lose their work, whether they're navigating between pages, refreshing the browser, or experiencing network issues.
