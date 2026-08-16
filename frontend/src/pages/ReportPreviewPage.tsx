import { useLocation, useNavigate } from "react-router-dom";

export default function ReportPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const report = location.state || {};

  return (
    <div style={{ padding: "30px" }}>
      <h1>Report Preview</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "30px",
          marginTop: "20px",
        }}
      >
        <h2>
          {report.reportType
            ? `${report.reportType} Report`
            : "Generated Report"}
        </h2>

        <p>
          <strong>Campaign:</strong> {report.campaign || "All"}
        </p>

        <p>
          <strong>Platform:</strong> {report.platform || "All"}
        </p>

        <p>
          <strong>Content Type:</strong> {report.contentType || "All"}
        </p>

        <p>
          <strong>Date Range:</strong>{" "}
          {report.fromDate || "Start"} - {report.toDate || "End"}
        </p>

        <p>
          <strong>Export Format:</strong> {report.format || "PDF"}
        </p>

        <hr />

        <h3>Summary Statistics</h3>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div>Reach: 0</div>
          <div>Impressions: 0</div>
          <div>Likes: 0</div>
          <div>Comments: 0</div>
          <div>Shares: 0</div>
          <div>Clicks: 0</div>
        </div>

        <h3 style={{ marginTop: "30px" }}>Performance Data</h3>

        <p>
          Report data will be connected to the backend analytics after the
          backend module is completed.
        </p>
      </div>

      <button
        onClick={() => navigate("/app/reports/generate")}
        style={{ marginTop: "20px" }}
      >
        Regenerate
      </button>

      <button
        onClick={() => navigate("/app/reports/downloads")}
        style={{ marginLeft: "10px" }}
      >
        Download Center
      </button>
    </div>
  );
}