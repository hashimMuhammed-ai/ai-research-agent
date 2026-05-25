import { Handle, Position } from "reactflow";
import type{ NodeProps } from "reactflow"
import type{ AgentState } from "../types";

const STATUS_STYLES: Record<AgentState["status"], {
  border: string; bg: string; color: string; shadow: string;
}> = {
  idle:      { border: "#d1d5db", bg: "#f9fafb", color: "#6b7280", shadow: "none" },
  active:    { border: "#f59e0b", bg: "#fffbeb", color: "#d97706", shadow: "0 0 0 3px rgba(245,158,11,0.25)" },
  completed: { border: "#10b981", bg: "#ecfdf5", color: "#059669", shadow: "0 0 0 3px rgba(16,185,129,0.15)" },
  failed:    { border: "#ef4444", bg: "#fef2f2", color: "#dc2626", shadow: "0 0 0 3px rgba(239,68,68,0.2)" },
};

const formatDuration = (ms: number | null): string => {
  if (!ms) return "";
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
};

export const PipelineNode = ({ data }: NodeProps<AgentState>) => {
  const s = STATUS_STYLES[data.status];

  return (
    <>
      {/* Handles on all 4 sides — layout switches between horizontal/vertical */}
      <Handle type="target" position={Position.Left}   style={handleStyle(s.border)} id="left"   />
      <Handle type="target" position={Position.Top}    style={handleStyle(s.border)} id="top"    />
      <Handle type="source" position={Position.Right}  style={handleStyle(s.border)} id="right"  />
      <Handle type="source" position={Position.Bottom} style={handleStyle(s.border)} id="bottom" />

      <div style={{
        width:        140,
        padding:      "0.75rem",
        borderRadius: "12px",
        border:       `2px solid ${s.border}`,
        background:   s.bg,
        boxShadow:    s.shadow,
        textAlign:    "center",
        transition:   "all 0.4s ease",
        animation:    data.status === "active" ? "pulse 1.5s infinite" : "none",
      }}>
        <div style={{ fontSize: "1.6rem", marginBottom: "0.3rem" }}>
          {data.icon}
        </div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>
          {data.label}
        </div>
        <div style={{
          display:         "inline-block",
          padding:         "0.12rem 0.45rem",
          borderRadius:    "9999px",
          fontSize:        "0.65rem",
          fontWeight:      600,
          color:           s.color,
          backgroundColor: s.border + "33",
          textTransform:   "capitalize",
        }}>
          {data.status === "active" ? "Running..." : data.status}
        </div>
        {data.duration && (
          <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "0.2rem" }}>
            ⏱ {formatDuration(data.duration)}
          </div>
        )}
      </div>
    </>
  );
};

const handleStyle = (color: string): React.CSSProperties => ({
  background: color,
  border:     "none",
  width:      8,
  height:     8,
});