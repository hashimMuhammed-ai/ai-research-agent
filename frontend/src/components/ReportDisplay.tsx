interface Props {
  report: string;
}


export const ReportDisplay = ({ report }: Props) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    alert("Report copied to clipboard!");
  };

  return (
    <div style={{
      marginTop: "2rem",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 1.5rem",
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
      }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          📄 Research Report
        </h3>
        <button
          onClick={handleCopy}
          style={{
            padding: "0.4rem 0.9rem",
            fontSize: "0.85rem",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Copy
        </button>
      </div>
      <pre style={{
        padding: "1.5rem",
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontSize: "0.9rem",
        lineHeight: 1.7,
        maxHeight: "600px",
        overflowY: "auto",
        fontFamily: "Georgia, serif",
      }}>
        {report}
      </pre>
    </div>
  );
};