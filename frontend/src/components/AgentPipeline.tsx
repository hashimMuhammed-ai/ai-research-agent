import ReactFlow, { 
  Background, Controls,
  MarkerType, useNodesState, useEdgesState,
  type ReactFlowInstance,
} from "reactflow";
import type{Node, Edge} from "reactflow"
import "reactflow/dist/style.css";
import { useEffect, useState, useRef } from "react";
import { PipelineNode } from "./PipelineNode";
import type{ AgentState, AgentName } from "../types";

interface Props {
  agents:   AgentState[];
  progress: number;
}

const nodeTypes = { pipelineNode: PipelineNode };

/**
 * Node positions adapt based on screen width.
 * Desktop: horizontal pipeline  →  →  →
 * Mobile:  vertical pipeline    ↓  ↓  ↓
 */
const getNodePositions = (
  isMobile: boolean
): Record<AgentName, { x: number; y: number }> => {
  if (isMobile) {
    return {
      searcher:    { x: 60, y: 0   },
      summarizer:  { x: 60, y: 140 },
      factChecker: { x: 60, y: 280 },
      writer:      { x: 60, y: 420 },
    };
  }
  return {
    searcher:    { x: 0,   y: 60 },
    summarizer:  { x: 220, y: 60 },
    factChecker: { x: 440, y: 60 },
    writer:      { x: 660, y: 60 },
  };
};

const buildEdges = (agents: AgentState[], isMobile: boolean): Edge[] => {
  const agentNames = agents.map((a) => a.name);
  return agentNames.slice(0, -1).map((name, index) => {
    const source  = name;
    const target  = agentNames[index + 1];
    const isActive =
      agents[index].status === "completed" ||
      agents[index + 1].status === "active" ||
      agents[index + 1].status === "completed";

    return {
      id:       `${source}-${target}`,
      source,
      target,
      animated: agents[index + 1].status === "active",
      // On mobile edges flow top-to-bottom, desktop left-to-right
      sourceHandle: isMobile ? "bottom" : undefined,
      targetHandle: isMobile ? "top"    : undefined,
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);

  const fitCanvas = () => {
    requestAnimationFrame(() => {
      reactFlowRef.current?.fitView({ padding: 0.25 });
    });
  };

  // Listen for resize to switch layout
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Observe container size changes and refit when the canvas resizes
  useEffect(() => {
    const wrapper = flowWrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(() => {
      fitCanvas();
    });
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

  // Refit when layout mode or agents change
  useEffect(() => {
    fitCanvas();
  }, [agents, isMobile]);

  const positions = getNodePositions(isMobile);

  const initialNodes: Node[] = agents.map((agent) => ({
    id:       agent.name,
    type:     "pipelineNode",
    position: positions[agent.name],
    data:     agent,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    buildEdges(agents, isMobile)
  );

  useEffect(() => {
    const pos = getNodePositions(isMobile);
    setNodes((prev) =>
      prev.map((node) => {
        const updated = agents.find((a) => a.name === node.id);
        return updated
          ? { ...node, data: updated, position: pos[node.id as AgentName] }
          : node;
      })
    );
    setEdges(buildEdges(agents, isMobile));
  }, [agents, isMobile]);

  return (
    <>
      <style>{`
        .pipeline-wrap  { margin-bottom: 1.5rem; }
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.4rem;
        }
        .progress-track {
          height: 6px;
          background: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .progress-fill {
          height: 100%;
          background: #4f46e5;
          border-radius: 9999px;
          transition: width 0.5s ease;
        }
        .flow-canvas {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          background: #fafafa;
        }

        /* Taller canvas on mobile for vertical layout */
        @media (min-width: 641px) { .flow-canvas { height: 260px; } }
        @media (max-width: 640px) { .flow-canvas { height: 560px; } }
      `}</style>

      <div className="pipeline-wrap">
        {/* Progress bar */}
        <div className="progress-label">
          <span>Pipeline Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* React Flow canvas */}
        <div className="flow-canvas" ref={flowWrapperRef}>
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
            onInit={(instance) => {
              reactFlowRef.current = instance;
              // Ensure fitView happens after layout is settled
              requestAnimationFrame(() => {
                instance.fitView({ padding: 0.25 });
              });
            }}
            fitViewOptions={{ padding: 0.25 }}
            nodesDraggable={false}
            nodesConnectable={false}
            zoomOnScroll={false}
            panOnScroll={false}
            panOnDrag={false}
            attributionPosition="bottom-right"
          >
            <Background color="#e5e7eb" gap={20} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>
    </>
  );
};