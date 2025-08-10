# Auto-Fill Form Data Feature

This feature automatically fills in form fields with data from previous steps in the user registration and onboarding process.

## How It Works

### 1. Data Storage
- Registration data is stored in `localStorage` when users complete the registration form
- Data includes: name, email, guardian name, class grade, language, location, and role
- Data is timestamped and valid for 1 hour

### 2. Auto-Filling Process
- When users reach onboarding pages, the system:
  1. Fetches user data from the API (`/api/auth/me`)
  2. Retrieves stored registration data from `localStorage`
  3. Pre-fills form fields with available data
  4. Shows visual indicators for auto-filled fields

### 3. Data Cleanup
- Registration data is automatically cleared after successful onboarding
- Prevents stale data from being used in future sessions

## Implementation Details

### Utility Functions (`lib/utils.ts`)
```typescript
RegistrationDataManager = {
  storeRegistrationData(data)     // Store registration data
  getRegistrationData()           // Retrieve stored data
  clearRegistrationData()         // Clear stored data
  isRegistrationDataValid()       // Check if data is recent
}
```

### Registration Page (`app/register/page.tsx`)
- Stores form data when user submits registration
- Data is stored before API call to ensure it's available for onboarding

### Onboarding Pages
- **Student Onboarding** (`app/student-onboarding/page.tsx`)
  - Auto-fills: fullName, classGrade, languagePreference, location, guardianName, guardianEmail
  - Shows green visual indicators for auto-filled fields

- **Parent Onboarding** (`app/parent-onboarding/page.tsx`)
  - Auto-fills: fullName, email, preferredLanguage, linkedStudentId
  - Links to student using provided student ID

- **Organization Onboarding** (`app/organization-onboarding/page.tsx`)
  - Auto-fills: organizationName, organizationType, industry, city
  - Sets sensible defaults for required fields

## Visual Indicators

Auto-filled fields show:
- Green border and background
- "Auto-filled from registration" badge
- Disabled state to prevent editing

## Data Flow

```
Registration Form → localStorage → Onboarding Forms → Database → Cleanup
```

## Benefits

1. **Improved UX**: Users don't need to re-enter information
2. **Reduced Errors**: Less manual data entry means fewer typos
3. **Faster Onboarding**: Streamlined process for better completion rates
4. **Data Consistency**: Ensures data matches between registration and onboarding

## Security & Privacy

- Data is stored locally in browser (not on server)
- Automatically expires after 1 hour
- Cleared after successful onboarding
- Only contains non-sensitive registration data

## Testing

To test the auto-fill functionality:

1. Register a new user with complete information
2. Complete the registration process
3. Navigate to the appropriate onboarding page
4. Verify that fields are pre-filled with green indicators
5. Complete onboarding and verify data is cleared

## Troubleshooting

If auto-filling isn't working:

1. Check browser console for errors
2. Verify `localStorage` contains registration data
3. Check if data has expired (older than 1 hour)
4. Ensure user is properly authenticated
5. Check network requests to `/api/auth/me`
