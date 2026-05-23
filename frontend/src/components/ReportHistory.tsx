import { useEffect, useState } from "react";
import { researchApi } from "../api/research.api";
import type{ Report } from "../types";

interface Props {
  onViewReport: (reportId: string) => void;
}

const STATUS_COLOR: Record<Report["status"], string> = {
  pending:    "#f59e0b",
  processing: "#3b82f6",
  completed:  "#10b981",
  failed:     "#ef4444",
};

export const ReportHistory = ({ onViewReport }: Props) => {
  const [reports, setReports]   = useState<Report[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await researchApi.getReports();
        setReports(res.data);
      } catch {
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <p style={{ color: "#6b7280" }}>Loading reports...</p>;
  if (error)   return <p style={{ color: "#ef4444" }}>{error}</p>;

  if (reports.length === 0) {
    return (
      <div style={{
        textAlign:    "center",
        padding:      "3rem",
        color:        "#9ca3af",
        border:       "1px dashed #d1d5db",
        borderRadius: "12px",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📭</div>
        <p style={{ margin: 0 }}>No reports yet. Start your first research above!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
        📚 Report History
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {reports.map((report) => (
          <div key={report._id} style={{
            display:         "flex",
            justifyContent:  "space-between",
            alignItems:      "center",
            padding:         "1rem 1.5rem",
            backgroundColor: "white",
            border:          "1px solid #e5e7eb",
            borderRadius:    "10px",
            transition:      "box-shadow 0.2s",
          }}>
            <div>

              <div style={{ fontWeight: 600, color: "#111827", marginBottom: "0.3rem" }}>
                {report.topic}
              </div>

              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                {new Date(report.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

              <span style={{
                padding:         "0.25rem 0.65rem",
                borderRadius:    "9999px",
                fontSize:        "0.75rem",
                fontWeight:      600,
                backgroundColor: STATUS_COLOR[report.status] + "22",
                color:           STATUS_COLOR[report.status],
                textTransform:   "capitalize",
              }}>
                {report.status}
              </span>


              {report.status === "completed" && (
                <button
                  onClick={() => onViewReport(report._id)}
                  style={{
                    padding:         "0.4rem 0.9rem",
                    fontSize:        "0.8rem",
                    backgroundColor: "#4f46e5",
                    color:           "white",
                    border:          "none",
                    borderRadius:    "6px",
                    cursor:          "pointer",
                  }}
                >
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};