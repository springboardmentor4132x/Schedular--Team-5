import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GenerateReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialType = searchParams.get("type") || "engagement";

  const [reportType, setReportType] = useState(initialType);
  const [campaign, setCampaign] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [format, setFormat] = useState("PDF");

  const handleGenerate = () => {
    navigate("/app/reports/preview", {
      state: {
        reportType,
        campaign,
        platform,
        contentType,
        fromDate,
        toDate,
        format,
      },
    });
  };

  return (
    <div style={{ padding: "30px", maxWidth: "800px" }}>
      <h1>Generate Report</h1>

      <label>Report Type</label>
      <select
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="engagement">Engagement Report</option>
        <option value="campaign">Campaign Report</option>
        <option value="audience">Audience Growth Report</option>
        <option value="publishing">Publishing Report</option>
        <option value="platform">Platform Comparison Report</option>
      </select>

      <br /><br />

      <label>Campaign</label>
      <select value={campaign} onChange={(e) => setCampaign(e.target.value)}>
        <option value="all">All Campaigns</option>
        <option value="campaign-1">Campaign 1</option>
        <option value="campaign-2">Campaign 2</option>
      </select>

      <br /><br />

      <label>Platform</label>
      <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
        <option value="all">All Platforms</option>
        <option value="facebook">Facebook</option>
        <option value="instagram">Instagram</option>
        <option value="linkedin">LinkedIn</option>
        <option value="x">X</option>
        <option value="youtube">YouTube</option>
        <option value="pinterest">Pinterest</option>
      </select>

      <br /><br />

      <label>Content Type</label>
      <select
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
      >
        <option value="all">All Content</option>
        <option value="text">Text</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      <br /><br />

      <label>From Date</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />

      <br /><br />

      <label>To Date</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />

      <br /><br />

      <label>Export Format</label>
      <select value={format} onChange={(e) => setFormat(e.target.value)}>
        <option value="PDF">PDF</option>
        <option value="Excel">Excel</option>
      </select>

      <br /><br />

      <button onClick={handleGenerate}>
        Generate Report
      </button>
    </div>
  );
}