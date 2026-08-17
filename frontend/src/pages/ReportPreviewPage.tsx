import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Download,
  RotateCcw,
  CalendarDays,
  Megaphone,
  Users,
  Layers3,
  CheckCircle2,
} from "lucide-react";

type ReportState = {
  reportType?: string;
  campaign?: string;
  platform?: string;
  contentType?: string;
  fromDate?: string;
  toDate?: string;
  format?: string;
};

const reportTypeInfo: Record<
  string,
  {
    title: string;
    description: string;
    icon: typeof BarChart3;
    iconClass: string;
  }
> = {
  engagement: {
    title: "Engagement Report",
    description:
      "Analyze likes, comments, shares, clicks, reach and engagement rate.",
    icon: BarChart3,
    iconClass: "purple",
  },

  campaign: {
    title: "Campaign Report",
    description:
      "View complete campaign performance, reach, impressions and engagement.",
    icon: Megaphone,
    iconClass: "blue",
  },

  audience: {
    title: "Audience Growth Report",
    description:
      "Track follower growth, demographics and audience trends.",
    icon: Users,
    iconClass: "green",
  },

  publishing: {
    title: "Publishing Report",
    description:
      "Review scheduled, published, failed and cancelled posts.",
    icon: CalendarDays,
    iconClass: "orange",
  },

  platform: {
    title: "Platform Comparison Report",
    description:
      "Compare performance across Facebook, Instagram, LinkedIn, X, YouTube and Pinterest.",
    icon: Layers3,
    iconClass: "indigo",
  },
};

function getReportInfo(reportType: string) {
  return (
    reportTypeInfo[reportType] || {
      title: "Generated Report",
      description:
        "Review the selected report configuration and performance data.",
      icon: FileText,
      iconClass: "blue",
    }
  );
}

function formatValue(value?: string) {
  if (!value || value === "all") {
    return "All";
  }

  if (value === "campaign-1") {
    return "Campaign 1";
  }

  if (value === "campaign-2") {
    return "Campaign 2";
  }

  if (value === "facebook") {
    return "Facebook";
  }

  if (value === "instagram") {
    return "Instagram";
  }

  if (value === "linkedin") {
    return "LinkedIn";
  }

  if (value === "x") {
    return "X";
  }

  if (value === "youtube") {
    return "YouTube";
  }

  if (value === "pinterest") {
    return "Pinterest";
  }

  if (value === "text") {
    return "Text";
  }

  if (value === "image") {
    return "Image";
  }

  if (value === "video") {
    return "Video";
  }

  return value;
}

