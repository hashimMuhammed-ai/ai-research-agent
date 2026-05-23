import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  report: string;
}

export const ReportDisplay = ({ report }: Props) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    alert("Report copied!");
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "research-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      marginTop:    "2rem",
      border:       "1px solid #e5e7eb",
      borderRadius: "12px",
      overflow:     "hidden",
    }}>
      {/* Header */}
      <div style={{
        display:         "flex",
        justifyContent:  "space-between",
        alignItems:      "center",
        padding:         "1rem 1.5rem",
        backgroundColor: "#f9fafb",
        borderBottom:    "1px solid #e5e7eb",
      }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          📄 Research Report
        </h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleCopy}     style={btnStyle("#6b7280")}>Copy</button>
          <button onClick={handleDownload} style={btnStyle("#4f46e5")}>⬇ Download</button>
        </div>
      </div>

      {/* Markdown content */}
      <div style={{
        padding:    "1.5rem 2rem",
        maxHeight:  "600px",
        overflowY:  "auto",
        lineHeight: 1.8,
        fontSize:   "0.95rem",
        color:      "#111827",
      }}>
        {/* Scoped markdown styles */}
        <style>{`
          .md-report h1 { font-size: 1.6rem; margin: 0 0 1rem; color: #1f2937; }
          .md-report h2 { font-size: 1.2rem; margin: 1.5rem 0 0.5rem; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3rem; }
          .md-report p  { margin: 0 0 1rem; }
          .md-report ul { padding-left: 1.5rem; margin-bottom: 1rem; }
          .md-report li { margin-bottom: 0.4rem; }
          .md-report a  { color: #4f46e5; text-decoration: none; }
          .md-report a:hover { text-decoration: underline; }
          .md-report strong { color: #111827; }
          .md-report hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
        `}</style>

        <div className="md-report">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

const btnStyle = (bg: string): React.CSSProperties => ({
  padding:         "0.4rem 0.8rem",
  fontSize:        "0.8rem",
  backgroundColor: bg,
  color:           "white",
  border:          "none",
  borderRadius:    "6px",
  cursor:          "pointer",
});