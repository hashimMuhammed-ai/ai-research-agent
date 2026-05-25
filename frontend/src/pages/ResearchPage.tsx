import { researchApi }       from "../api/research.api";
import { useResearchSocket } from "../hooks/useResearchSocket";
import { ResearchForm }      from "../components/ResearchForm";
import { AgentPipeline }     from "../components/AgentPipeline";
import { ReportDisplay }     from "../components/ReportDisplay";

export const ResearchPage = () => {
  const {
    agents, report, error, progress,
    jobStatus, subscribeToJob, resetState, queueJob,
  } = useResearchSocket();

  const handleResearch = async (topic: string) => {
    resetState();
    queueJob();
    try {
      const res = await researchApi.createJob(topic);
      subscribeToJob(res.data.jobId);
    } catch {
      resetState();
      alert("Failed to start research — check your connection");
    }
  };

  const isRunning = jobStatus === "queued" || jobStatus === "processing";

  return (
    <>
      <style>{`
        .research-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }
        .status-pill {
          display: inline-block;
          padding: 0.3rem 0.8rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
        }
        .error-box {
          margin-top: 1rem;
          padding: 0.9rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.9rem;
          word-break: break-word;
        }

        @media (max-width: 480px) {
          .research-card { padding: 1rem; border-radius: 10px; }
          .section-title { font-size: 1rem; }
        }
      `}</style>

      <div className="research-card">
        <h2 className="section-title">🔬 New Research</h2>

        <ResearchForm onSubmit={handleResearch} isLoading={isRunning} />

        {/* Status pill */}
        {jobStatus !== "idle" && (
          <div
            className="status-pill"
            style={{
              backgroundColor:
                jobStatus === "completed" ? "#ecfdf5" :
                jobStatus === "failed"    ? "#fef2f2" : "#eff6ff",
              color:
                jobStatus === "completed" ? "#10b981" :
                jobStatus === "failed"    ? "#ef4444" : "#3b82f6",
            }}
          >
            {jobStatus === "queued"     && "⏳ Job queued..."}
            {jobStatus === "processing" && `🔄 Processing... ${progress}%`}
            {jobStatus === "completed"  && "✅ Report ready!"}
            {jobStatus === "failed"     && "❌ Job failed"}
          </div>
        )}

        {/* Agent pipeline */}
        {jobStatus !== "idle" && (
          <AgentPipeline agents={agents} progress={progress} />
        )}

        {error && <div className="error-box">❌ {error}</div>}
      </div>

      {report && <ReportDisplay report={report} />}
    </>
  );
};