import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Download,
  FileDown,
  FileText,
  Search,
  Trash2,
} from "lucide-react";

type ReportStatus = "Completed" | "Generating" | "Failed";

type Report = {
  id: number;
  reportName: string;
  reportType: string;
  generatedDate: string;
  format: string;
  status: ReportStatus;
  size: string;
};

const initialReports: Report[] = [
  {
    id: 1,
    reportName: "Engagement Report",
    reportType: "Engagement",
    generatedDate: "2026-08-16",
    format: "PDF",
    status: "Completed",
    size: "950 KB",
  },
  {
    id: 2,
    reportName: "Campaign Report",
    reportType: "Campaign",
    generatedDate: "2026-08-16",
    format: "PDF",
    status: "Completed",
    size: "1.2 MB",
  },
  {
    id: 3,
    reportName: "Audience Growth Report",
    reportType: "Audience",
    generatedDate: "2026-08-16",
    format: "PDF",
    status: "Completed",
    size: "1.4 MB",
  },
];

const DownloadCenterPage: React.FC = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>(initialReports);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) {
      return reports;
    }

    return reports.filter((report) =>
      [
        report.reportName,
        report.reportType,
        report.generatedDate,
        report.format,
        report.status,
        report.size,
      ].some((field) => field.toLowerCase().includes(value))
    );
  }, [reports, searchTerm]);

  const completedCount = reports.filter(
    (report) => report.status === "Completed"
  ).length;

  const pdfCount = reports.filter(
    (report) => report.format === "PDF"
  ).length;

  const downloadReport = (report: Report) => {
    const content = [
      "SocialPilot Report",
      "",
      `Report Name: ${report.reportName}`,
      `Report Type: ${report.reportType}`,
      `Generated Date: ${report.generatedDate}`,
      `Format: ${report.format}`,
      `Status: ${report.status}`,
      `File Size: ${report.size}`,
    ].join("\n");

    const blob = new Blob([content], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${report.reportName
      .replace(/\s+/g, "-")
      .toLowerCase()}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const downloadLatestPdf = () => {
    if (reports.length === 0) {
      return;
    }

    const latestReport = [...reports].sort(
      (a, b) =>
        new Date(b.generatedDate).getTime() -
        new Date(a.generatedDate).getTime()
    )[0];

    downloadReport(latestReport);
  };

  const deleteReport = (id: number) => {
    setReports((currentReports) =>
      currentReports.filter((report) => report.id !== id)
    );
  };

  const goToReports = () => {
    navigate("/app/reports");
  };

  return (
    <div className="download-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .download-page {
          min-height: 100vh;
          width: 100%;
          padding: 28px;
          background:
            linear-gradient(
              135deg,
              #071f3d 0%,
              #0b315d 45%,
              #0d477d 100%
            );
          color: #172033;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .download-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
        }

        .download-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
          padding: 22px 24px;
          background: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
        }

        .download-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .back-button {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border: 1px solid #d8e2ec;
          border-radius: 9px;
          background: #ffffff;
          color: #31526d;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .back-button:hover {
          background: #edf6fc;
          border-color: #a9c8dd;
          color: #0a79b8;
          transform: translateX(-2px);
        }

        .download-header-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #e5f4fb;
          color: #087fbe;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .download-title h1 {
          margin: 0;
          color: #17324d;
          font-size: 28px;
          line-height: 1.2;
          font-weight: 750;
        }

        .download-title p {
          margin: 6px 0 0;
          color: #71889a;
          font-size: 13px;
        }

        .reports-button {
          border: 0;
          border-radius: 8px;
          padding: 11px 17px;
          background: #087fc2;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .reports-button:hover {
          background: #066da7;
          transform: translateY(-1px);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .summary-card {
          min-height: 112px;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #d8e9f2;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 7px 22px rgba(0, 0, 0, 0.08);
        }

        .summary-number {
          display: block;
          color: #17324d;
          font-size: 27px;
          font-weight: 750;
        }

        .summary-label {
          display: block;
          margin-top: 5px;
          color: #7890a2;
          font-size: 12px;
        }

        .summary-icon {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          background: #e8f5fb;
          color: #087fc2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .reports-section {
          overflow: hidden;
          margin-bottom: 20px;
          background: #ffffff;
          border: 1px solid #d8e9f2;
          border-radius: 14px;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.09);
        }

        .section-heading {
          padding: 23px 25px 7px;
        }

        .section-heading h2 {
          margin: 0;
          color: #17324d;
          font-size: 20px;
          font-weight: 750;
        }

        .section-heading p {
          margin: 6px 0 0;
          color: #7890a2;
          font-size: 13px;
        }

        .search-row {
          padding: 14px 25px 20px;
        }

        .search-box {
          position: relative;
          width: 100%;
        }

        .search-box svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #7897aa;
          pointer-events: none;
        }

        .search-box input {
          width: 100%;
          height: 44px;
          padding: 0 14px 0 40px;
          border: 1px solid #cfe1eb;
          border-radius: 8px;
          outline: none;
          background: #fbfdff;
          color: #17324d;
          font-size: 13px;
          transition: 0.2s ease;
        }

        .search-box input::placeholder {
          color: #9aabb8;
        }

        .search-box input:focus {
          background: #ffffff;
          border-color: #1788c8;
          box-shadow: 0 0 0 3px rgba(23, 136, 200, 0.1);
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .reports-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .reports-table thead th {
          padding: 14px 17px;
          text-align: left;
          background: #eaf6fb;
          border-top: 1px solid #d8e9f2;
          border-bottom: 1px solid #d8e9f2;
          color: #496c80;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .reports-table tbody tr {
          transition: 0.15s ease;
        }

        .reports-table tbody tr:hover {
          background: #f8fcfe;
        }

        .reports-table tbody td {
          padding: 16px 17px;
          border-bottom: 1px solid #e8f0f4;
          color: #536f81;
          font-size: 12px;
          vertical-align: middle;
        }

        .reports-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .report-name-cell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 210px;
        }

        .report-file-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 8px;
          background: #e8f5fb;
          color: #087fc2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .report-name {
          color: #17324d;
          font-size: 12px;
          font-weight: 700;
        }

        .report-subtitle {
          margin-top: 3px;
          color: #98a9b5;
          font-size: 10px;
        }

        .type-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 9px;
          border-radius: 6px;
          background: #e8f5fb;
          color: #1680b8;
          font-size: 10px;
          font-weight: 700;
        }

        .format-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 9px;
          border-radius: 6px;
          background: #eef3f7;
          color: #586d7d;
          font-size: 10px;
          font-weight: 700;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #508067;
          font-size: 11px;
          font-weight: 700;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #45a66d;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .action-button {
          width: 35px;
          height: 35px;
          border: 1px solid #c8e1ed;
          border-radius: 7px;
          background: #eaf7fc;
          color: #087fc2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .action-button:hover {
          background: #d9f0fa;
          border-color: #a9d3e6;
          transform: translateY(-1px);
        }

        .delete-button {
          background: #fff5f5;
          border-color: #efd9db;
          color: #b05c65;
        }

        .delete-button:hover {
          background: #ffe9ea;
          border-color: #e9b9bd;
          color: #c23944;
        }

        .empty-state {
          min-height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #8da1ad;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }
          .pdf-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 22px;
          margin-bottom: 0;
          background: #eaf7fb;
          border: 1px solid #cfe8f1;
          border-radius: 13px;
          cursor: pointer;
          transition: 0.2s ease;
          box-shadow: 0 7px 20px rgba(0, 0, 0, 0.06);
        }

        .pdf-card:hover {
          background: #e2f3f9;
          border-color: #a9d4e4;
          transform: translateY(-1px);
        }

        .pdf-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #ffffff;
          color: #087fc2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .pdf-content {
          flex: 1;
          min-width: 0;
        }

        .pdf-content h3 {
          margin: 0;
          color: #173d58;
          font-size: 15px;
          font-weight: 750;
        }

        .pdf-content p {
          margin: 5px 0 0;
          color: #78919f;
          font-size: 11px;
          line-height: 1.5;
        }

        .pdf-download-button {
          flex-shrink: 0;
          border: 0;
          border-radius: 7px;
          padding: 10px 15px;
          background: #087fc2;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .pdf-download-button:hover {
          background: #066da7;
        }

        @media (max-width: 950px) {
          .download-page {
            padding: 18px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .download-header {
            flex-direction: column;
            align-items: stretch;
          }

          .reports-button {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .download-page {
            padding: 10px;
          }

          .download-header {
            padding: 18px;
          }

          .download-header-left {
            align-items: flex-start;
          }

          .download-title h1 {
            font-size: 23px;
          }

          .section-heading {
            padding-left: 18px;
            padding-right: 18px;
          }

          .search-row {
            padding-left: 18px;
            padding-right: 18px;
          }

          .pdf-card {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .pdf-download-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="download-container">
        <header className="download-header">
          <div className="download-header-left">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/app/reports")}
              aria-label="Back to Reports"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="download-header-icon">
              <FileDown size={22} />
            </div>

            <div className="download-title">
              <h1>Download Center</h1>
              <p>
                View, search and download your previously generated reports.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="reports-button"
            onClick={goToReports}
          >
            <BarChart3 size={16} />
            Reports
          </button>
        </header>

        <div className="summary-grid">
          <div className="summary-card">
            <div>
              <span className="summary-number">
                {reports.length}
              </span>

              <span className="summary-label">
                Total Reports
              </span>
            </div>

            <div className="summary-icon">
              <FileText size={21} />
            </div>
          </div>

          <div className="summary-card">
            <div>
              <span className="summary-number">
                {completedCount}
              </span>

              <span className="summary-label">
                Reports Completed
              </span>
            </div>

            <div className="summary-icon">
              <CheckCircle2 size={21} />
            </div>
          </div>

          <div className="summary-card">
            <div>
              <span className="summary-number">
                {pdfCount}
              </span>

              <span className="summary-label">
                PDF Reports
              </span>
            </div>

            <div className="summary-icon">
              <FileDown size={21} />
            </div>
          </div>
        </div>

        <section className="reports-section">
          <div className="section-heading">
            <h2>Reports</h2>

            <p>
              Search and manage your generated reports.
            </p>
          </div>

          <div className="search-row">
            <div className="search-box">
              <Search size={17} />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search reports..."
                aria-label="Search reports"
              />
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <FileText size={40} />
              <p>No reports found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>REPORT NAME</th>
                    <th>REPORT TYPE</th>
                    <th>GENERATED DATE</th>
                    <th>FORMAT</th>
                    <th>STATUS</th>
                    <th>SIZE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>

                 {filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <div className="report-name-cell">
                          <div className="report-file-icon">
                            <FileText size={16} />
                          </div>

                          <div>
                            <div className="report-name">
                              {report.reportName}
                            </div>

                            <div className="report-subtitle">
                              Generated report
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="type-badge">
                          {report.reportType}
                        </span>
                      </td>

                      <td>
                        {report.generatedDate}
                      </td>

                      <td>
                        <span className="format-badge">
                          {report.format}
                        </span>
                      </td>

                      <td>
                        <span className="status-badge">
                          <span className="status-dot" />
                          {report.status}
                        </span>
                      </td>

                      <td>
                        {report.size}
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="action-button"
                            onClick={() =>
                              downloadReport(report)
                            }
                            aria-label={`Download ${report.reportName}`}
                            title="Download"
                          >
                            <Download size={16} />
                          </button>

                          <button
                            type="button"
                            className="action-button delete-button"
                            onClick={() =>
                              deleteReport(report.id)
                            }
                            aria-label={`Delete ${report.reportName}`}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section
          className="pdf-card"
          onClick={downloadLatestPdf}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              downloadLatestPdf();
            }
          }}
        >
          <div className="pdf-icon">
            <FileDown size={21} />
          </div>

          <div className="pdf-content">
            <h3>PDF Available Formats</h3>

            <p>
              PDF reports are available for download.
              Download the latest generated PDF report.
            </p>
          </div>

          <button
            type="button"
            className="pdf-download-button"
            onClick={(event) => {
              event.stopPropagation();
              downloadLatestPdf();
            }}
          >
            <Download size={15} />
            Download PDF
          </button>
        </section>
      </div>
    </div>
  );
};

export default DownloadCenterPage; 