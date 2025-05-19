import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IOption {
  _id: ObjectId;
  text: string;
}
export interface IQuestion {
  _id: ObjectId;
  text: string;
  options: IOption[];
  correctOptionId: ObjectId;
}
export interface ITest extends Document {
  title: string;
  description: string;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
  editable: boolean;
  parentTestId?: ObjectId;
}

const OptionSchema = new Schema<IOption>({
  text: { type: String, required: true },
});
const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: [OptionSchema],
  correctOptionId: { type: Schema.Types.ObjectId, required: true },
});
const TestSchema = new Schema<ITest>({
  title: { type: String, required: true },
  description: { type: String },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  editable: { type: Boolean, default: true },
  parentTestId: { type: Schema.Types.ObjectId },
});
export default mongoose.model<ITest>('Test', TestSchema);
