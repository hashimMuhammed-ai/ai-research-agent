import type{ AgentState } from "../types";

interface Props {
  agents:   AgentState[];
  progress: number;
}

const statusConfig = {
  idle:      { color: "#9ca3af", bg: "#f3f4f6", icon: "○" },
  active:    { color: "#f59e0b", bg: "#fffbeb", icon: "◉" },
  completed: { color: "#10b981", bg: "#ecfdf5", icon: "✓" },
  failed:    { color: "#ef4444", bg: "#fef2f2", icon: "✗" },
};

export const AgentPipeline = ({ agents, progress }: Props) => {
  return (
    <div style={{ marginBottom: "2rem" }}>

      {/* Progress bar */}
      <div style={{
        height: "8px",
        backgroundColor: "#e5e7eb",
        borderRadius: "9999px",
        marginBottom: "1.5rem",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: "#4f46e5",
          borderRadius: "9999px",
          transition: "width 0.5s ease",
        }} />
      </div>

      {/* Agent cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {agents.map((agent, index) => {
          const cfg = statusConfig[agent.status];
          return (
            <div key={agent.name} style={{ position: "relative" }}>

              {/* Connector line between agents */}
              {index < agents.length - 1 && (
                <div style={{
                  position: "absolute",
                  right: "-0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "1.2rem",
                  zIndex: 1,
                }}>
                  →
                </div>
              )}

              <div style={{
                backgroundColor: cfg.bg,
                border: `2px solid ${cfg.color}`,
                borderRadius: "12px",
                padding: "1rem",
                textAlign: "center",
                transition: "all 0.3s ease",
              }}>
                <div style={{
                  fontSize: "1.5rem",
                  marginBottom: "0.5rem",
                  color: cfg.color,
                }}>
                  {cfg.icon}
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {agent.label}
                </div>
                <div style={{
                  fontSize: "0.75rem",
                  color: cfg.color,
                  marginTop: "0.25rem",
                  textTransform: "capitalize",
                  fontWeight: 500,
                }}>
                  {agent.status === "active" ? "Running..." : agent.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};