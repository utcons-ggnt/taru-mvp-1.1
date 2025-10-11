import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  subject: {
    type: String,
    required: true,
    maxlength: 50
  },
  grade: {
    type: String,
    required: true,
    maxlength: 20
  },
  dueDate: {
    type: Date,
    required: true
  },
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  totalPoints: {
    type: Number,
    default: 100,
    min: 0,
    max: 1000
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  submittedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  instructions: {
    type: String,
    maxlength: 2000
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  gradingCriteria: [{
    criterion: String,
    points: Number,
    description: String
  }],
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
assignmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
assignmentSchema.index({ teacherId: 1, createdAt: -1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ dueDate: 1 });

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);

export default Assignment;
