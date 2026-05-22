import { useState } from "react";

interface Props {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export const ResearchForm = ({ onSubmit, isLoading }: Props) => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) onSubmit(topic.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a research topic (e.g. Quantum Computing)"
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            backgroundColor: isLoading ? "#ccc" : "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Researching..." : "Research"}
        </button>
      </div>
    </form>
  );
};