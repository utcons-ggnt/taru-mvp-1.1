import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Generate a unique 8-character alphanumeric ID
      return 'STU' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  fullName: {
    type: String,
    required: true,
    maxlength: 50
  },
  nickname: {
    type: String,
    maxlength: 30
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  age: {
    type: Number,
    min: 1,
    max: 99
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'],
    maxlength: 6
  },
  classGrade: {
    type: String,
    required: true,
    maxlength: 6
  },
  schoolName: {
    type: String,
    required: true,
    maxlength: 100
  },
  schoolId: {
    type: String,
    required: true,
    maxlength: 20
  },
  profilePictureUrl: {
    type: String
  },
  languagePreference: {
    type: String,
    required: true,
    maxlength: 10
  },
  learningModePreference: [{
    type: String,
    maxlength: 100
  }],
  interestsOutsideClass: [{
    type: String,
    maxlength: 100
  }],
  preferredCareerDomains: [{
    type: String,
    maxlength: 100
  }],
  guardian: {
    name: {
      type: String,
      required: true,
      maxlength: 50
    },
    contactNumber: {
      type: String,
      required: true,
      maxlength: 10
    },
    email: {
      type: String,
      maxlength: 100
    }
  },
  location: {
    type: String,
    maxlength: 100
  },
  deviceId: {
    type: String,
    maxlength: 64
  },
  consentForDataUsage: {
    type: Boolean,
    required: true,
    default: false
  },
  termsAndConditionsAccepted: {
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
  preferredSubject: {
    id: {
      type: String
    },
    name: {
      type: String
    },
    selectedAt: {
      type: Date
    }
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
studentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema); 