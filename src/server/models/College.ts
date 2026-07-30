import { Schema, model, Document } from 'mongoose';

export interface ICollege extends Document {
  collegeName: string;
  name?: string;
  collegeCode?: string;
  shortName?: string;
  university?: string;
  createdBy?: string;
  createdAt: Date;
}

const CollegeSchema = new Schema<ICollege>({
  collegeName: { type: String, required: true, unique: true, trim: true },
  name: { type: String, trim: true },
  collegeCode: { type: String, trim: true },
  shortName: { type: String, trim: true },
  university: { type: String, trim: true },
  createdBy: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

CollegeSchema.pre('validate', function (this: any) {
  if (this.collegeName && !this.name) {
    this.name = this.collegeName;
  } else if (this.name && !this.collegeName) {
    this.collegeName = this.name;
  }
});

export const College = model<ICollege>('College', CollegeSchema);