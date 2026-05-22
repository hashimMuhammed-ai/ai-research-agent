export type AgentName = "searcher" | "summarizer" | "factChecker" | "writer";

export interface AgentProgressEvent {
  jobId:           string;
  topic:           string;
  agent:           AgentName;
  status:          "active" | "completed" | "failed";
  completedAgents: number;
  totalAgents:     number;
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

export interface AgentState {
  name:   AgentName;
  label:  string;
  status: "idle" | "active" | "completed" | "failed";
}