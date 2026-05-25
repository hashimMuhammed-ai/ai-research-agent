interface Props {
  onSubmit:  (topic: string) => void;
  isLoading: boolean;
}

export const ResearchForm = ({ onSubmit, isLoading }: Props) => {
  let topic = "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) onSubmit(topic.trim());
  };

  return (
    <>
      <style>{`
        .research-form { margin-bottom: 1.25rem; }
        .form-row {
          display: flex;
          gap: 0.75rem;
        }
        .topic-input {
          flex: 1;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          outline: none;
          min-width: 0;        /* prevents flex overflow on mobile */
        }
        .topic-input:focus { border-color: #4f46e5; }
        .submit-btn {
          padding: 0.75rem 1.25rem;
          font-size: 0.95rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .submit-btn:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
        }

        /* Stack vertically on mobile */
        @media (max-width: 480px) {
          .form-row    { flex-direction: column; }
          .submit-btn  { width: 100%; }
        }
      `}</style>

      <form className="research-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            className="topic-input"
            type="text"
            placeholder="Enter a research topic (e.g. Quantum Computing)"
            disabled={isLoading}
            onChange={(e) => { topic = e.target.value; }}
          />
          <button
            className="submit-btn"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Researching..." : "Research"}
          </button>
        </div>
      </form>
    </>
  );
};