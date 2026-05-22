import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  AgentName,
  AgentState,
  AgentProgressEvent,
  JobCompletedEvent,
  JobFailedEvent,
} from "../types";

const AGENT_LABELS: Record<AgentName, string> = {
  searcher:    "🔍 Web Searcher",
  summarizer:  "📝 Summarizer",
  factChecker: "🔎 Fact Checker",
  writer:      "✍️  Report Writer",
};

const DEFAULT_AGENTS: AgentState[] = (
  Object.keys(AGENT_LABELS) as AgentName[]
).map((name) => ({ name, label: AGENT_LABELS[name], status: "idle" }));


export const useResearchSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  const [agents, setAgents]   = useState<AgentState[]>(DEFAULT_AGENTS);
  const [report, setReport]   = useState<string>("");
  const [error, setError]     = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState<
    "idle" | "queued" | "processing" | "completed" | "failed"
  >("idle");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      setError("Real-time connection failed — check your login");
    });

    socket.on("agent:progress", (data: AgentProgressEvent) => {
      setJobStatus("processing");

      setAgents((prev) =>
        prev.map((a) =>
          a.name === data.agent
            ? { ...a, status: data.status }
            : a
        )
      );

      const pct =
        data.status === "completed"
          ? Math.round((data.completedAgents / data.totalAgents) * 100)
          : Math.round(
              ((data.completedAgents + 0.5) / data.totalAgents) * 100
            );
      setProgress(pct);
    });

    socket.on("job:completed", (data: JobCompletedEvent) => {
      setJobStatus("completed");
      setReport(data.report);
      setProgress(100);
    });

    socket.on("job:failed", (data: JobFailedEvent) => {
      setJobStatus("failed");
      setError(data.error);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const resetState = () => {
    setAgents(DEFAULT_AGENTS);
    setReport("");
    setError("");
    setProgress(0);
    setJobStatus("idle");
  };

  const subscribeToJob = (jobId: string) => {
    socketRef.current?.emit("job:subscribe", jobId);
  };

  return {
    agents,
    report,
    error,
    progress,
    jobStatus,
    subscribeToJob,
    resetState,
  };
};