import mongoose from 'mongoose';

export interface IAuditLog extends mongoose.Document {
  _id: string;
  userId: string;
  userRole: string;
  organizationId?: string;
  branchId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: {
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'pending';
  createdAt: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  userRole: {
    type: String,
    required: [true, 'User role is required'],
    enum: ['student', 'teacher', 'parent', 'organization', 'admin', 'platform_super_admin']
  },
  organizationId: {
    type: String,
    ref: 'Organization'
  },
  branchId: {
    type: String,
    ref: 'Branch'
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true
  },
  resourceId: {
    type: String
  },
  details: {
    oldValues: { type: mongoose.Schema.Types.Mixed },
    newValues: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    location: { type: String }
  },
  severity: {
    type: String,
    required: [true, 'Severity is required'],
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['success', 'failure', 'pending'],
    default: 'success'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes for efficient queries
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ organizationId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ createdAt: -1 });

export default (mongoose.models && mongoose.models.AuditLog) || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
