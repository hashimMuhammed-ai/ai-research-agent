import { Request } from "express";
import { Document, Types } from "mongoose";


export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}


export interface AuthRequest extends Request {
  user?: IUser;
}


export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
}


export interface ResearchJobData {
  topic: string;
  userId: string;
}

export type AgentName = "searcher" | "summarizer" | "factChecker" | "writer";

export interface AgentProgress {
  agent: AgentName;
  status: "active" | "completed" | "failed";
}

export interface ResearchJobResult {
  topic: string;
  userId: string;
  report: string;
}


export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}