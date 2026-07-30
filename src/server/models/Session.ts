import { Schema, model, Document } from 'mongoose';

export interface ISession extends Document {
  userId: string;
  ipAddress: string;
  browser: string;
  loginTime: Date;
  logoutTime?: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: String, required: true },
  ipAddress: { type: String, required: false },
  browser: { type: String, required: false },
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date, required: false }
});

export const Session = model<ISession>('Session', SessionSchema);