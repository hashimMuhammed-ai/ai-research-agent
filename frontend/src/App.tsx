import { useState } from "react";
import { authApi, researchApi } from "./api/research.api";
import { useResearchSocket }    from "./hooks/useResearchSocket";
import { ResearchForm }         from "./components/ResearchForm";
import { AgentPipeline }        from "./components/AgentPipeline";
import { ReportDisplay }        from "./components/ReportDisplay";

export default function App() {
  const [token, setToken]       = useState(localStorage.getItem("token") || "");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const {
    agents,
    report,
    error,
    progress,
    jobStatus,
    subscribeToJob,
    resetState,
  } = useResearchSocket();


  const handleLogin = async () => {
    try {
      setAuthError("");
      const res = await authApi.login(email, password);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      window.location.reload(); // reconnect socket with new token
    } catch {
      setAuthError("Invalid email or password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };


  const handleResearch = async (topic: string) => {
    resetState();
    try {
      const res = await researchApi.createJob(topic);
      subscribeToJob(res.data.jobId);
    } catch {
      alert("Failed to start research job — check your token");
    }
  };


  if (!token) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          width: "360px",
        }}>
          <h2 style={{ margin: "0 0 1.5rem", textAlign: "center" }}>
            🔬 AI Research Agent
          </h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, marginTop: "0.75rem" }}
          />
          {authError && (
            <p style={{ color: "red", fontSize: "0.85rem", margin: "0.5rem 0" }}>
              {authError}
            </p>
          )}
          <button
            onClick={handleLogin}
            style={{
              ...buttonStyle,
              width: "100%",
              marginTop: "1rem",
            }}
          >
            Login
          </button>
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#6b7280", marginTop: "1rem" }}>
            Register via Postman first, then login here.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      padding: "2rem",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
            🔬 AI Research Agent
          </h1>
          <button onClick={handleLogout} style={outlineButtonStyle}>
            Logout
          </button>
        </div>

        {/* Research Form */}
        <div style={cardStyle}>
          <ResearchForm
            onSubmit={handleResearch}
            isLoading={jobStatus === "queued" || jobStatus === "processing"}
          />

          {/* Status badge */}
          {jobStatus !== "idle" && (
            <div style={{
              display: "inline-block",
              padding: "0.3rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              backgroundColor:
                jobStatus === "completed" ? "#ecfdf5" :
                jobStatus === "failed"    ? "#fef2f2" :
                                           "#eff6ff",
              color:
                jobStatus === "completed" ? "#10b981" :
                jobStatus === "failed"    ? "#ef4444" :
                                           "#3b82f6",
            }}>
              {jobStatus === "queued"     && "⏳ Job queued..."}
              {jobStatus === "processing" && `🔄 Processing... ${progress}%`}
              {jobStatus === "completed"  && "✅ Report ready!"}
              {jobStatus === "failed"     && "❌ Job failed"}
            </div>
          )}

          {/* Agent pipeline visualization */}
          {jobStatus !== "idle" && (
            <AgentPipeline agents={agents} progress={progress} />
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: "1rem",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#ef4444",
              fontSize: "0.9rem",
            }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* Report */}
        {report && <ReportDisplay report={report} />}
      </div>
    </div>
  );
}


const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  fontSize: "0.95rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.65rem 1.25rem",
  fontSize: "0.95rem",
  backgroundColor: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const outlineButtonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  fontSize: "0.9rem",
  backgroundColor: "transparent",
  color: "#4f46e5",
  border: "1px solid #4f46e5",
  borderRadius: "8px",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "1.5rem",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  marginBottom: "1.5rem",
};