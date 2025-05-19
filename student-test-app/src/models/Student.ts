import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IAnswer {
  questionId: ObjectId;
  optionId: ObjectId;
}
export interface ITestResult {
  answers: IAnswer[];
  score?: number;
}
export interface IRegistration {
  testId: ObjectId;
  uniqueUrl: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  result?: ITestResult;
}
export interface IStudent extends Document {
  name: string;
  email: string;
  registrations: IRegistration[];
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: { type: Schema.Types.ObjectId, required: true },
  optionId: { type: Schema.Types.ObjectId, required: true },
});
const TestResultSchema = new Schema<ITestResult>({
  answers: [AnswerSchema],
  score: { type: Number },
});
const RegistrationSchema = new Schema<IRegistration>({
  testId: { type: Schema.Types.ObjectId, required: true },
  uniqueUrl: { type: String, required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  result: TestResultSchema,
});
const StudentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  registrations: [RegistrationSchema],
});
export default mongoose.model<IStudent>('Student', StudentSchema);
