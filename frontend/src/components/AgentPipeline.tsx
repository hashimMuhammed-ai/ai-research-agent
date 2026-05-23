import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "reactflow";
import type{Node, Edge} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect } from "react";
import { PipelineNode } from "./PipelineNode";
import type{ AgentState, AgentName } from "../types";

interface Props {
  agents:   AgentState[];
  progress: number;
}

// Register custom node type — must be defined outside component
// to prevent React Flow from re-registering on every render
const nodeTypes = { pipelineNode: PipelineNode };

const NODE_POSITIONS: Record<AgentName, { x: number; y: number }> = {
  searcher:    { x: 0,   y: 60 },
  summarizer:  { x: 220, y: 60 },
  factChecker: { x: 440, y: 60 },
  writer:      { x: 660, y: 60 },
};

// Edges connect agents in sequence with animated arrows
const buildEdges = (agents: AgentState[]): Edge[] => {
  const agentNames = agents.map((a) => a.name);
  return agentNames.slice(0, -1).map((name, index) => {
    const source = name;
    const target = agentNames[index + 1];
    const isActive =
      agents[index].status === "completed" ||
      agents[index + 1].status === "active" ||
      agents[index + 1].status === "completed";

    return {
      id:        `${source}-${target}`,
      source,
      target,
      animated:  agents[index + 1].status === "active", // animate only active edge
      style: {
        stroke:      isActive ? "#4f46e5" : "#d1d5db",
        strokeWidth: isActive ? 2.5 : 1.5,
      },
      markerEnd: {
        type:  MarkerType.ArrowClosed,
        color: isActive ? "#4f46e5" : "#d1d5db",
      },
    };
  });
};

export const AgentPipeline = ({ agents, progress }: Props) => {
  const initialNodes: Node[] = agents.map((agent) => ({
    id:       agent.name,
    type:     "pipelineNode",
    position: NODE_POSITIONS[agent.name],
    data:     agent,
  }));

  const initialEdges = buildEdges(agents);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges whenever agent states change
  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => {
        const updated = agents.find((a) => a.name === node.id);
        return updated ? { ...node, data: updated } : node;
      })
    );
    setEdges(buildEdges(agents));
  }, [agents]);

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          marginBottom:   "0.4rem",
          fontSize:       "0.8rem",
          color:          "#6b7280",
        }}>
          <span>Pipeline Progress</span>
          <span>{progress}%</span>
        </div>
        <div style={{
          height:          "6px",
          backgroundColor: "#e5e7eb",
          borderRadius:    "9999px",
          overflow:        "hidden",
        }}>
          <div style={{
            height:          "100%",
            width:           `${progress}%`,
            backgroundColor: "#4f46e5",
            borderRadius:    "9999px",
            transition:      "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* React Flow canvas */}
      <div style={{
        height:       280,
        borderRadius: "12px",
        border:       "1px solid #e5e7eb",
        overflow:     "hidden",
        backgroundColor: "#fafafa",
      }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.85; transform: scale(1.02); }
          }
        `}</style>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={false}
          panOnDrag={false}
          attributionPosition="bottom-right"
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
};