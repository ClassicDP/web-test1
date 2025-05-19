import mongoose, {Document, ObjectId, Schema} from "mongoose";

export interface IAnswer {
    questionId: ObjectId | string;
    optionId: ObjectId | string;
    correctOptionId?: ObjectId | string;
    isCorrect?: boolean;
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

export const AnswerSchema = new Schema<IAnswer>({
    questionId: {type: Schema.Types.ObjectId, required: true},
    optionId: {type: Schema.Types.ObjectId, required: true},
    correctOptionId: {type: Schema.Types.ObjectId, required: false},
});
export const TestResultSchema = new Schema<ITestResult>({
    answers: [AnswerSchema],
    score: {type: Number},
});
export const RegistrationSchema = new Schema<IRegistration>({
    testId: {type: Schema.Types.ObjectId, required: true},
    uniqueUrl: {type: String, required: true},
    status: {type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started'},
    startedAt: {type: Date},
    completedAt: {type: Date},
    result: TestResultSchema,
});
export const StudentSchema = new Schema<IStudent>({
    name: {type: String, required: true},
    email: {type: String, required: true},
    registrations: [RegistrationSchema],
});


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

export const OptionSchema = new Schema<IOption>({
    text: {type: String, required: true},
});
export const QuestionSchema = new Schema<IQuestion>({
    text: {type: String, required: true},
    options: [OptionSchema],
    correctOptionId: {type: Schema.Types.ObjectId, required: true},
});
export const TestSchema = new Schema<ITest>({
    title: {type: String, required: true},
    description: {type: String},
    questions: [QuestionSchema],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    editable: {type: Boolean, default: true},
    parentTestId: {type: Schema.Types.ObjectId},
});

export const TestModel = mongoose.model<ITest>('Test', TestSchema);
export const StudentModel = mongoose.model<IStudent>('Student', StudentSchema);
