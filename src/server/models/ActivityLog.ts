import { Schema, model, Document } from "mongoose";

export interface IActivityLog extends Document {
  userId: string;
  userName: string;
  email: string;
  collegeId: string;
  activity: string;
  ipAddress?: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  collegeId: { type: String, required: true },
  activity: { type: String, required: true },
  ipAddress: { type: String, required: false },
  timestamp: { type: Date, default: Date.now }
});

export const ActivityLog = model<IActivityLog>("ActivityLog", ActivityLogSchema);

