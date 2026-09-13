import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGrade {
  subject: string;
  score: number;
  letter: string;
  remark?: string;
  updatedAt: string;
}

export interface IAttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface IFeedbackEntry {
  id: string;
  date: string;
  teacherId: string;
  teacherName: string;
  message: string;
}

export interface IStudent extends Document {
  id: string;
  name: string;
  email: string;
  section: string;
  avatarInitials: string;
  grades: IGrade[];
  gpa: number;
  attendance: IAttendanceRecord[];
  attendancePct: number;
  feedback: IFeedbackEntry[];
  status: 'good' | 'warning' | 'critical';
  createdAt?: string;
  updatedAt?: string;
}

const GradeSchema = new Schema<IGrade>(
  {
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    letter: { type: String, required: true },
    remark: { type: String },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    date: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['present', 'absent', 'late', 'excused'],
    },
  },
  { _id: false }
);

const FeedbackEntrySchema = new Schema<IFeedbackEntry>(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    teacherId: { type: String, required: true },
    teacherName: { type: String, required: true },
    message: { type: String, required: true },
  },
  { _id: false }
);

const StudentSchema = new Schema<IStudent>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    section: { type: String, default: 'Grade 10 - A' },
    avatarInitials: { type: String, default: 'ST' },
    grades: { type: [GradeSchema], default: [] },
    gpa: { type: Number, default: 0 },
    attendance: { type: [AttendanceRecordSchema], default: [] },
    attendancePct: { type: Number, default: 100 },
    feedback: { type: [FeedbackEntrySchema], default: [] },
    status: {
      type: String,
      enum: ['good', 'warning', 'critical'],
      default: 'good',
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
