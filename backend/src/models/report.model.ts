import mongoose, { Schema, Document, Types } from "mongoose";


export interface IReport extends Document {
  userId: Types.ObjectId;
  topic: string;
  report: string;
  status: "pending" | "processing" | "completed" | "failed";
  jobId: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true},
    topic:   { type: String, required: true, trim: true },
    report:  { type: String, default: "" },
    status:  {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    jobId:   { type: String, required: true, unique: true },
    error:   { type: String },
  },
  { timestamps: true }
);

export const ReportModel = mongoose.model<IReport>("Report", reportSchema);