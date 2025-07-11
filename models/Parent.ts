import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    maxlength: 50
  },
  relationshipToStudent: {
    type: String,
    required: true,
    enum: ['Father', 'Mother', 'Guardian', 'Other']
  },
  contactNumber: {
    type: String,
    required: true,
    maxlength: 10
  },
  alternateContactNumber: {
    type: String,
    maxlength: 10
  },
  email: {
    type: String,
    maxlength: 100
  },
  occupation: {
    type: String,
    required: true,
    maxlength: 100
  },
  educationLevel: {
    type: String,
    required: true,
    enum: [
      'Primary School', 'Secondary School', 'High School', 'Diploma', 
      'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other'
    ]
  },
  preferredLanguage: {
    type: String,
    required: true,
    maxlength: 10
  },
  address: {
    line1: {
      type: String,
      required: true,
      maxlength: 100
    },
    line2: {
      type: String,
      maxlength: 100
    },
    cityVillage: {
      type: String,
      required: true,
      maxlength: 50
    },
    state: {
      type: String,
      required: true,
      maxlength: 50
    },
    pinCode: {
      type: String,
      required: true,
      maxlength: 6
    }
  },
  linkedStudentId: {
    type: String,
    required: true
  },
  studentUniqueId: {
    type: String,
    required: true,
    maxlength: 50
  },
  consentToAccessChildData: {
    type: Boolean,
    required: true,
    default: false
  },
  agreeToTerms: {
    type: Boolean,
    required: true,
    default: false
  },
  onboardingCompleted: {
    type: Boolean,
    required: true,
    default: false
  },
  onboardingCompletedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
parentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Parent || mongoose.model('Parent', parentSchema); 