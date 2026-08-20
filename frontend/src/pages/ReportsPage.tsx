import { useState } from 'react';

import {
  FileText,
  Download,
  FileSpreadsheet,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import { api } from '../services/api';


/* =========================================================
   SUPPORTED PLATFORMS

   IMPORTANT:
   Backend uses "x" for X / Twitter.
   The UI displays "X (Twitter)".
========================================================= */

type Platform =
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'x'
  | 'pinterest';


const platforms: {
  value: Platform;
  label: string;
}[] = [
  {
    value: 'facebook',
    label: 'Facebook',
  },
  {
    value: 'instagram',
    label: 'Instagram',
  },
  {
    value: 'youtube',
    label: 'YouTube',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
  },
  {
    value: 'x',
    label: 'X (Twitter)',
  },
  {
    value: 'pinterest',
    label: 'Pinterest',
  },
];


export function ReportsPage() {

  const [platform, setPlatform] =
    useState<Platform>('facebook');


  const [loadingType, setLoadingType] =
    useState<'pdf' | 'excel' | null>(null);


  const [message, setMessage] =
    useState<string>('');


  const [error, setError] =
    useState<string>('');


  /* =========================================================
     DOWNLOAD REPORT
  ========================================================= */

  const downloadReport = async (
    type: 'pdf' | 'excel'
  ) => {

    try {

      setLoadingType(type);

      setMessage('');

      setError('');


      const response = await api.get(
        `/reports/export/${platform}/${type}`,
        {
          responseType: 'blob',
        }
      );


      /*
        IMPORTANT:

        The backend currently returns:
        - PDF for /pdf
        - CSV data for /excel

        Therefore the Excel endpoint is currently
        downloaded as CSV.
      */

      const isPdf =
        type === 'pdf';


      const blob = new Blob(
        [response.data],
        {
          type: isPdf
            ? 'application/pdf'
            : 'text/csv',
        }
      );


      const url =
        window.URL.createObjectURL(blob);


      const link =
        document.createElement('a');


      link.href = url;


      /*
        Use .csv for the current backend implementation.

        If we later change the backend to generate
        a real .xlsx file, this can be changed to .xlsx.
      */

      link.download =
        `${platform}-report.${
          isPdf
            ? 'pdf'
            : 'csv'
        }`;


      document.body.appendChild(link);


      link.click();


      link.remove();


      window.URL.revokeObjectURL(url);


      const selectedPlatform =
        platforms.find(
          (item) =>
            item.value === platform
        )?.label || platform;


      setMessage(
        `${selectedPlatform} ${
          isPdf
            ? 'PDF'
            : 'Excel/CSV'
        } report downloaded successfully.`
      );

    } catch (err) {

      console.error(
        'Report download error:',
        err
      );


      setError(
        `Unable to download the ${
          type === 'pdf'
            ? 'PDF'
            : 'Excel'
        } report. Please make sure the report data is available.`
      );

    } finally {

      setLoadingType(null);

    }
  };


  return (

    <div className="space-y-6">


      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <h1 className="text-2xl font-bold text-gray-900">
          Reports
        </h1>


        <p className="mt-1 text-sm text-gray-500">
          Generate and download social media performance reports.
        </p>

      </div>


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {message && (

        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />


          <p className="text-sm text-emerald-700">
            {message}
          </p>

        </div>

      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (

        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />


          <p className="text-sm text-red-700">
            {error}
          </p>

        </div>

      )}


      {/* =================================================
          REPORT GENERATOR
      ================================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">


        <div className="flex items-center gap-3 mb-6">

          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">

            <BarChart3 className="w-5 h-5 text-indigo-600" />

          </div>


          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Generate Report
            </h2>


            <p className="text-sm text-gray-500">
              Select a platform and download its report.
            </p>

          </div>

        </div>


        {/* =================================================
            PLATFORM SELECTOR
        ================================================= */}

        <div className="mb-6">

          <label
            htmlFor="platform"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Social Media Platform
          </label>


          <select
            id="platform"
            value={platform}
            onChange={(event) =>
              setPlatform(
                event.target.value as Platform
              )
            }
            className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
          >

            {platforms.map(
              (item) => (

                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>

              )
            )}

          </select>

        </div>


        {/* =================================================
            DOWNLOAD OPTIONS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


          {/* =================================================
              PDF
          ================================================= */}

          <div className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">

                <FileText className="w-5 h-5 text-red-600" />

              </div>


              <div className="flex-1 min-w-0">

                <h3 className="font-semibold text-gray-900">
                  PDF Report
                </h3>


                <p className="mt-1 text-sm text-gray-500">

                  Download a PDF report for{' '}

                  <span className="font-medium text-gray-700">

                    {
                      platforms.find(
                        (item) =>
                          item.value === platform
                      )?.label
                    }

                  </span>

                  .

                </p>


                <button
                  type="button"
                  onClick={() =>
                    downloadReport('pdf')
                  }
                  disabled={
                    loadingType !== null
                  }
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >

                  <Download className="w-4 h-4" />


                  {loadingType === 'pdf'
                    ? 'Downloading...'
                    : 'Download PDF'}

                </button>

              </div>

            </div>

          </div>


          {/* =================================================
              EXCEL / CSV
          ================================================= */}

          <div className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">

                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />

              </div>


              <div className="flex-1 min-w-0">

                <h3 className="font-semibold text-gray-900">
                  Excel Report
                </h3>


                <p className="mt-1 text-sm text-gray-500">

                  Download an Excel report for{' '}

                  <span className="font-medium text-gray-700">

                    {
                      platforms.find(
                        (item) =>
                          item.value === platform
                      )?.label
                    }

                  </span>

                  .

                </p>


                <button
                  type="button"
                  onClick={() =>
                    downloadReport('excel')
                  }
                  disabled={
                    loadingType !== null
                  }
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >

                  <Download className="w-4 h-4" />


                  {loadingType === 'excel'
                    ? 'Downloading...'
                    : 'Download Excel'}

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          AVAILABLE PLATFORMS
      ================================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">


        <div className="flex items-center gap-2 mb-5">

          <FileText className="w-5 h-5 text-indigo-600" />


          <h2 className="text-lg font-semibold text-gray-900">
            Available Reports
          </h2>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">


          {platforms.map(
            (item) => (

              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setPlatform(item.value)
                }
                className={`text-left rounded-xl border p-4 transition-all ${
                  platform === item.value
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-gray-900">
                      {item.label}
                    </p>


                    <p className="mt-1 text-xs text-gray-500">
                      PDF & Excel
                    </p>

                  </div>


                  <FileText className="w-5 h-5 text-indigo-500" />

                </div>

              </button>

            )
          )}

        </div>

      </div>

    </div>

  );
}


export default ReportsPage;