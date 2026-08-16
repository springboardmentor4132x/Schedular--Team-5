import { useNavigate } from "react-router-dom";

const reports = [
  {
    title: "Engagement Reports",
    description: "Analyze likes, comments, shares, clicks, reach and engagement rate.",
    type: "engagement",
  },
  {
    title: "Campaign Reports",
    description: "View complete campaign performance, reach, impressions and engagement.",
    type: "campaign",
  },
  {
    title: "Audience Growth Reports",
    description: "Track follower growth, demographics and audience trends.",
    type: "audience",
  },
  {
    title: "Publishing Reports",
    description: "Review scheduled, published, failed and cancelled posts.",
    type: "publishing",
  },
  {
    title: "Platform Comparison Reports",
    description: "Compare performance across Facebook, Instagram, LinkedIn, X, YouTube and Pinterest.",
    type: "platform",
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>
      <h1>Reports Dashboard</h1>
      <p>Generate and manage professional reports from your application data.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {reports.map((report) => (
          <div
            key={report.type}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "22px",
              background: "#fff",
            }}
          >
            <h2>{report.title}</h2>
            <p>{report.description}</p>

            <button
              onClick={() =>
                navigate(`/app/reports/generate?type=${report.type}`)
              }
              style={{
                marginTop: "15px",
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Generate Report
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/app/reports/downloads")}
        style={{
          marginTop: "30px",
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Open Download Center
      </button>
    </div>
  );
}