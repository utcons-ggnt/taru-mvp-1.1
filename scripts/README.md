# Database Management Scripts

This directory contains scripts for managing the database, including cleanup and seeding operations.

## Scripts

### 1. cleanup-and-reseed.js
**Purpose**: Completely cleans the database and reseeds it with fresh demo data.

**What it does**:
- Deletes ALL user data, responses, assessments, progress records, and related data
- Creates fresh demo users (students, parents, teachers, organizations, admin)
- Seeds educational modules with content
- Provides a clean slate for testing and development

**Usage**:
```bash
npm run cleanup-reseed
```

**Demo Account Credentials**:
- **System Admin**: admin@system.com / admin123
- **Students**: 
  - student1@demo.com / demopass
  - student2@demo.com / demopass  
  - student3@demo.com / demopass
- **Parents**:
  - parent1@demo.com / demopass
  - parent2@demo.com / demopass
- **Teachers**:
  - teacher1@demo.com / demopass
  - teacher2@demo.com / demopass
  - teacher3@demo.com / demopass

### 2. seed-demo-users.js
**Purpose**: Seeds only demo users without cleaning existing data.

**Usage**:
```bash
npm run seed-users
```

### 3. seed-modules.js
**Purpose**: Seeds educational modules with content.

**Usage**:
```bash
npm run seed-modules
```

## API Endpoints

### POST /api/admin/cleanup-and-reseed
**Purpose**: Admin-only endpoint to trigger cleanup and reseed via API.

**Requirements**:
- Must be logged in as admin
- Only available in development environment
- Requires valid auth token

**Usage**:
```javascript
// Example API call
const response = await fetch('/api/admin/cleanup-and-reseed', {
  method: 'POST',
  credentials: 'include'
});
```

## Safety Features

1. **Environment Check**: Cleanup and reseed operations are only available in development environment
2. **Admin Only**: API endpoints require admin privileges
3. **Comprehensive Logging**: All operations are logged for audit purposes
4. **Error Handling**: Robust error handling with detailed error messages

## Data Structure

The cleanup script removes data in the following order to respect foreign key constraints:

1. Assessment Responses
2. Assessments  
3. Student Progress
4. Learning Paths
5. Students
6. Parents
7. Teachers
8. Organizations
9. Users
10. Modules

## Notes

- This script is **destructive** and will permanently delete all data
- Always backup important data before running cleanup operations
- The script creates a system admin user to ensure you can still access the system
- All demo data is clearly marked and can be easily identified
