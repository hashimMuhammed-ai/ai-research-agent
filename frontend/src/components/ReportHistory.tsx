import { useEffect, useState } from "react";
import { researchApi } from "../api/research.api";
import type{ Report } from "../types";

interface Props { onViewReport: (reportId: string) => void; }

const STATUS_COLOR: Record<Report["status"], string> = {
  pending:    "#f59e0b",
  processing: "#3b82f6",
  completed:  "#10b981",
  failed:     "#ef4444",
};

export const ReportHistory = ({ onViewReport }: Props) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    researchApi.getReports()
      .then((res) => setReports(res.data))
      .catch(() => setError("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "#6b7280" }}>Loading reports...</p>;
  if (error)   return <p style={{ color: "#ef4444" }}>{error}</p>;

  if (reports.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "3rem",
        color: "#9ca3af", border: "1px dashed #d1d5db", borderRadius: "12px",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📭</div>
        <p style={{ margin: 0 }}>No reports yet. Start your first research!</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .history-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          gap: 1rem;
          flex-wrap: wrap;       /* wraps on small screens */
        }
        .history-topic {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.3rem;
          word-break: break-word;
        }
        .history-date { font-size: 0.8rem; color: #9ca3af; }
        .history-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .status-badge {
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .view-btn {
          padding: 0.4rem 0.9rem;
          font-size: 0.8rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          .history-item  { padding: 0.85rem 1rem; }
          .history-right { width: 100%; justify-content: space-between; }
        }
      `}</style>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
        📚 Report History
      </h2>

      <div className="history-list">
        {reports.map((report) => (
          <div key={report._id} className="history-item">
            <div>
              <div className="history-topic">{report.topic}</div>
              <div className="history-date">
                {new Date(report.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </div>
            </div>

            <div className="history-right">
              <span
                className="status-badge"
                style={{
                  backgroundColor: STATUS_COLOR[report.status] + "22",
                  color:           STATUS_COLOR[report.status],
                }}
              >
                {report.status}
              </span>

              {report.status === "completed" && (
                <button className="view-btn" onClick={() => onViewReport(report._id)}>
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};