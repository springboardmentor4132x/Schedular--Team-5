export default function PlatformComparisonPage() {
  const platforms = [
    "Facebook",
    "Instagram",
    "LinkedIn",
    "X",
    "YouTube",
    "Pinterest",
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h1>Platform Comparison Report</h1>

      <p>
        Compare social media performance across different platforms.
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "25px",
        }}
      >
        <thead>
          <tr>
            <th>Platform</th>
            <th>Reach</th>
            <th>Impressions</th>
            <th>Likes</th>
            <th>Comments</th>
            <th>Shares</th>
            <th>Clicks</th>
            <th>Engagement Rate</th>
            <th>Follower Growth</th>
          </tr>
        </thead>

        <tbody>
          {platforms.map((platform) => (
            <tr key={platform}>
              <td>{platform}</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0%</td>
              <td>0</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}