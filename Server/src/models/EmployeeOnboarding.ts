import mongoose, { Schema, Document } from "mongoose";

export type OnboardingStatus = "IN_PROGRESS" | "COMPLETED";

export interface IOnboardingTask {
  taskId: string;
  name: string;
  completed: boolean;
  completedAt?: Date | null;
}

export interface IOnboardingStep {
  stepId: string;
  category: string;
  iconKey: "MAIL" | "LAPTOP" | "BOOK" | "TEAM";
  tasks: IOnboardingTask[];
}

export interface IEmployeeOnboarding extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  position: string;
  startDate: Date;
  expectedEndDate?: Date | null;

  status: OnboardingStatus;

  steps: IOnboardingStep[];

  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<IOnboardingTask>(
  {
    taskId: { type: String, required: true },
    name: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const StepSchema = new Schema<IOnboardingStep>(
  {
    stepId: { type: String, required: true },
    category: { type: String, required: true },
    iconKey: { type: String, enum: ["MAIL", "LAPTOP", "BOOK", "TEAM"], required: true },
    tasks: { type: [TaskSchema], default: [] },
  },
  { _id: false }
);

const EmployeeOnboardingSchema = new Schema<IEmployeeOnboarding>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeName: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    expectedEndDate: { type: Date, default: null },

    status: { type: String, enum: ["IN_PROGRESS", "COMPLETED"], default: "IN_PROGRESS" },

    steps: { type: [StepSchema], default: [] },
  },
  { timestamps: true }
);

export const EmployeeOnboarding = mongoose.model<IEmployeeOnboarding>(
  "EmployeeOnboarding",
  EmployeeOnboardingSchema
);