import { useState } from "react";

interface Report {
  id: number;
  name: string;
  type: string;
  date: string;
  format: string;
  status: string;
}

export default function DownloadCenterPage() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      name: "Engagement Report",
      type: "Engagement",
      date: "2026-08-15",
      format: "PDF",
      status: "Completed",
    },
  ]);

  const [search, setSearch] = useState("");

  const filteredReports = reports.filter((report) =>
    report.name.toLowerCase().includes(search.toLowerCase())
  );

  const deleteReport = (id: number) => {
    setReports((current) =>
      current.filter((report) => report.id !== id)
    );
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Download Center</h1>

      <input
        type="text"
        placeholder="Search reports..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          margin: "20px 0",
        }}
      />

      {filteredReports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Report Type</th>
              <th>Generated Date</th>
              <th>Format</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <td>{report.name}</td>
                <td>{report.type}</td>
                <td>{report.date}</td>
                <td>{report.format}</td>
                <td>{report.status}</td>

                <td>
                  <button>Download</button>

                  <button
                    onClick={() => deleteReport(report.id)}
                    style={{ marginLeft: "8px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}