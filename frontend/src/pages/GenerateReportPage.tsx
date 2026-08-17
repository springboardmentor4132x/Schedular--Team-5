import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Megaphone,
  Users,
  CalendarDays,
  Layers3,
  FileText,
  Download,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";

const reportTypes = [
  {
    value: "engagement",
    title: "Engagement Report",
    description:
      "Analyze likes, comments, shares, clicks, reach and engagement rate.",
    icon: BarChart3,
    iconClass: "purple",
  },
  {
    value: "campaign",
    title: "Campaign Report",
    description:
      "View complete campaign performance, reach, impressions and engagement.",
    icon: Megaphone,
    iconClass: "blue",
  },
  {
    value: "audience",
    title: "Audience Growth Report",
    description:
      "Track follower growth, demographics and audience trends.",
    icon: Users,
    iconClass: "green",
  },
  {
    value: "publishing",
    title: "Publishing Report",
    description:
      "Review scheduled, published, failed and cancelled posts.",
    icon: CalendarDays,
    iconClass: "orange",
  },
  {
    value: "platform",
    title: "Platform Comparison Report",
    description:
      "Compare performance across Facebook, Instagram, LinkedIn, X, YouTube and Pinterest.",
    icon: Layers3,
    iconClass: "indigo",
  },
];

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

  const selectedReport =
    reportTypes.find((report) => report.value === reportType) ||
    reportTypes[0];

  const SelectedIcon = selectedReport.icon;

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
    <div className="generate-report-page">
      {/* HEADER */}
      <section className="generate-report-header">
        <div className="generate-report-header-left">
          <button
            type="button"
            className="generate-back-button"
            onClick={() => navigate("/app/reports")}
          >
            <ArrowLeft size={17} />
          </button>

          <div className="generate-header-icon">
            <FileText size={24} />
          </div>

          <div>
            <h1>Generate Report</h1>

            <p>
              Customize your report and generate professional performance
              insights.
            </p>
          </div>
        </div>
      </section>

      {/* SELECTED REPORT */}
      <section className="selected-report-card">
        <div className={`selected-report-icon ${selectedReport.iconClass}`}>
          <SelectedIcon size={25} />
        </div>

        <div className="selected-report-content">
          <span>SELECTED REPORT</span>

          <h2>{selectedReport.title}</h2>

          <p>{selectedReport.description}</p>
        </div>

        <div className="selected-report-badge">
          REPORT
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="generate-report-layout">
        {/* FILTER CARD */}
        <div className="generate-form-card">
          <div className="generate-card-heading">
            <div className="generate-heading-icon">
              <SlidersHorizontal size={20} />
            </div>

            <div>
              <h2>Report Configuration</h2>

              <p>
                Select the data and filters you want to include in the report.
              </p>
            </div>
          </div>

          <div className="generate-form-grid">
            {/* REPORT TYPE */}
            <div className="generate-field">
              <label>Report Type</label>

              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="engagement">
                  Engagement Report
                </option>

                <option value="campaign">
                  Campaign Report
                </option>

                <option value="audience">
                  Audience Growth Report
                </option>

                <option value="publishing">
                  Publishing Report
                </option>

                <option value="platform">
                  Platform Comparison Report
                </option>
              </select>
            </div>

            {/* CAMPAIGN */}
            <div className="generate-field">
              <label>Campaign</label>

              <select
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              >
                <option value="all">All Campaigns</option>
                <option value="campaign-1">Campaign 1</option>
                <option value="campaign-2">Campaign 2</option>
              </select>
            </div>

            {/* PLATFORM */}
            <div className="generate-field">
              <label>Platform</label>

              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="all">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="x">X</option>
                <option value="youtube">YouTube</option>
                <option value="pinterest">Pinterest</option>
              </select>
            </div>

            {/* CONTENT TYPE */}
            <div className="generate-field">
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
            </div>

            {/* FROM DATE */}
            <div className="generate-field">
              <label>From Date</label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* TO DATE */}
            <div className="generate-field">
              <label>To Date</label>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* EXPORT FORMAT */}
            <div className="generate-field generate-field-full">
              <label>Export Format</label>

              <div className="format-options">
                <button
                  type="button"
                  className={`format-option ${
                    format === "PDF" ? "active" : ""
                  }`}
                  onClick={() => setFormat("PDF")}
                >
                  <FileText size={19} />

                  <div>
                    <strong>PDF</strong>
                    <span>Professional document</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`format-option ${
                    format === "Excel" ? "active" : ""
                  }`}
                  onClick={() => setFormat("Excel")}
                >
                  <Download size={19} />

                  <div>
                    <strong>Excel</strong>
                    <span>Data analysis workbook</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="generate-form-footer">
            <button
              type="button"
              className="generate-cancel-button"
              onClick={() => navigate("/app/reports")}
            >
              Cancel
            </button>

            <button
              type="button"
              className="generate-primary-button"
              onClick={handleGenerate}
            >
              <FileText size={18} />
              Generate Report
            </button>
          </div>
        </div>

        {/* SIDE INFO */}
        <div className="generate-info-column">
          <div className="generate-info-card">
            <div className="generate-info-icon">
              <BarChart3 size={21} />
            </div>

            <h3>Report Preview</h3>

            <p>
              After generating the report, you can preview the selected
              information before downloading it.
            </p>
          </div>

          <div className="generate-info-card">
            <div className="generate-info-icon green">
              <Download size={21} />
            </div>

            <h3>Export Formats</h3>

            <p>
              Export your report as PDF for presentation and sharing or Excel
              for additional data analysis.
            </p>
          </div>

          <div className="generate-info-card">
            <div className="generate-info-icon purple">
              <SlidersHorizontal size={21} />
            </div>

            <h3>Flexible Filters</h3>

            <p>
              Use campaign, platform, content type and date filters to
              customize the report data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


