import { useState } from "react";
import { ReportHistory } from "../components/ReportHistory";
import { ReportDisplay } from "../components/ReportDisplay";
import { researchApi }   from "../api/research.api";

export const HistoryPage = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportContent, setReportContent]   = useState("");
  const [loading, setLoading]               = useState(false);

  const handleViewReport = async (reportId: string) => {
    setSelectedReport(reportId);
    setLoading(true);
    try {
      const res = await researchApi.getFullReport(reportId);
      setReportContent(res.data.report);
    } catch {
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedReport(null);
    setReportContent("");
  };

  if (selectedReport) {
    return (
      <div>
        <button
          onClick={handleBack}
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             "0.4rem",
            padding:         "0.5rem 1rem",
            fontSize:        "0.9rem",
            backgroundColor: "transparent",
            color:           "#4f46e5",
            border:          "1px solid #4f46e5",
            borderRadius:    "8px",
            cursor:          "pointer",
            marginBottom:    "1.5rem",
          }}
        >
          ← Back to History
        </button>

        {loading
          ? <p style={{ color: "#6b7280" }}>Loading report...</p>
          : <ReportDisplay report={reportContent} />
        }
      </div>
    );
  }

  return <ReportHistory onViewReport={handleViewReport} />;
};