export default function ReportPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const report = (location.state || {}) as ReportState;

  const reportType = report.reportType || "engagement";
  const reportInfo = getReportInfo(reportType);

  const ReportIcon = reportInfo.icon;

  const handleRegenerate = () => {
    navigate(`/app/reports/generate?type=${reportType}`);
  };

  const handleDownloadCenter = () => {
    navigate("/app/reports/downloads");
  };

  return (
    <div className="report-preview-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="preview-header">
        <div className="preview-header-left">
          <div className="preview-header-icon">
            <FileText size={24} />
          </div>

          <div>
            <h1>Report Preview</h1>

            <p>
              Review your report before downloading or generating it again.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="preview-download-button"
          onClick={handleDownloadCenter}
        >
          <Download size={18} />
          Download Center
        </button>
      </section>

      {/* =====================================================
          REPORT PREVIEW CARD
      ===================================================== */}

      <section className="preview-report-card">
        {/* REPORT TITLE */}

        <div className="preview-report-heading">
          <div
            className={`preview-report-icon ${reportInfo.iconClass}`}
          >
            <ReportIcon size={24} />
          </div>

          <div className="preview-report-heading-content">
            <div className="preview-title-row">
              <h2>{reportInfo.title}</h2>

              <span className="preview-report-badge">
                REPORT
              </span>
            </div>

            <p>{reportInfo.description}</p>
          </div>
        </div>

        {/* =====================================================
            REPORT CONFIGURATION
        ===================================================== */}

        <div className="preview-section">
          <div className="preview-section-title">
            <h3>Report Configuration</h3>

            <p>
              Filters and export options selected for this report.
            </p>
          </div>

          <div className="preview-config-grid">
            <div className="preview-config-item">
              <span>Report Type</span>

              <strong>{reportInfo.title}</strong>
            </div>

            <div className="preview-config-item">
              <span>Campaign</span>

              <strong>
                {formatValue(report.campaign)}
              </strong>
            </div>

            <div className="preview-config-item">
              <span>Platform</span>

              <strong>
                {formatValue(report.platform)}
              </strong>
            </div>

            <div className="preview-config-item">
              <span>Content Type</span>

              <strong>
                {formatValue(report.contentType)}
              </strong>
            </div>

            <div className="preview-config-item">
              <span>From Date</span>

              <strong>
                {report.fromDate || "Start"}
              </strong>
            </div>

            <div className="preview-config-item">
              <span>To Date</span>

              <strong>
                {report.toDate || "End"}
              </strong>
            </div>

            <div className="preview-config-item">
              <span>Export Format</span>

              <strong>
                {report.format || "PDF"}
              </strong>
            </div>

            <div className="preview-config-item">
              <span>Status</span>

              <strong className="preview-status">
                <CheckCircle2 size={15} />
                Ready
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            SUMMARY STATISTICS
        ===================================================== */}

        <div className="preview-section">
          <div className="preview-section-title">
            <h3>Summary Statistics</h3>

            <p>
              Key performance metrics included in this report.
            </p>
          </div>

          <div className="preview-summary-grid">
            <div className="preview-summary-card">
              <span>Reach</span>

              <strong>0</strong>

              <small>Total users reached</small>
            </div>

            <div className="preview-summary-card">
              <span>Impressions</span>

              <strong>0</strong>

              <small>Total impressions</small>
            </div>

            <div className="preview-summary-card">
              <span>Likes</span>

              <strong>0</strong>

              <small>Total likes</small>
            </div>

            <div className="preview-summary-card">
              <span>Comments</span>

              <strong>0</strong>

              <small>Total comments</small>
            </div>

            <div className="preview-summary-card">
              <span>Shares</span>

              <strong>0</strong>

              <small>Total shares</small>
            </div>

            <div className="preview-summary-card">
              <span>Clicks</span>

              <strong>0</strong>

              <small>Total clicks</small>
            </div>
          </div>
        </div>

        {/* =====================================================
            PERFORMANCE DATA
        ===================================================== */}

        <div className="preview-section">
          <div className="preview-section-title">
            <h3>Performance Data</h3>

            <p>
              Detailed analytics will appear here when backend
              reporting data is connected.
            </p>
          </div>

          <div className="preview-empty-state">
            <div className="preview-empty-icon">
              <BarChart3 size={25} />
            </div>

            <h4>Performance data is not available yet</h4>

            <p>
              The report preview layout is ready. Analytics data
              will be connected from the backend reporting APIs.
            </p>
          </div>
        </div>

        {/* =====================================================
            REPORT FOOTER
        ===================================================== */}

        <div className="preview-report-footer">
          <div>
            <span>Report Status</span>

            <strong>
              <CheckCircle2 size={16} />
              Preview Ready
            </strong>
          </div>

          <div>
            <span>Export Format</span>

            <strong>
              {report.format || "PDF"}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <section className="preview-actions">
        <button
          type="button"
          className="preview-regenerate-button"
          onClick={handleRegenerate}
        >
          <RotateCcw size={17} />
          Regenerate
        </button>

        <button
          type="button"
          className="preview-primary-button"
          onClick={handleDownloadCenter}
        >
          <Download size={17} />
          Download Center
        </button>
      </section>
    </div>
  );
}


/* =========================================================
   REPORT PREVIEW STYLES
   Same visual language as ReportsPage
========================================================= */

