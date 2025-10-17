# 🔐 Taru Registration Flows & User Roles Guide

<div align="center">

![Taru Logo](https://img.shields.io/badge/Taru-Education%20Platform-blue?style=for-the-badge&logo=graduation-cap)
![Registration](https://img.shields.io/badge/Registration-Flows-green?style=for-the-badge&logo=user-plus)
![User Roles](https://img.shields.io/badge/User-Roles-orange?style=for-the-badge&logo=users)

**Complete guide to all registration flows and user roles in the Taru platform**

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [👥 User Roles](#-user-roles)
- [🔄 Registration Flows](#-registration-flows)
  - [🎓 Student Registration](#-student-registration)
  - [👨‍👩‍👧‍👦 Parent Registration](#-parent-registration)
  - [🏢 Organization Registration](#-organization-registration)
  - [👨‍🏫 Teacher Registration](#-teacher-registration)
  - [🔐 Platform Super Admin](#-platform-super-admin)
- [📊 Assessment Flows](#-assessment-flows)
- [🛡️ Security & Permissions](#️-security--permissions)
- [🔧 Technical Implementation](#-technical-implementation)

---

## 🎯 Overview

Taru supports 5 distinct user roles, each with unique registration flows, onboarding processes, and dashboard access. This guide provides comprehensive documentation for all registration flows and role-based permissions.

### Supported User Roles:
1. **Student** - Primary learners using the platform
2. **Parent** - Guardians monitoring student progress
3. **Organization** - Educational institutions and schools
4. **Teacher** - Educators managing students and content
5. **Platform Super Admin** - System administrators with full platform access

---

## 👥 User Roles

### 🎓 Student
**Primary Role**: Individual learners accessing personalized education
- **Registration**: Direct self-registration
- **Onboarding**: 3-step comprehensive profile setup
- **Assessments**: Interest → Diagnostic → Skill assessments
- **Dashboard**: `/dashboard/student`
- **Key Features**: Learning modules, progress tracking, AI chat, badges

### 👨‍👩‍👧‍👦 Parent
**Primary Role**: Guardians monitoring and supporting student learning
- **Registration**: Direct self-registration with student linking
- **Onboarding**: 4-step profile and student connection setup
- **Dashboard**: `/dashboard/parent`
- **Key Features**: Student progress monitoring, reports, teacher communication

### 🏢 Organization
**Primary Role**: Educational institutions managing multiple users
- **Registration**: Direct self-registration
- **Onboarding**: 3-step organization profile setup
- **Approval**: Requires Platform Super Admin approval
- **Dashboard**: `/dashboard/admin` (after approval)
- **Key Features**: User management, analytics, branch management, invitations

### 👨‍🏫 Teacher
**Primary Role**: Educators managing students and delivering content
- **Registration**: Invitation-based registration only
- **Onboarding**: Minimal setup (handled via invitation)
- **Dashboard**: `/dashboard/teacher`
- **Key Features**: Student management, assignment creation, progress tracking

### 🔐 Platform Super Admin
**Primary Role**: System administrators with full platform control
- **Registration**: Pre-created accounts only
- **Login**: Special super admin login page
- **Dashboard**: `/dashboard/platform-super-admin`
- **Key Features**: Organization approval, system analytics, audit logs, user management

---

## 🔄 Registration Flows

## 🎓 Student Registration

### Step 1: Initial Registration
```
URL: /register
Method: POST /api/auth/register
```

**Required Fields:**
- Full Name (string, max 50 chars)
- Email (unique, valid format)
- Password (min 6 characters)
- Role: "student"

**Process:**
1. User navigates to `/register`
2. Selects "Student" role
3. Fills registration form
4. System validates input and checks for existing email
5. Creates user with `requiresOnboarding: true`
6. Generates JWT token with 7-day expiration
7. Sets HTTP-only cookie
8. Redirects to student onboarding

### Step 2: Student Onboarding (3 Steps)

#### Step 2.1: Personal Information
```
URL: /student-onboarding (Step 1)
```

**Fields:**
- Full Name (pre-filled from registration)
- Nickname (string)
- Date of Birth (date)
- Age (auto-calculated)
- Gender (dropdown: Male, Female, Other)
- Class Grade (dropdown: 1-12, College, Other)
- School Name (string)
- School ID (string)
- Guardian Name (string)
- Guardian Contact Number (string)
- Guardian Email (email)

#### Step 2.2: Preferences & Interests
```
URL: /student-onboarding (Step 2)
```

**Fields:**
- Language Preference (dropdown: English, Hindi, Bengali, Telugu, Marathi)
- Learning Mode Preferences (multi-select: Visual, Auditory, Kinesthetic, Reading/Writing)
- Interests Outside Class (multi-select: Sports, Music, Art, Technology, etc.)
- Preferred Career Domains (multi-select: Technology, Medicine, Business, etc.)
- Favorite Subjects (multi-select: Math, Science, English, etc.)
- Preferred Learning Styles (multi-select: Videos, Books, Hands-on, etc.)

#### Step 2.3: Consent & Technical
```
URL: /student-onboarding (Step 3)
```

**Fields:**
- Data Usage Consent (checkbox, required)
- Terms & Conditions (checkbox, required)
- Device ID (auto-generated)
- Location (optional string)

**Submission:**
- API: `POST /api/student/onboarding`
- Creates Student record with `onboardingCompleted: true`
- Generates unique student ID
- Updates JWT token to remove onboarding requirement

### Step 3: Assessment Flow

#### Step 3.1: Interest Assessment
```
URL: /interest-assessment
```

**4-Step Process:**
1. **Broad Interest Clusters**: Select up to 3 from 14 predefined clusters
2. **Cluster Deep Dive**: Detailed questions for selected clusters
3. **Personality Insights**: Learning style and value assessment
4. **Career Direction**: Dream career and aspiration questions

**Clusters Available:**
- Technology/Computers
- Science/Experiments
- Art/Design
- Language/Communication
- Business/Money
- Performing Arts
- Cooking/Nutrition
- Sports/Fitness
- Farming/Gardening
- Social Work
- Mechanics/DIY
- Fashion/Tailoring
- Animal Care
- Other

#### Step 3.2: Diagnostic Assessment
```
URL: /diagnostic-assessment
```

**Features:**
- Dynamic question generation via N8N integration
- Adaptive questioning based on previous answers
- Session management with resume capability
- Progress tracking and result calculation

#### Step 3.3: Skill Assessment (Optional)
```
URL: /skill-assessment
```

**Fields:**
- Language preferences
- Learning environment preferences
- Subject interests
- Confidence assessment
- Career aspirations

### Step 4: Dashboard Access
```
URL: /dashboard/student
```

**Features:**
- Personalized learning modules
- Progress tracking with XP system
- Achievement badges
- AI chat assistant
- Assignment management
- Learning path recommendations

---

## 👨‍👩‍👧‍👦 Parent Registration

### Step 1: Initial Registration
```
URL: /register
Method: POST /api/auth/register
```

**Required Fields:**
- Full Name (string)
- Email (unique, valid format)
- Password (min 6 characters)
- Role: "parent"

**Process:**
1. User navigates to `/register`
2. Selects "Parent" role
3. Fills registration form
4. System creates user with `requiresOnboarding: true`
5. Generates JWT token
6. Redirects to parent onboarding

### Step 2: Parent Onboarding (4 Steps)

#### Step 2.1: Personal Information
```
URL: /parent-onboarding (Step 1)
```

**Fields:**
- Full Name (pre-filled from registration)
- Relationship to Student (dropdown: Father, Mother, Guardian, Other)
- Contact Number (string)
- Alternate Contact Number (optional)
- Email (pre-filled from registration)
- Occupation (string)
- Education Level (dropdown)
- Preferred Language (dropdown)

#### Step 2.2: Address Information
```
URL: /parent-onboarding (Step 2)
```

**Fields:**
- Address Line 1 (string)
- Address Line 2 (optional)
- City/Village (string)
- State (dropdown with Indian states)
- PIN Code (string)

#### Step 2.3: Student Linking
```
URL: /parent-onboarding (Step 3)
```

**Process:**
- Fetches available students from database
- Parent selects student to link
- Student Unique ID auto-populated
- Validates student relationship

#### Step 2.4: Consent & Agreement
```
URL: /parent-onboarding (Step 4)
```

**Fields:**
- Consent to Access Child Data (checkbox, required)
- Agree to Terms and Conditions (checkbox, required)

**Submission:**
- API: `POST /api/parent/onboarding`
- Creates Parent record with linked student
- Updates user profile with student linking
- Generates new JWT token

### Step 3: Dashboard Access
```
URL: /dashboard/parent
```

**Features:**
- Linked student progress monitoring
- Performance reports and analytics
- Teacher communication
- Student achievement tracking
- Learning path visibility

---

## 🏢 Organization Registration

### Step 1: Initial Registration
```
URL: /register
Method: POST /api/auth/register
```

**Required Fields:**
- Full Name (Organization Admin Name)
- Email (unique, valid format)
- Password (min 6 characters)
- Role: "organization"

**Process:**
1. User navigates to `/register`
2. Selects "Organization" role
3. Fills registration form
4. System creates user with `requiresOnboarding: true`
5. Generates JWT token
6. Redirects to organization onboarding

### Step 2: Organization Onboarding (3 Steps)

#### Step 2.1: Organization Details
```
URL: /organization-onboarding (Step 1)
```

**Fields:**
- Organization Name (string)
- Organization Type (dropdown: School, College, University, Training Center, EdTech Company, NGO, Government, Corporate, Other)
- Industry (string)
- Address (string)
- City (string)
- State (string)
- Country (default: India)
- Phone Number (string)
- Website (optional)
- Description (optional)
- Employee Count (dropdown: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+)

#### Step 2.2: Verification & Approval
```
Process: Automatic
```

**System Actions:**
- Creates Organization record with `approvalStatus: 'pending'`
- Sends notification to Platform Super Admin
- Organization admin waits for approval

#### Step 2.3: Dashboard Access (After Approval)
```
URL: /dashboard/admin
```

**Approval Process:**
- Platform Super Admin reviews application
- Approves or rejects via `/api/platform-super-admin/organizations/[id]/approve`
- Email notification sent to organization admin
- Access granted to organization admin dashboard

**Features:**
- Organization settings management
- Teacher and student invitation system
- Branch management
- Organization-wide analytics
- Audit log access
- User management tools

---

## 👨‍🏫 Teacher Registration

### Step 1: Invitation Process
```
Initiator: Organization Admin
API: POST /api/organization/invite-teacher
```

**Invitation Fields:**
- Teacher Name (string)
- Teacher Email (string)
- Subject Specialization (string)
- Experience Years (string)
- Branch Assignment (optional)

**Process:**
1. Organization admin creates teacher invitation
2. System generates unique invitation token
3. Invitation email sent to teacher
4. Teacher receives email with invitation link

### Step 2: Teacher Registration
```
URL: /invite/teacher?token=<invitation_token>
```

**Registration Fields:**
- Name (pre-filled from invitation)
- Password (min 6 characters)
- Confirm Password

**Process:**
1. Teacher clicks invitation link
2. System validates invitation token
3. Teacher fills registration form
4. System creates user with `role: 'teacher'` and `organizationId`
5. Generates JWT token
6. Redirects to teacher dashboard

### Step 3: Dashboard Access
```
URL: /dashboard/teacher
```

**Features:**
- Student management and tracking
- Assignment creation and management
- Progress monitoring and reports
- Bulk student import functionality
- Student credential export
- Class analytics and insights

---

## 🔐 Platform Super Admin

### Pre-Created Accounts
```
Login URL: /super-admin-login
```

**Available Accounts:**

**Account 1:**
- Name: Platform Super Admin
- Email: `superadmin@taru.com`
- Password: `SuperAdmin@2024!`
- Role: `platform_super_admin`

**Account 2:**
- Name: System Administrator
- Email: `sysadmin@taru.com`
- Password: `SysAdmin@2024!`
- Role: `platform_super_admin`

**Account 3:**
- Name: Platform Owner
- Email: `owner@taru.com`
- Password: `Owner@2024!`
- Role: `platform_super_admin`

### Login Process
```
URL: /super-admin-login
Method: POST /api/auth/login
```

**Process:**
1. Navigate to super admin login page
2. Enter super admin credentials
3. System verifies `role: 'platform_super_admin'`
4. Generates JWT token with full permissions
5. Redirects to platform super admin dashboard

### Dashboard Access
```
URL: /dashboard/platform-super-admin
```

**Features:**
- Organization approval/rejection system
- System-wide analytics and monitoring
- Audit log management
- Platform settings configuration
- User management across all organizations
- Security monitoring and alerts

---

## 📊 Assessment Flows

### Interest Assessment Flow
```
URL: /interest-assessment
API: POST /api/assessment/interest
```

**Step 1: Broad Interest Clusters**
- Select up to 3 from 14 predefined clusters
- Each cluster has specific deep-dive questions

**Step 2: Cluster Deep Dive**
- Technology/Computers: Coding experience, building goals
- Science/Experiments: Project experience, invention ideas
- Art/Design: Creative expression, artistic preferences
- And 11 more specialized clusters...

**Step 3: Personality Insights**
- Learning style preferences
- Challenge approach assessment
- Core values evaluation

**Step 4: Career Direction**
- Dream career identification
- Career type preferences
- Future aspiration mapping

### Diagnostic Assessment Flow
```
URL: /diagnostic-assessment
API: POST /api/assessment/diagnostic
```

**Features:**
- Dynamic question generation via N8N integration
- Adaptive questioning based on previous responses
- Session management with resume capability
- Real-time progress tracking
- Comprehensive result calculation

### Skill Assessment Flow
```
URL: /skill-assessment
API: POST /api/assessment/skill
```

**Assessment Areas:**
- Learning preferences and styles
- Subject interests and strengths
- Confidence levels in various skills
- Career aspirations and goals
- Environmental preferences

---

## 🛡️ Security & Permissions

### Authentication System
- **JWT Tokens**: 7-day expiration with refresh capability
- **HTTP-only Cookies**: Secure token storage
- **Role-based Access**: Granular permissions per role
- **Middleware Protection**: Route-level security

### Permission Matrix

| Feature | Student | Parent | Teacher | Organization | Super Admin |
|---------|---------|--------|---------|--------------|-------------|
| **Registration** | ✅ Self | ✅ Self | ❌ Invite Only | ✅ Self | ❌ Pre-created |
| **Onboarding** | ✅ Required | ✅ Required | ❌ Minimal | ✅ Required | ❌ None |
| **Assessment** | ✅ Full Access | ❌ View Only | ❌ View Only | ❌ View Only | ❌ View Only |
| **Dashboard** | ✅ Student | ✅ Parent | ✅ Teacher | ✅ Admin | ✅ Super Admin |
| **User Management** | ❌ None | ❌ None | ✅ Students | ✅ Teachers/Students | ✅ All Users |
| **Organization** | ❌ None | ❌ None | ❌ None | ✅ Own Org | ✅ All Orgs |
| **System Settings** | ❌ None | ❌ None | ❌ None | ❌ None | ✅ Full Access |

### Security Features
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Token validation
- **Rate Limiting**: API endpoint protection

---

## 🔧 Technical Implementation

### API Endpoints

#### Authentication
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/me          # Get current user
```

#### Student Management
```
POST /api/student/onboarding           # Student onboarding
GET  /api/student/[uniqueId]          # Get student profile
POST /api/student/update-profile      # Update student profile
```

#### Parent Management
```
POST /api/parent/onboarding           # Parent onboarding
GET  /api/parent/profile             # Get parent profile
POST /api/parent/link-student        # Link student to parent
```

#### Organization Management
```
POST /api/organization/onboarding     # Organization onboarding
GET  /api/organization/profile       # Get organization profile
POST /api/organization/invite-teacher # Invite teacher
POST /api/organization/invite-parent  # Invite parent
```

#### Teacher Management
```
POST /api/teacher/students            # Create student
POST /api/teacher/students/bulk-import # Bulk import students
GET  /api/teacher/students           # Get teacher's students
```

#### Assessment Management
```
POST /api/assessment/interest         # Submit interest assessment
POST /api/assessment/diagnostic       # Submit diagnostic assessment
POST /api/assessment/skill           # Submit skill assessment
```

#### Platform Super Admin
```
GET  /api/platform-super-admin/organizations     # List organizations
POST /api/platform-super-admin/organizations/[id]/approve  # Approve org
POST /api/platform-super-admin/organizations/[id]/reject   # Reject org
GET  /api/platform-super-admin/audit-logs       # Get audit logs
```

### Database Models

#### User Model
```typescript
interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed
  role: 'student' | 'teacher' | 'parent' | 'organization' | 'admin' | 'platform_super_admin';
  profile: Record<string, any>;
  avatar?: string;
  firstTimeLogin: boolean;
  organizationId?: string;
  isIndependent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Student Model
```typescript
interface IStudent {
  userId: string;
  organizationId?: string;
  teacherId?: string;
  fullName: string;
  uniqueId: string;
  classGrade: string;
  schoolName: string;
  onboardingCompleted: boolean;
  interestAssessmentCompleted: boolean;
  diagnosticAssessmentCompleted: boolean;
  totalModulesCompleted: number;
  totalXpEarned: number;
  learningStreak: number;
  badgesEarned: number;
  // ... additional fields
}
```

#### Organization Model
```typescript
interface IOrganization {
  userId: string;
  organizationName: string;
  organizationType: string;
  industry: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phoneNumber: string;
  website?: string;
  description?: string;
  employeeCount: string;
  onboardingCompleted: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  // ... additional fields
}
```

### Middleware Protection
```typescript
// Route protection middleware
export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.cookies['auth-token'];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

---

## 🚀 Getting Started

### Quick Setup
1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/taru.git
   cd taru
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure MongoDB URI and JWT secret
   ```

3. **Database Seeding**
   ```bash
   npm run seed-modules
   npm run seed-users
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Demo Accounts
- **Student**: `student1@demo.com` / `demopass`
- **Parent**: `parent1@demo.com` / `demopass`
- **Teacher**: `teacher1@demo.com` / `demopass`
- **Organization**: `org1@demo.com` / `demopass`
- **Super Admin**: `superadmin@taru.com` / `SuperAdmin@2024!`

---

## 📞 Support

For questions about registration flows or user roles:
- **Email**: support@taru.com
- **Documentation**: [Full API Docs](#)
- **Issues**: [GitHub Issues](https://github.com/your-org/taru/issues)

---

<div align="center">

**Made with ❤️ by the Taru Team**

*Empowering education through personalized learning experiences*

</div>
