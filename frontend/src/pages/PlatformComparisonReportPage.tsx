import { useState } from "react";

const platforms = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "X",
  "YouTube",
  "Pinterest",
];

export default function PlatformComparisonReportPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState(platforms);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  };

  return (
    <div style={{ padding: "32px" }}>
      <h1>Platform Comparison Report</h1>

      <p>
        Compare social media performance across the selected platforms.
      </p>

      <div style={{ marginTop: "25px" }}>
        <h3>Select Platforms</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {platforms.map((platform) => (
            <label
              key={platform}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px 14px",
              }}
            >
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform)}
                onChange={() => togglePlatform(platform)}
              />{" "}
              {platform}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>Comparison Metrics</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "12px" }}>
                Platform
              </th>
              <th style={{ border: "1px solid #ddd", padding: "12px" }}>
                Reach
              </th>
              <th style={{ border: "1px solid #ddd", padding: "12px" }}>
                Impressions
              </th>
              <th style={{ border: "1px solid #ddd", padding: "12px" }}>
                Likes
              </th>
              <th style={{ border: "1px solid #ddd", padding: "12px" }}>
                Comments
              </th>
              <th style={{ border: "1px solid #ddd", padding: "12px" }}>
                Shares
              </th>
              <th style={{ border: "1px solid #ddd", padding: "12px" }}>
                Clicks
              </th>
              <th style={{ border: "1px solid #ddd", padding: "12px" }}>
                Engagement Rate
              </th>
            </tr>
          </thead>

          <tbody>
            {selectedPlatforms.map((platform) => (
              <tr key={platform}>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                  {platform}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>-</td>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>-</td>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>-</td>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>-</td>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>-</td>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>-</td>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "25px" }}>
        <button
          onClick={() =>
            alert("PDF/Excel export will be connected with the backend later.")
          }
        >
          Export Report
        </button>
      </div>
    </div>
  );
}