const reportPreviewStyles = `
  * {
    box-sizing: border-box;
  }

  .report-preview-page {
    min-height: 100vh;
    width: 100%;
    padding: 32px;
    background: #f7f9fc;
    color: #172033;
    font-family: Arial, Helvetica, sans-serif;
  }

  /* =====================================================
     HEADER
  ===================================================== */

  .preview-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
  }

  .preview-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .preview-header-icon {
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

  .preview-header h1 {
    margin: 0;
    font-size: 29px;
    line-height: 1.2;
    font-weight: 750;
    color: #172033;
  }

  .preview-header p {
    margin: 7px 0 0;
    color: #7b8494;
    font-size: 14px;
  }

  .preview-download-button {
    height: 42px;
    padding: 0 16px;
    border: none;
    border-radius: 9px;
    background: #2563eb;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .preview-download-button:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }


  /* =====================================================
     MAIN REPORT CARD
  ===================================================== */

  .preview-report-card {
    width: 100%;
    background: #ffffff;
    border: 1px solid #e6eaf0;
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 2px 8px rgba(23, 32, 51, 0.025);
  }


  /* =====================================================
     REPORT HEADING
  ===================================================== */

  .preview-report-heading {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding-bottom: 24px;
    border-bottom: 1px solid #edf0f4;
  }

  .preview-report-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .preview-report-icon.purple {
    background: #f0edff;
    color: #6d4aff;
  }

  .preview-report-icon.blue {
    background: #eaf5ff;
    color: #2588df;
  }

  .preview-report-icon.green {
    background: #e9faf1;
    color: #16a765;
  }

  .preview-report-icon.orange {
    background: #fff4df;
    color: #ea8a15;
  }

  .preview-report-icon.indigo {
    background: #efedff;
    color: #5546d8;
  }

  .preview-report-heading-content {
    flex: 1;
  }

  .preview-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .preview-title-row h2 {
    margin: 0;
    font-size: 21px;
    line-height: 1.3;
    color: #202a3d;
    font-weight: 750;
  }

  .preview-report-badge {
    padding: 5px 8px;
    border-radius: 6px;
    background: #f4f7fb;
    color: #8a93a3;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.7px;
  }

  .preview-report-heading-content p {
    margin: 8px 0 0;
    color: #7d8799;
    font-size: 12px;
    line-height: 1.6;
  }


  /* =====================================================
     SECTIONS
  ===================================================== */

  .preview-section {
    padding: 26px 0;
    border-bottom: 1px solid #edf0f4;
  }

  .preview-section:last-of-type {
    border-bottom: none;
  }

  .preview-section-title {
    margin-bottom: 17px;
  }

  .preview-section-title h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 750;
    color: #202a3d;
  }

  .preview-section-title p {
    margin: 6px 0 0;
    font-size: 12px;
    color: #8b94a3;
  }


  /* =====================================================
     CONFIGURATION
  ===================================================== */

  .preview-config-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .preview-config-item {
    min-height: 84px;
    padding: 15px;
    background: #f8fafc;
    border: 1px solid #edf0f4;
    border-radius: 11px;
  }

  .preview-config-item span {
    display: block;
    font-size: 11px;
    color: #8b94a3;
    margin-bottom: 8px;
  }

  .preview-config-item strong {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #29334a;
    font-size: 13px;
    font-weight: 700;
    word-break: break-word;
  }

  .preview-status {
    color: #16a765 !important;
  }


  /* =====================================================
     SUMMARY
  ===================================================== */

  .preview-summary-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
  }

  .preview-summary-card {
    min-height: 125px;
    padding: 17px;
    background: #ffffff;
    border: 1px solid #e6eaf0;
    border-radius: 12px;
    box-shadow: 0 2px 7px rgba(23, 32, 51, 0.02);
  }

  .preview-summary-card span {
    display: block;
    font-size: 11px;
    color: #737d8e;
  }

  .preview-summary-card strong {
    display: block;
    margin-top: 11px;
    font-size: 24px;
    line-height: 1;
    color: #172033;
    font-weight: 750;
  }

  .preview-summary-card small {
    display: block;
    margin-top: 9px;
    font-size: 10px;
    color: #a0a7b4;
  }


  /* =====================================================
     EMPTY PERFORMANCE STATE
  ===================================================== */

  .preview-empty-state {
    min-height: 190px;
    padding: 30px;
    border: 1px dashed #d9e0ea;
    border-radius: 13px;
    background: #fafbfd;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .preview-empty-icon {
    width: 48px;
    height: 48px;
    border-radius: 13px;
    background: #eaf3ff;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .preview-empty-state h4 {
    margin: 0;
    color: #29334a;
    font-size: 14px;
    font-weight: 700;
  }

  .preview-empty-state p {
    max-width: 560px;
    margin: 8px 0 0;
    color: #8b94a3;
    font-size: 11px;
    line-height: 1.6;
  }


  /* =====================================================
     REPORT FOOTER
  ===================================================== */

  .preview-report-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding-top: 22px;
  }

  .preview-report-footer > div {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .preview-report-footer span {
    font-size: 10px;
    color: #8b94a3;
  }

  .preview-report-footer strong {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #29334a;
  }

  .preview-report-footer strong svg {
    color: #16a765;
  }


  /* =====================================================
     ACTIONS
  ===================================================== */

  .preview-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
  }

  .preview-regenerate-button,
  .preview-primary-button {
    height: 41px;
    padding: 0 15px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .preview-regenerate-button {
    border: 1px solid #d7deea;
    background: #ffffff;
    color: #526078;
  }

  .preview-regenerate-button:hover {
    background: #f4f7fb;
    border-color: #cbd5e1;
  }

  .preview-primary-button {
    border: 1px solid #2563eb;
    background: #2563eb;
    color: #ffffff;
  }

  .preview-primary-button:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
    transform: translateY(-1px);
  }


  /* =====================================================
     RESPONSIVE
  ===================================================== */

  @media (max-width: 1150px) {
    .preview-config-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .preview-summary-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 750px) {
    .report-preview-page {
      padding: 20px 15px;
    }

    .preview-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .preview-download-button {
      width: 100%;
    }

    .preview-report-card {
      padding: 20px;
    }

    .preview-config-grid {
      grid-template-columns: 1fr;
    }

    .preview-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .preview-report-footer {
      align-items: flex-start;
      flex-direction: column;
    }

    .preview-actions {
      flex-direction: column;
    }

    .preview-regenerate-button,
    .preview-primary-button {
      width: 100%;
    }
  }

  @media (max-width: 450px) {
    .preview-summary-grid {
      grid-template-columns: 1fr;
    }

    .preview-report-heading {
      flex-direction: column;
    }
  }
`;


/* =========================================================
   INJECT STYLES
========================================================= */

if (
  typeof document !== "undefined" &&
  !document.getElementById("socialpilot-report-preview-styles")
) {
  const style = document.createElement("style");

  style.id = "socialpilot-report-preview-styles";
  style.innerHTML = reportPreviewStyles;

  document.head.appendChild(style);
}