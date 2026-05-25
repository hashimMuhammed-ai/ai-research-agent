import ReactMarkdown from "react-markdown";
import remarkGfm     from "remark-gfm";
import html2pdf      from "html2pdf.js";

interface Props { report: string; }

export const ReportDisplay = ({ report }: Props) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    alert("Report copied!");
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("report-body-pdf");
    if (!element) return;

    // Temporarily remove height constraints so full content is captured
    const originalMaxHeight = (element as HTMLElement).style.maxHeight;
    const originalOverflow = (element as HTMLElement).style.overflow;
    (element as HTMLElement).style.maxHeight = "none";
    (element as HTMLElement).style.overflow = "visible";

    const opt = {
      margin:      10,
      filename:    `research-report-${new Date().toISOString().split("T")[0]}.pdf`,
      image:       { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF:       { orientation: "portrait" as const, unit: "mm" as const, format: "a4" as const },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        // Restore original styles after PDF is generated
        (element as HTMLElement).style.maxHeight = originalMaxHeight;
        (element as HTMLElement).style.overflow = originalOverflow;
      });
  };

  return (
    <>
      <style>{`
        .report-wrap {
          margin-top: 2rem;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .report-title {
          font-size: 1rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .report-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .report-btn {
          min-width: 0;
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .report-body {
          padding: 1.5rem;
          max-height: 600px;
          overflow-y: auto;
          line-height: 1.8;
          font-size: 0.95rem;
          color: #111827;
        }
        .md-report h1 { font-size: 1.4rem; margin: 0 0 1rem; color: #1f2937; }
        .md-report h2 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3rem; }
        .md-report p  { margin: 0 0 1rem; }
        .md-report ul { padding-left: 1.5rem; margin-bottom: 1rem; }
        .md-report li { margin-bottom: 0.4rem; }
        .md-report a  { color: #4f46e5; word-break: break-all; }
        .md-report hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }

        @media (max-width: 480px) {
          .report-header { padding: 0.75rem 1rem; }
          .report-body   { padding: 1rem; font-size: 0.88rem; }
          .md-report h1  { font-size: 1.2rem; }
        }
      `}</style>

      <div className="report-wrap">
        <div className="report-header">
          <span className="report-title">📄 Research Report</span>
          <div className="report-actions">
            <button
              className="report-btn"
              style={{ background: "#6b7280" }}
              onClick={handleCopy}
            >
              Copy
            </button>
            <button
              className="report-btn"
              style={{ background: "#10b981" }}
              onClick={handleDownloadPDF}
            >
              📄 PDF
            </button>
          </div>
        </div>

        <div className="report-body" id="report-body-pdf">
          <div className="md-report">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
};