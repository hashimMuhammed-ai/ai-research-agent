import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type{
  AgentName,
  AgentState,
  AgentProgressEvent,
  JobCompletedEvent,
  JobFailedEvent,
} from "../types";

export const AGENT_META: Record<AgentName, { label: string; icon: string }> = {
  searcher:    { label: "Web Searcher",  icon: "🔍" },
  summarizer:  { label: "Summarizer",   icon: "📝" },
  factChecker: { label: "Fact Checker", icon: "🔎" },
  writer:      { label: "Report Writer",icon: "✍️"  },
};

const DEFAULT_AGENTS: AgentState[] = (
  Object.keys(AGENT_META) as AgentName[]
).map((name) => ({
  name,
  label:     AGENT_META[name].label,
  icon:      AGENT_META[name].icon,
  status:    "idle",
  startedAt: null,
  duration:  null,
}));

export const useResearchSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  const [agents, setAgents]     = useState<AgentState[]>(DEFAULT_AGENTS);
  const [report, setReport]     = useState("");
  const [error, setError]       = useState("");
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState<
    "idle" | "queued" | "processing" | "completed" | "failed"
  >("idle");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      setError(`Connection failed: ${err.message}`);
    });

    socket.on("agent:progress", (data: AgentProgressEvent) => {
      setJobStatus("processing");

      setAgents((prev) =>
        prev.map((a) => {
          if (a.name !== data.agent) return a;

          if (data.status === "active") {
            // Clear any previous error when an agent becomes active (retry)
            setError("");
            return { ...a, status: "active", startedAt: Date.now(), duration: null };
          }

          if (data.status === "completed") {
            const duration = a.startedAt ? Date.now() - a.startedAt : null;
            return { ...a, status: "completed", duration };
          }

          return { ...a, status: data.status };
        })
      );

      const pct =
        data.status === "completed"
          ? Math.round((data.completedAgents / data.totalAgents) * 100)
          : Math.round(((data.completedAgents + 0.5) / data.totalAgents) * 100);
      setProgress(pct);
    });

    socket.on("job:completed", (data: JobCompletedEvent) => {
      setJobStatus("completed");
      setReport(data.report);
      setProgress(100);
      // Clear any prior error when job completes successfully
      setError("");
    });

    socket.on("job:failed", (data: JobFailedEvent) => {
      setJobStatus("failed");
      setError(data.error);

      // Ensure any agent still marked as active is shown as failed in the UI
      setAgents((prev) =>
        prev.map((a) =>
          a.status === "active"
            ? { ...a, status: "failed", duration: a.startedAt ? Date.now() - a.startedAt : a.duration }
            : a
        )
      );
    });

    return () => { socket.disconnect(); };
  }, []);

  const resetState = () => {
    setAgents(DEFAULT_AGENTS);
    setReport("");
    setError("");
    setProgress(0);
    setJobStatus("idle");
  };

  const queueJob = () => {
    setJobStatus("queued");
  };

  const subscribeToJob = (jobId: string) => {
    socketRef.current?.emit("job:subscribe", jobId);
  };

  return { agents, report, error, progress, jobStatus, subscribeToJob, resetState, queueJob };
};