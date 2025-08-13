# Student Key System Documentation

## Overview
The student key system ensures that every student has a unique, consistent identifier (`uniqueId`) that is used across the entire application. This document outlines how student keys are generated, validated, and used throughout the system.

## Key Format
- **Prefix**: Always starts with "STU"
- **Length**: Minimum 8 characters, typically 12 characters
- **Characters**: Alphanumeric only (A-Z, 0-9)
- **Example**: `STU1A2B3C4D5E`

## Centralized Generation
All student keys are generated using the centralized `StudentKeyGenerator` utility located at `lib/studentKeyGenerator.ts`.

### Methods Available

#### 1. `StudentKeyGenerator.generate(options?)`
Generates a unique student ID with timestamp and random components.
```typescript
import { StudentKeyGenerator } from '@/lib/studentKeyGenerator';

const uniqueId = StudentKeyGenerator.generate();
// Options: { prefix?: string, length?: number, useTimestamp?: boolean }
```

#### 2. `StudentKeyGenerator.generateDeterministic(userId, fullName)`
Generates a deterministic ID based on user data (useful for testing).
```typescript
const uniqueId = StudentKeyGenerator.generateDeterministic('userId123', 'John Doe');
```

#### 3. `StudentKeyGenerator.validate(key)`
Validates if a key follows the correct format.
```typescript
const isValid = StudentKeyGenerator.validate('STU1A2B3C4D5E');
```

#### 4. `StudentKeyGenerator.parse(key)`
Extracts information from a student key.
```typescript
const info = StudentKeyGenerator.parse('STU1A2B3C4D5E');
// Returns: { prefix: 'STU', timestamp: 1234567890, randomPart: '1A2B3C4D5E', isValid: true }
```

## Where Student Keys Are Used

### 1. Student Model (`models/Student.ts`)
- Default generation in the schema
- Used as the primary identifier for students

### 2. Student Onboarding (`app/student-onboarding/page.tsx`)
- Generated when a student completes onboarding
- Sent to the API for storage

### 3. API Routes
- **Student Onboarding**: Stores the generated uniqueId
- **Assessment**: Links assessment data to students
- **Progress Tracking**: Tracks student progress
- **Parent Linking**: Links parents to students

### 4. Database Collections
- `students`: Primary student records
- `studentProgress`: Progress tracking
- `assessmentResponses`: Assessment data
- `users`: User accounts (linked via userId)

## Consistency Rules

### 1. **Single Source of Truth**
- Student keys are generated only once during onboarding
- Never modify an existing student key
- Use the same key across all collections

### 2. **Cross-Collection References**
- `Student.uniqueId` → `AssessmentResponse.uniqueId`
- `Student.uniqueId` → `User.profile.linkedStudentUniqueId` (for parents)
- `Student.userId` → `StudentProgress.userId`

### 3. **Validation**
- All keys must start with "STU"
- All keys must be at least 8 characters long
- All keys must contain only alphanumeric characters
- Keys must be unique across the entire system

## Testing and Validation

### Running Validation
```bash
npm run validate-keys
```

This script checks:
- Key format validity
- Uniqueness across the system
- Consistency across collections
- Parent linking integrity

### Seed Scripts
When seeding demo data:
1. Use `StudentKeyGenerator.generateDeterministic()` for consistent demo IDs
2. Ensure the same uniqueId is used across all related records
3. Update parent linking to use the generated uniqueId

## Migration Notes

### Existing Data
If you have existing student data with inconsistent keys:
1. Run the validation script to identify issues
2. Use the cleanup-and-reseed script to regenerate consistent keys
3. Ensure all related collections are updated

### New Development
When adding new features that reference students:
1. Always use the `uniqueId` field from the Student model
2. Validate keys using `StudentKeyGenerator.validate()`
3. Test cross-collection consistency

## Common Issues and Solutions

### Issue: Duplicate Keys
**Cause**: Multiple generation methods or manual entry
**Solution**: Use only the centralized generator

### Issue: Mismatched References
**Cause**: Inconsistent linking between collections
**Solution**: Ensure `uniqueId` is used consistently

### Issue: Invalid Format
**Cause**: Keys not following the STU prefix pattern
**Solution**: Regenerate using the centralized generator

## Best Practices

1. **Never hardcode student keys** in development
2. **Always validate keys** before processing
3. **Use the centralized generator** for all new keys
4. **Test cross-collection consistency** regularly
5. **Document any key-related changes** in this document

## Support
For questions or issues with the student key system:
1. Check this documentation
2. Run the validation script
3. Review the centralized generator code
4. Contact the development team