/* =========================================================
   GENERATE REPORT PAGE STYLES
   Same frontend design language as ReportsPage
========================================================= */

const generateReportStyles = `
  * {
    box-sizing: border-box;
  }

  .generate-report-page {
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

  .generate-report-header {
    width: 100%;
    margin-bottom: 24px;
  }

  .generate-report-header-left {
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .generate-back-button {
    width: 40px;
    height: 40px;
    border: 1px solid #e0e6ef;
    border-radius: 10px;
    background: #ffffff;
    color: #5f6b7d;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .generate-back-button:hover {
    background: #f0f5ff;
    color: #2563eb;
    border-color: #cbdaf5;
  }

  .generate-header-icon {
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

  .generate-report-header h1 {
    margin: 0;
    font-size: 29px;
    line-height: 1.2;
    font-weight: 750;
    color: #172033;
  }

  .generate-report-header p {
    margin: 7px 0 0;
    color: #7b8494;
    font-size: 14px;
  }


  /* =====================================================
     SELECTED REPORT
  ===================================================== */

  .selected-report-card {
    width: 100%;
    min-height: 105px;
    padding: 20px 22px;
    margin-bottom: 24px;
    background: #ffffff;
    border: 1px solid #e6eaf0;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(23, 32, 51, 0.025);
  }

  .selected-report-icon {
    width: 52px;
    height: 52px;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .selected-report-icon.purple {
    background: #f0edff;
    color: #6d4aff;
  }

  .selected-report-icon.blue {
    background: #eaf5ff;
    color: #2588df;
  }

  .selected-report-icon.green {
    background: #e9faf1;
    color: #16a765;
  }

  .selected-report-icon.orange {
    background: #fff4df;
    color: #ea8a15;
  }

  .selected-report-icon.indigo {
    background: #efedff;
    color: #5546d8;
  }

  .selected-report-content {
    flex: 1;
  }

  .selected-report-content > span {
    font-size: 9px;
    font-weight: 750;
    letter-spacing: 0.8px;
    color: #8a93a3;
  }

  .selected-report-content h2 {
    margin: 5px 0 0;
    font-size: 19px;
    line-height: 1.3;
    font-weight: 750;
    color: #202a3d;
  }

  .selected-report-content p {
    margin: 5px 0 0;
    font-size: 12px;
    color: #7d8799;
    line-height: 1.5;
  }

  .selected-report-badge {
    padding: 6px 10px;
    border-radius: 7px;
    background: #f4f7fb;
    color: #8a93a3;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.7px;
  }


  /* =====================================================
     MAIN LAYOUT
  ===================================================== */

  .generate-report-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 22px;
    align-items: start;
  }


  /* =====================================================
     FORM CARD
  ===================================================== */

  .generate-form-card {
    background: #ffffff;
    border: 1px solid #e6eaf0;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(23, 32, 51, 0.025);
  }

  .generate-card-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 20px;
    border-bottom: 1px solid #edf0f4;
  }

  .generate-heading-icon {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    background: #f0edff;
    color: #6d4aff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .generate-card-heading h2 {
    margin: 0;
    font-size: 17px;
    color: #202a3d;
    font-weight: 750;
  }

  .generate-card-heading p {
    margin: 5px 0 0;
    font-size: 11px;
    color: #8b94a3;
  }


  /* =====================================================
     FORM GRID
  ===================================================== */

  .generate-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    padding-top: 22px;
  }

  .generate-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .generate-field-full {
    grid-column: 1 / -1;
  }

  .generate-field label {
    font-size: 12px;
    font-weight: 700;
    color: #465166;
  }

  .generate-field select,
  .generate-field input {
    width: 100%;
    height: 42px;
    padding: 0 12px;
    border: 1px solid #dfe4ec;
    border-radius: 9px;
    background: #ffffff;
    color: #273248;
    font-size: 12px;
    outline: none;
    transition: 0.2s ease;
  }

  .generate-field select {
    cursor: pointer;
  }

  .generate-field select:focus,
  .generate-field input:focus {
    border-color: #8eb3f5;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }


  /* =====================================================
     FORMAT OPTIONS
  ===================================================== */

  .format-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .format-option {
    min-height: 68px;
    padding: 12px 14px;
    border: 1px solid #e0e5ed;
    border-radius: 10px;
    background: #ffffff;
    color: #566176;
    display: flex;
    align-items: center;
    gap: 11px;
    text-align: left;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .format-option:hover {
    border-color: #b9cef5;
    background: #f8fbff;
  }

  .format-option.active {
    border-color: #2563eb;
    background: #f2f7ff;
    color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.07);
  }

  .format-option svg {
    flex-shrink: 0;
  }

  .format-option div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .format-option strong {
    font-size: 12px;
    color: #273248;
  }

  .format-option.active strong {
    color: #2563eb;
  }

  .format-option span {
    font-size: 10px;
    color: #8a93a3;
  }


  /* =====================================================
     FOOTER ACTIONS
  ===================================================== */

  .generate-form-footer {
    margin-top: 25px;
    padding-top: 18px;
    border-top: 1px solid #edf0f4;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  .generate-cancel-button {
    height: 41px;
    padding: 0 17px;
    border: 1px solid #dfe4ec;
    border-radius: 9px;
    background: #ffffff;
    color: #657084;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .generate-cancel-button:hover {
    background: #f7f9fc;
    border-color: #cbd2de;
  }

  .generate-primary-button {
    height: 41px;
    padding: 0 18px;
    border: none;
    border-radius: 9px;
    background: #2563eb;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .generate-primary-button:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }


  /* =====================================================
     INFO CARDS
  ===================================================== */

  .generate-info-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .generate-info-card {
    padding: 20px;
    background: #ffffff;
    border: 1px solid #e6eaf0;
    border-radius: 15px;
    box-shadow: 0 2px 8px rgba(23, 32, 51, 0.025);
  }

  .generate-info-icon {
    width: 42px;
    height: 42px;
    margin-bottom: 15px;
    border-radius: 11px;
    background: #eaf5ff;
    color: #2588df;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .generate-info-icon.green {
    background: #e9faf1;
    color: #16a765;
  }

  .generate-info-icon.purple {
    background: #f0edff;
    color: #6d4aff;
  }

  .generate-info-card h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 750;
    color: #29334a;
  }

  .generate-info-card p {
    margin: 7px 0 0;
    font-size: 11px;
    line-height: 1.6;
    color: #7d8799;
  }


  /* =====================================================
     RESPONSIVE
  ===================================================== */

  @media (max-width: 1050px) {
    .generate-report-layout {
      grid-template-columns: 1fr;
    }

    .generate-info-column {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 800px) {
    .generate-report-page {
      padding: 20px 15px;
    }

    .generate-form-grid {
      grid-template-columns: 1fr;
    }

    .generate-field-full {
      grid-column: auto;
    }

    .format-options {
      grid-template-columns: 1fr;
    }

    .generate-info-column {
      grid-template-columns: 1fr;
    }

    .selected-report-card {
      align-items: flex-start;
    }

    .selected-report-badge {
      display: none;
    }

    .generate-form-footer {
      flex-direction: column-reverse;
    }

    .generate-cancel-button,
    .generate-primary-button {
      width: 100%;
    }
  }
`;

/* =========================================================
   INJECT STYLES
========================================================= */

if (
  typeof document !== "undefined" &&
  !document.getElementById("socialpilot-generate-report-styles")
) {
  const style = document.createElement("style");

  style.id = "socialpilot-generate-report-styles";
  style.innerHTML = generateReportStyles;

  document.head.appendChild(style);
}
