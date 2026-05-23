import { researchApi }     from "../api/research.api";
import { useResearchSocket } from "../hooks/useResearchSocket";
import { ResearchForm }    from "../components/ResearchForm";
import { AgentPipeline }   from "../components/AgentPipeline";
import { ReportDisplay }   from "../components/ReportDisplay";

export const ResearchPage = () => {
  const {
    agents, report, error, progress,
    jobStatus, subscribeToJob, resetState,
  } = useResearchSocket();

  const handleResearch = async (topic: string) => {
    resetState();
    try {
      const res = await researchApi.createJob(topic);
      subscribeToJob(res.data.jobId);
    } catch {
      alert("Failed to start research — check your connection");
    }
  };

  const isRunning = jobStatus === "queued" || jobStatus === "processing";

  return (
    <div>
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 1.25rem", fontSize: "1.1rem", fontWeight: 700 }}>
          🔬 New Research
        </h2>

        <ResearchForm onSubmit={handleResearch} isLoading={isRunning} />

        {jobStatus !== "idle" && (
          <div style={{
            display:         "inline-block",
            padding:         "0.3rem 0.8rem",
            borderRadius:    "9999px",
            fontSize:        "0.8rem",
            fontWeight:      600,
            marginBottom:    "1.25rem",
            backgroundColor:
              jobStatus === "completed" ? "#ecfdf5" :
              jobStatus === "failed"    ? "#fef2f2" : "#eff6ff",
            color:
              jobStatus === "completed" ? "#10b981" :
              jobStatus === "failed"    ? "#ef4444" : "#3b82f6",
          }}>
            {jobStatus === "queued"     && "⏳ Job queued..."}
            {jobStatus === "processing" && `🔄 Processing... ${progress}%`}
            {jobStatus === "completed"  && "✅ Report ready!"}
            {jobStatus === "failed"     && "❌ Job failed"}
          </div>
        )}


        {jobStatus !== "idle" && (
          <AgentPipeline agents={agents} progress={progress} />
        )}


        {error && (
          <div style={{
            marginTop:    "1rem",
            padding:      "0.9rem 1rem",
            backgroundColor: "#fef2f2",
            border:       "1px solid #fecaca",
            borderRadius: "8px",
            color:        "#ef4444",
            fontSize:     "0.9rem",
          }}>
            ❌ {error}
          </div>
        )}
      </div>


      {report && <ReportDisplay report={report} />}
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius:    "12px",
  padding:         "1.5rem",
  boxShadow:       "0 1px 3px rgba(0,0,0,0.08)",
  marginBottom:    "1.5rem",
};