import mongoose from 'mongoose';

export interface IOrganization extends mongoose.Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new mongoose.Schema<IOrganization>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot be more than 100 characters']
  },
  organizationType: {
    type: String,
    required: [true, 'Organization type is required'],
    enum: ['school', 'college', 'university', 'training_center', 'edtech_company', 'ngo', 'government', 'corporate', 'other'],
    default: 'school'
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'India'
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  employeeCount: {
    type: String,
    required: [true, 'Employee count is required'],
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Prevent sensitive fields from being returned in queries
organizationSchema.set('toJSON', {
  transform: function(doc, ret) {
    return ret;
  }
});

export default (mongoose.models && mongoose.models.Organization) || mongoose.model<IOrganization>('Organization', organizationSchema); 