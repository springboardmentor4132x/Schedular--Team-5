ReportsPage.tsx

import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Megaphone,
  Users,
  CalendarDays,
  Layers3,
  Download,
  ArrowRight,
} from "lucide-react";

const reports = [
  {
    title: "Engagement Reports",
    description:
      "Analyze likes, comments, shares, clicks, reach and engagement rate.",
    type: "engagement",
    icon: BarChart3,
    iconClass: "purple",
  },
  {
    title: "Campaign Reports",
    description:
      "View complete campaign performance, reach, impressions and engagement.",
    type: "campaign",
    icon: Megaphone,
    iconClass: "blue",
  },
  {
    title: "Audience Growth Reports",
    description:
      "Track follower growth, demographics and audience trends.",
    type: "audience",
    icon: Users,
    iconClass: "green",
  },
  {
    title: "Publishing Reports",
    description:
      "Review scheduled, published, failed and cancelled posts.",
    type: "publishing",
    icon: CalendarDays,
    iconClass: "orange",
  },
  {
    title: "Platform Comparison Reports",
    description:
      "Compare performance across Facebook, Instagram, LinkedIn, X, YouTube and Pinterest.",
    type: "platform",
    icon: Layers3,
    iconClass: "indigo",
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();

  const generateReport = (type: string) => {
    navigate(`/app/reports/generate?type=${type}`);
  };

  const openDownloads = () => {
    navigate("/app/reports/downloads");
  };

  return (
    <div className="reports-page">
      <section className="reports-header">
        <div className="reports-header-left">
          <div className="reports-header-icon">
            <BarChart3 size={24} />
          </div>

          <div>
            <h1>Reports</h1>
            <p>
              Create and manage professional reports from your application
              data.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="reports-download-button"
          onClick={openDownloads}
        >
          <Download size={18} />
          Download Center
        </button>
      </section>

      <section className="reports-summary-grid">
        <button
          type="button"
          className="reports-summary-card summary-clickable"
          onClick={() => document.getElementById("report-types")?.scrollIntoView({ behavior: "smooth" })}
        >
          <div>
            <span className="reports-summary-label">
              Available Reports
            </span>
            <strong>5</strong>
            <p>Report types available</p>
          </div>

          <div className="reports-summary-icon blue">
            <BarChart3 size={21} />
          </div>
        </button>

        <button
          type="button"
          className="reports-summary-card summary-clickable"
          onClick={() => generateReport("engagement")}
        >
          <div>
            <span className="reports-summary-label">
              Quick Generation
            </span>
            <strong>1 Click</strong>
            <p>Generate any report instantly</p>
          </div>

          <div className="reports-summary-icon purple">
            <ArrowRight size={21} />
          </div>
        </button>

        <button
          type="button"
          className="reports-summary-card summary-clickable"
          onClick={openDownloads}
        >
          <div>
            <span className="reports-summary-label">
              Export Center
            </span>
            <strong>Ready</strong>
            <p>Access generated reports</p>
          </div>

          <div className="reports-summary-icon green">
            <Download size={21} />
          </div>
        </button>
      </section>

      <section
        id="report-types"
        className="reports-section"
      >
        <div className="reports-section-heading">
          <div>
            <h2>Report Types</h2>
            <p>
              Select a report to generate detailed performance insights.
            </p>
          </div>
        </div>

        <div className="reports-grid">
          {reports.map((report) => {
            const Icon = report.icon;

            return (
              <div
                className="report-card"
                key={report.type}
              >
                <div className="report-card-top">
                  <div className={`report-icon ${report.iconClass}`}>
                    <Icon size={23} />
                  </div>

                  <span className="report-badge">
                    REPORT
                  </span>
                </div>

                <div className="report-card-content">
                  <h3>{report.title}</h3>
                  <p>{report.description}</p>
                </div>

                <div className="report-card-footer">
                  <button
                    type="button"
                    className="report-generate-button"
                    onClick={() => generateReport(report.type)}
                  >
                    Generate Report
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="reports-download-card">
        <button
  type="button"
  className="reports-download-icon"
  onClick={openDownloads}
>
  <Download size={23} />
</button>

        <div className="reports-download-content">
          <h3>Need an existing report?</h3>

          <p>
            Open the Download Center to view and download your previously
            generated reports.
          </p>
        </div>

        <button
          type="button"
          className="reports-open-download-button"
          onClick={openDownloads}
        >
          Open Download Center
          <ArrowRight size={17} />
        </button>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .reports-page {
          min-height: 100vh;
          width: 100%;
          padding: 32px;
          background: #f7f9fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .reports-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .reports-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .reports-header-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #eaf3ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .reports-header h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1.2;
          font-weight: 750;
          color: #172033;
        }

        .reports-header p {
          margin: 7px 0 0;
          color: #7b8494;
          font-size: 14px;
        }

        .reports-download-button {
          height: 42px;
          padding: 0 16px;
          border: none;
          border-radius: 9px;
          background: #2563eb;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .reports-download-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .reports-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .reports-summary-card {
          min-height: 130px;
          width: 100%;
          padding: 21px;
          background: #fff;
          border: 1px solid #e6eaf0;
          border-radius: 15px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          text-align: left;
          color: inherit;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(23, 32, 51, 0.025);
        }

        .summary-clickable {
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .summary-clickable:hover {
          transform: translateY(-2px);
          border-color: #cfdcf5;
          box-shadow: 0 8px 22px rgba(37, 99, 235, 0.08);
        }

        .reports-summary-label {
          display: block;
          font-size: 13px;
          color: #737d8e;
        }

        .reports-summary-card strong {
          display: block;
          margin-top: 10px;
          font-size: 26px;
          line-height: 1;
          font-weight: 750;
          color: #172033;
        }

        .reports-summary-card p {
          margin: 8px 0 0;
          color: #a0a7b4;
          font-size: 11px;
        }

        .reports-summary-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reports-summary-icon.blue {
          background: #eaf5ff;
          color: #2588df;
        }

        .reports-summary-icon.purple {
          background: #f0edff;
          color: #6d4aff;
        }

        .reports-summary-icon.green {
          background: #e9faf1;
          color: #16a765;
        }

        .reports-section {
          margin-bottom: 28px;
        }

        .reports-section-heading {
          margin-bottom: 16px;
        }

        .reports-section-heading h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 750;
          color: #202a3d;
        }

        .reports-section-heading p {
          margin: 6px 0 0;
          font-size: 12px;
          color: #8b94a3;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .report-card {
          min-height: 285px;
          padding: 21px;
          background: #fff;
          border: 1px solid #e6eaf0;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(23, 32, 51, 0.025);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .report-card:hover {
          transform: translateY(-3px);
          border-color: #cfdcf5;
          box-shadow: 0 10px 28px rgba(37, 99, 235, 0.08);
        }

        .report-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .report-icon {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .report-icon.purple {
          background: #f0edff;
          color: #6d4aff;
        }

        .report-icon.blue {
          background: #eaf5ff;
          color: #2588df;
        }

        .report-icon.green {
          background: #e9faf1;
          color: #16a765;
        }

        .report-icon.orange {
          background: #fff4df;
          color: #ea8a15;
        }

        .report-icon.indigo {
          background: #efedff;
          color: #5546d8;
        }

        .report-badge {
          padding: 5px 8px;
          border-radius: 6px;
          background: #f4f7fb;
          color: #8a93a3;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.7px;
        }

        .report-card-content {
          flex: 1;
          padding-top: 22px;
        }

        .report-card-content h3 {
          margin: 0;
          color: #202a3d;
          font-size: 16px;
          line-height: 1.35;
          font-weight: 700;
        }

        .report-card-content p {
          margin: 10px 0 0;
          color: #7d8799;
          font-size: 12px;
          line-height: 1.65;
        }

        .report-card-footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #edf0f4;
        }

        .report-generate-button {
          width: 100%;
          height: 40px;
          padding: 0 13px;
          border: none;
          border-radius: 9px;
          background: #2563eb;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .report-generate-button:hover {
          background: #1d4ed8;
        }

        .report-generate-button svg {
          transition: transform 0.2s ease;
        }

        .report-generate-button:hover svg {
          transform: translateX(3px);
        }

        .reports-download-card {
          min-height: 105px;
          padding: 20px 22px;
          border: 1px solid #dfe8fb;
          border-radius: 15px;
          background: linear-gradient(
            135deg,
            #f1f6ff 0%,
            #f8faff 100%
          );
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .reports-download-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #e4efff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reports-download-content {
          flex: 1;
        }

        .reports-download-content h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #29334a;
        }

        .reports-download-content p {
          margin: 5px 0 0;
          color: #7d8799;
          font-size: 11px;
          line-height: 1.5;
        }

        .reports-open-download-button {
          height: 39px;
          padding: 0 14px;
          border: 1px solid #cbdaf5;
          border-radius: 8px;
          background: #fff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .reports-open-download-button:hover {
          background: #2563eb;
          color: #fff;
          border-color: #2563eb;
        }

        @media (max-width: 1100px) {
          .reports-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .reports-summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 750px) {
          .reports-page {
            padding: 20px 15px;
          }

          .reports-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .reports-download-button {
            width: 100%;
          }

          .reports-summary-grid,
          .reports-grid {
            grid-template-columns: 1fr;
          }

          .reports-download-card {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .reports-download-content {
            min-width: 200px;
          }

          .reports-open-download-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}