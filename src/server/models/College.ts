import { Schema, model, Document } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  createdBy?: string;
  createdAt: Date;
}

const CollegeSchema = new Schema<ICollege>({
  name: { type: String, required: true, unique: true, trim: true },
  createdBy: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

export const College = model<ICollege>('College', CollegeSchema);