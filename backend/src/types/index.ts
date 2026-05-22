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

export interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
}

export interface AgentChainData {
  topic: string;
  searchResults: SearchResultItem[];
  summary?: string;
  verifiedSummary?: string;
  report?: string;
}


export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}



export interface ServerToClientEvents {
  "agent:progress": (data: AgentProgressEvent) => void;
  "job:completed":  (data: JobCompletedEvent)  => void;
  "job:failed":     (data: JobFailedEvent)      => void;
}


export interface ClientToServerEvents {
  "job:subscribe": (jobId: string) => void;
}

export interface AgentProgressEvent {
  jobId:  string;
  topic:  string;
  agent:  AgentName;
  status: "active" | "completed" | "failed";
  completedAgents: number;  
  totalAgents: number;   
}

export interface JobCompletedEvent {
  jobId:    string;
  topic:    string;
  reportId: string;
  report:   string;
}

export interface JobFailedEvent {
  jobId:  string;
  topic:  string;
  error:  string;
}