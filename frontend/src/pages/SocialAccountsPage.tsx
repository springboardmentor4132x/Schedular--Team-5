<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { accountService } from "../services/api";

type Platform = {
  id: number;
  name: string;
  description: string;
  icon: string;
  key: string;
};

type Account = {
  id: string | number;
  platform?: string;
  name?: string;
  username?: string;
  followers?: number;
  connected?: boolean;
};

const PLATFORMS: Platform[] = [
  {
    id: 1,
    name: "Facebook",
    description: "Connect your Facebook account",
    icon: "f",
    key: "facebook",
  },
  {
    id: 2,
    name: "Instagram",
    description: "Connect your Instagram account",
    icon: "◎",
    key: "instagram",
  },
  {
    id: 3,
    name: "LinkedIn",
    description: "Connect your LinkedIn account",
    icon: "in",
    key: "linkedin",
  },
  {
    id: 4,
    name: "X / Twitter",
    description: "Connect your X account",
    icon: "𝕏",
    key: "twitter",
  },
  {
    id: 5,
    name: "YouTube",
    description: "Connect your YouTube account",
    icon: "▶",
    key: "youtube",
  },
];

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<
    string | number | null
  >(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await accountService.getAll();
      const data = response.data;

      if (Array.isArray(data)) {
        setAccounts(data);
      } else if (Array.isArray(data?.accounts)) {
        setAccounts(data.accounts);
      } else if (Array.isArray(data?.data)) {
        setAccounts(data.data);
      } else {
        setAccounts([]);
      }
    } catch (error: any) {
      console.error("Failed to load accounts:", error);
      console.error("Status:", error?.response?.status);
      console.error("Response:", error?.response?.data);

      setAccounts([]);

      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error;

      setMessage(
        backendMessage
          ? `Unable to load accounts: ${backendMessage}`
          : "Unable to load connected accounts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, []);

  const filteredPlatforms = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return PLATFORMS;
    }

    return PLATFORMS.filter((platform) =>
      platform.name.toLowerCase().includes(value)
    );
  }, [search]);

  const getAccountForPlatform = (
    platformKey: string
  ): Account | undefined => {
    return accounts.find((account) => {
      const accountPlatform = String(
        account.platform ?? ""
      )
        .trim()
        .toLowerCase();

      if (platformKey === "twitter") {
        return (
          accountPlatform === "twitter" ||
          accountPlatform === "x"
        );
      }

      return accountPlatform === platformKey;
    });
  };

  const connectPlatform = async (platform: Platform) => {
    try {
      setConnecting(platform.key);
      setMessage("");

      const response = await accountService.connect(
        platform.key
      );

      const data = response.data;

      const authUrl =
        data?.authorization_url ??
        data?.auth_url ??
        data?.redirect_url ??
        data?.url;

      if (authUrl) {
        window.location.href = authUrl;
        return;
      }

      setMessage(
        `${platform.name} connection request completed.`
      );

      await loadAccounts();
    } catch (error: any) {
      console.error(
        `Failed to connect ${platform.name}:`,
        error
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error;

      setMessage(
        backendMessage
          ? `${platform.name} connection failed: ${backendMessage}`
          : `${platform.name} connection failed.`
      );
=======
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Plus,
  Trash2,
  RefreshCw,
  Check,
  X,
  Users,
  FileText,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  AlertCircle,
} from 'lucide-react';

import {
  Card,
  Badge,
  Modal,
  Button,
  EmptyState,
} from '../components/ui';

import {
  accountService,
} from '../services/api';

import {
  formatNumber,
  cn,
} from '../utils/helpers';


type SocialAccount = {
  id: number | string;
  platform: string;
  account_id?: string;
  handle?: string;
  username?: string;
  account_name?: string;
  name?: string;
  followers?: number;
  posts?: number;
  is_connected?: boolean;
};


const availablePlatforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    desc: 'Connect your Facebook Pages',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E1306C',
    desc: 'Connect your Instagram Business',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: '#1DA1F2',
    desc: 'Connect your Twitter account',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    desc: 'Connect your LinkedIn Pages',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    desc: 'Connect your YouTube channel',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: Globe,
    color: '#E60023',
    desc: 'Connect your Pinterest account',
  },
];


export function SocialAccountsPage() {
  const [accounts, setAccounts] =
    useState<SocialAccount[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [showConnect, setShowConnect] =
    useState(false);

  const [connecting, setConnecting] =
    useState<string | null>(null);

  const [
    disconnectTarget,
    setDisconnectTarget,
  ] = useState<string | number | null>(
    null
  );

  const [error, setError] =
    useState<string | null>(null);


  /* =========================================================
     LOAD CONNECTED ACCOUNTS
  ========================================================= */

  const loadAccounts = async () => {
    try {
      setError(null);

      const response =
        await accountService.getAll();

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.items ||
          response.data?.accounts ||
          [];

      const connectedOnly =
        data.filter(
          (account: SocialAccount) =>
            account.is_connected === true
        );

      setAccounts(connectedOnly);

    } catch (err: any) {
      console.error(
        'Failed to load social accounts:',
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to load social accounts from the backend.'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadAccounts();
  }, []);


  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccounts();
  };


  /* =========================================================
     CONNECT ACCOUNT
  ========================================================= */

  const handleConnect = async (
    platformId: string
  ) => {
    try {
      setConnecting(platformId);
      setError(null);

      /*
       * IMPORTANT:
       *
       * LinkedIn MUST be started through Axios.
       *
       * Do NOT use:
       *
       * window.location.href =
       *   'http://127.0.0.1:8000/linkedin/login';
       *
       * because that browser request does not contain
       * the JWT Authorization header.
       *
       * accountService.linkedinLogin() uses Axios and
       * api.ts automatically attaches:
       *
       * Authorization: Bearer <token>
       */

      if (platformId === 'linkedin') {

        const response =
          await accountService.linkedinLogin();

        const authUrl =
          response.data?.url ||
          response.data?.auth_url ||
          response.data?.redirect_url;

        if (!authUrl) {
          throw new Error(
            'LinkedIn authorization URL was not returned by the backend.'
          );
        }

        /*
         * Now that the authenticated API request has
         * successfully returned the LinkedIn OAuth URL,
         * it is safe to redirect the browser to LinkedIn.
         */
        window.location.assign(authUrl);

        return;
      }


      /* =====================================================
         OTHER PLATFORMS
      ===================================================== */

      let response;

      if (platformId === 'facebook') {

        response =
          await accountService.facebookLogin();

      } else if (platformId === 'instagram') {

        response =
          await accountService.instagramLogin();

      } else if (platformId === 'youtube') {

        response =
          await accountService.youtubeLogin();

      } else if (platformId === 'twitter') {

        response =
          await accountService.twitterLogin();

      } else if (platformId === 'pinterest') {

        response =
          await accountService.pinterestLogin();

      } else {

        setError(
          `${platformId} integration is not connected to the backend yet.`
        );

        return;
      }


      const authUrl =
        response.data?.url ||
        response.data?.auth_url ||
        response.data?.redirect_url;


      if (authUrl) {

        window.location.assign(authUrl);

        return;
      }


      if (
        typeof response.data ===
        'string'
      ) {

        window.location.assign(
          response.data
        );

        return;
      }


      throw new Error(
        `${platformId} login URL was not returned by the backend.`
      );

    } catch (err: any) {

      console.error(
        `Failed to connect ${platformId}:`,
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          `Failed to connect ${platformId}.`
      );

>>>>>>> origin/shravanik-latest-scheduler
    } finally {
      setConnecting(null);
    }
  };

<<<<<<< HEAD
  const disconnectAccount = async (
    account: Account,
    platformName: string
  ) => {
    try {
      setDisconnecting(account.id);
      setMessage("");

      await accountService.disconnect(
        String(account.id)
      );

      setMessage(
        `${platformName} disconnected successfully.`
      );

      await loadAccounts();
    } catch (error: any) {
      console.error(
        `Failed to disconnect ${platformName}:`,
        error
      );

      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error;

      setMessage(
        backendMessage
          ? `${platformName} disconnect failed: ${backendMessage}`
          : `${platformName} disconnect failed.`
      );
    } finally {
      setDisconnecting(null);
    }
  };

  const refreshAccounts = async () => {
    await loadAccounts();
    setMessage("Accounts refreshed successfully.");
  };

  const connectAccount = () => {
    const searchBox =
      document.getElementById("platform-search");

    if (searchBox instanceof HTMLInputElement) {
      searchBox.focus();
    }

    setMessage(
      "Choose a platform below to connect your account."
    );
  };

  const goBack = () => {
    window.history.back();
  };

  const connectedCount = PLATFORMS.filter((platform) =>
    Boolean(getAccountForPlatform(platform.key))
  ).length;

  const availableCount =
    PLATFORMS.length - connectedCount;

  return (

    <div className="sa-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        button,
        input {
          font-family: inherit;
        }

        button {
          cursor: pointer;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .sa-page {
          min-height: 100vh;
          background: #f4f7fb;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .sa-header {
          background: #ffffff;
          border-bottom: 1px solid #e5eaf2;
          padding: 22px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .sa-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .sa-back {
          width: 40px;
          height: 40px;
          border: 1px solid #d9e2ef;
          background: #ffffff;
          border-radius: 9px;
          font-size: 22px;
          color: #334155;
        }

        .sa-back:hover {
          background: #eff6ff;
          color: #2563eb;
        }

        .sa-logo {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #2563eb;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
        }

        .sa-title {
          margin: 0;
          font-size: 25px;
          font-weight: 800;
          color: #111827;
        }

        .sa-subtitle {
          margin: 5px 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .sa-actions {
          display: flex;
          gap: 10px;
        }

        .sa-button,
        .sa-primary {
          min-height: 42px;
          padding: 0 16px;
          border-radius: 9px;
          font-weight: 700;
        }

        .sa-button {
          border: 1px solid #d9e2ef;
          background: #ffffff;
          color: #334155;
        }

        .sa-button:hover {
          background: #eff6ff;
          border-color: #2563eb;
          color: #2563eb;
        }

        .sa-primary {
          border: 1px solid #2563eb;
          background: #2563eb;
          color: #ffffff;
        }

        .sa-primary:hover {
          background: #1d4ed8;
        }

        .sa-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px;
        }

        .sa-summary {
          background: linear-gradient(
            135deg,
            #1d4ed8,
            #2563eb
          );
          border-radius: 17px;
          padding: 28px;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.18);
        }

        .sa-summary-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sa-summary-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
        }

        .sa-summary-title {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
        }

        .sa-summary-text {
          margin: 6px 0 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
        }

        .sa-stats {
          display: flex;
          gap: 28px;
        }

        .sa-stat {
          text-align: right;
        }

        .sa-stat span {
          display: block;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 4px;
        }

        .sa-stat strong {
          font-size: 25px;
        }

        .sa-content {
          margin-top: 24px;
          background: #ffffff;
          border: 1px solid #e5eaf2;
          border-radius: 17px;
          padding: 28px;
        }

        .sa-content-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .sa-section-title {
          margin: 0;
          font-size: 21px;
          color: #111827;
          font-weight: 800;
        }

        .sa-section-text {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .sa-search {
          width: 300px;
          height: 44px;
          display: flex;
          align-items: center;
          border: 1px solid #d9e2ef;
          border-radius: 9px;
          padding: 0 13px;
          background: #ffffff;
        }

        .sa-search:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .sa-search-icon {
          color: #64748b;
          margin-right: 8px;
          font-size: 18px;
        }

        .sa-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 14px;
        }

        .sa-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .sa-card {
          border: 1px solid #e1e7f0;
          border-radius: 14px;
          padding: 20px;
          min-height: 215px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          transition: 0.2s ease;
        }

        .sa-card:hover {
          border-color: #93c5fd;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.07);
        }

        .sa-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sa-platform-icon {
          width: 46px;
          height: 46px;
          border-radius: 11px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          font-weight: 800;
        }

        .sa-status {
          padding: 6px 9px;
          border-radius: 20px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
        }

        .sa-status-connected {
          background: #ecfdf5;
          color: #047857;
        }

        .sa-card-info {
          margin-top: 19px;
        }

        .sa-platform-name {
          margin: 0;
          font-size: 18px;
          color: #111827;
          font-weight: 800;
        }

        .sa-platform-description {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }

        .sa-card-footer {
          margin-top: auto;
          padding-top: 17px;
          border-top: 1px solid #edf1f6;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
        }

        .sa-account-info {
          min-width: 0;
        }

        .sa-followers-label {
          display: block;
          color: #94a3b8;
          font-size: 11px;
          margin-bottom: 3px;
        }

        .sa-followers {
          font-size: 15px;
          color: #334155;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 170px;
        }

        .sa-connect {
          min-height: 36px;
          padding: 0 13px;
          border-radius: 8px;
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 800;
        }

        .sa-connect:hover {
          background: #2563eb;
          border-color: #2563eb;
          color: #ffffff;
        }

        .sa-connect-connected {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #047857;
        }

        .sa-connect-connected:hover {
          background: #059669;
          border-color: #059669;
          color: #ffffff;
        }

        .sa-message {
          margin-top: 20px;
          padding: 13px 15px;
          border-radius: 9px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 700;
        }

        .sa-secure {
          margin-top: 22px;
          padding: 17px;
          border-radius: 12px;
          border: 1px solid #dbeafe;
          background: #f8fbff;
          display: flex;
          gap: 12px;
        }

        .sa-secure-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          border-radius: 8px;
          background: #dbeafe;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .sa-secure-title {
          margin: 0;
          color: #1e3a8a;
          font-size: 14px;
          font-weight: 800;
        }

        .sa-secure-text {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }

        .sa-empty {
          padding: 40px;
          text-align: center;
          color: #64748b;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
        }

        @media (max-width: 1000px) {
          .sa-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .sa-summary {
            flex-direction: column;
            align-items: flex-start;
          }

          .sa-stat {
            text-align: left;
          }
        }

        @media (max-width: 700px) {
          .sa-header {
            padding: 18px;
            flex-direction: column;
            align-items: flex-start;
          }

          .sa-actions {
            width: 100%;
          }

          .sa-actions button {
            flex: 1;
          }

          .sa-container {
            padding: 18px;
          }

          .sa-content {
            padding: 18px;
          }

          .sa-content-header {
            flex-direction: column;
            align-items: stretch;
          }

          .sa-search {
            width: 100%;
          }

          .sa-grid {
            grid-template-columns: 1fr;
          }

          .sa-stats {
            width: 100%;
            justify-content: space-between;
            gap: 10px;
          }

          .sa-stat {
            text-align: left;
          }
        }
      `}</style>

      <header className="sa-header">
        <div className="sa-header-left">
          <button
            type="button"
            className="sa-back"
            onClick={goBack}
            aria-label="Go back"
          >
            ←
          </button>

          <div className="sa-logo">S</div>

          <div>
            <h1 className="sa-title">
              Social Accounts
            </h1>

            <p className="sa-subtitle">
              Connect and manage your social media accounts.
            </p>
          </div>
        </div>

        <div className="sa-actions">
          <button
            type="button"
            className="sa-button"
            onClick={refreshAccounts}
            disabled={loading}
          >
            ↻ {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="sa-primary"
            onClick={connectAccount}
          >
            + Connect Account
          </button>
        </div>
      </header>

      <main className="sa-container">
        <section className="sa-summary">
          <div className="sa-summary-left">
            <div className="sa-summary-icon">
              ◎
            </div>

            <div>
              <h2 className="sa-summary-title">
                Your Social Accounts
              </h2>

              <p className="sa-summary-text">
                Connect your social platforms to publish,
                schedule and monitor your content.
              </p>
            </div>
          </div>

          <div className="sa-stats">
            <div className="sa-stat">
              <span>Total Platforms</span>
              <strong>{PLATFORMS.length}</strong>
            </div>

            <div className="sa-stat">
              <span>Connected</span>
              <strong>{connectedCount}</strong>
            </div>

            <div className="sa-stat">
              <span>Available</span>
              <strong>{availableCount}</strong>
            </div>
          </div>
        </section>

        <section className="sa-content">
          <div className="sa-content-header">
            <div>
              <h2 className="sa-section-title">
                Available Platforms
              </h2>

              <p className="sa-section-text">
                Choose a platform below to connect your
                social media account.
              </p>
            </div>

            <div className="sa-search">
              <span className="sa-search-icon">
                ⌕
              </span>

              <input
                id="platform-search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search platforms..."
              />
            </div>
          </div>

          {loading ? (
            <div className="sa-empty">
              Loading connected accounts...
            </div>
          ) : filteredPlatforms.length === 0 ? (
            <div className="sa-empty">
              No platforms found.
            </div>
          ) : (
            <div className="sa-grid">

            

            {filteredPlatforms.map((platform) => {
                const account =
                  getAccountForPlatform(platform.key);

                const isConnected =
                  Boolean(account);

                const isConnecting =
                  connecting === platform.key;

                const isDisconnecting =
                  account &&
                  disconnecting === account.id;

                return (
                  <article
                    className="sa-card"
                    key={platform.id}
                  >
                    <div className="sa-card-top">
                      <div className="sa-platform-icon">
                        {platform.icon}
                      </div>

                      <span
                        className={
                          isConnected
                            ? "sa-status sa-status-connected"
                            : "sa-status"
                        }
                      >
                        {isConnected
                          ? "CONNECTED"
                          : "NOT CONNECTED"}
                      </span>
                    </div>

                    <div className="sa-card-info">
                      <h3 className="sa-platform-name">
                        {platform.name}
                      </h3>

                      <p className="sa-platform-description">
                        {platform.description}
                      </p>
                    </div>

                    <div className="sa-card-footer">
                      <div className="sa-account-info">
                        <span className="sa-followers-label">
                          {isConnected
                            ? "Account"
                            : "Status"}
                        </span>

                        <span className="sa-followers">
                          {isConnected
                            ? account?.username ||
                              account?.name ||
                              "Connected account"
                            : "Ready to connect"}
                        </span>
                      </div>

                      {isConnected && account ? (
                        <button
                          type="button"
                          className="sa-connect sa-connect-connected"
                          disabled={Boolean(
                            isDisconnecting
                          )}
                          onClick={() =>
                            void disconnectAccount(
                              account,
                              platform.name
                            )
                          }
                        >
                          {isDisconnecting
                            ? "Disconnecting..."
                            : "Disconnect"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="sa-connect"
                          disabled={
                            connecting !== null
                          }
                          onClick={() =>
                            void connectPlatform(
                              platform
                            )
                          }
                        >
                          {isConnecting
                            ? "Connecting..."
                            : "Connect"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {message && (
            <div className="sa-message">
              {message}
            </div>
          )}

          <div className="sa-secure">
            <div className="sa-secure-icon">
              🔒
            </div>

            <div>
              <h3 className="sa-secure-title">
                Your accounts are secure
              </h3>

              <p className="sa-secure-text">
                We use secure authentication to connect
                your social media accounts. Your password
                is never stored by this application.
              </p>
            </div>
          </div>
        </section>
      </main>
=======

  /* =========================================================
     DISCONNECT ACCOUNT
  ========================================================= */

  const handleDisconnect = async () => {

    if (
      disconnectTarget === null
    ) {
      return;
    }

    try {

      setError(null);

      /*
       * This calls:
       *
       * DELETE /social-accounts/{account_id}
       *
       * with the JWT automatically attached by Axios.
       */

      await accountService.delete(
        disconnectTarget
      );

      setDisconnectTarget(null);

      /*
       * Reload accounts after disconnect.
       */
      await loadAccounts();

    } catch (err: any) {

      console.error(
        'Failed to disconnect account:',
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to disconnect the social account.'
      );
    }
  };


  /* =========================================================
     CONNECTED ACCOUNTS
  ========================================================= */

  const connectedAccounts =
    accounts.filter(
      (account) =>
        account.is_connected === true
    );


  const connectedPlatformIds =
    new Set(
      connectedAccounts.map(
        (account) =>
          account.platform?.toLowerCase()
      )
    );


  const disconnectedPlatforms =
    availablePlatforms.filter(
      (platform) =>
        !connectedPlatformIds.has(
          platform.id
        )
    );


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalFollowers =
    connectedAccounts.reduce(
      (sum, account) =>
        sum +
        Number(
          account.followers || 0
        ),
      0
    );


  const totalPosts =
    connectedAccounts.reduce(
      (sum, account) =>
        sum +
        Number(
          account.posts || 0
        ),
      0
    );


  /* =========================================================
     DISPLAY HELPERS
  ========================================================= */

  const getAccountDisplayName = (
    account: SocialAccount
  ) => {

    return (
      account.handle ||
      account.username ||
      account.account_name ||
      account.name ||
      'Connected account'
    );
  };


  const getPlatformDetails = (
    platformId: string
  ) => {

    return (
      availablePlatforms.find(
        (platform) =>
          platform.id ===
          platformId?.toLowerCase()
      ) || {
        id: platformId,
        name: platformId,
        icon: Globe,
        color: '#6366F1',
        desc: 'Connected social account',
      }
    );
  };


  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Social Accounts
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your connected social media platforms
          </p>

        </div>

        <Button
          icon={
            <Plus className="w-4 h-4" />
          }
          onClick={() =>
            setShowConnect(true)
          }
        >
          Connect Account
        </Button>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">

          <div className="flex items-start gap-2">

            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />

            <p className="text-sm text-red-600">
              {error}
            </p>

          </div>

        </div>
      )}


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {[
          {
            label: 'Connected Accounts',
            value:
              connectedAccounts.length,
            icon: Check,
            color:
              'from-emerald-500 to-teal-500',
          },
          {
            label: 'Total Followers',
            value:
              formatNumber(
                totalFollowers
              ),
            icon: Users,
            color:
              'from-indigo-500 to-violet-500',
          },
          {
            label: 'Total Posts',
            value: totalPosts,
            icon: FileText,
            color:
              'from-amber-500 to-orange-500',
          },
        ].map(
          (stat, idx) => (

            <motion.div
              key={stat.label}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: idx * 0.1,
              }}
            >

              <Card className="p-5 flex items-center gap-4">

                <div
                  className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                    stat.color
                  )}
                >

                  <stat.icon className="w-6 h-6 text-white" />

                </div>

                <div>

                  <p className="text-2xl font-bold text-gray-900">
                    {loading
                      ? '...'
                      : stat.value}
                  </p>

                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>

                </div>

              </Card>

            </motion.div>

          )
        )}

      </div>


      {/* =====================================================
          CONNECTED ACCOUNTS
      ===================================================== */}

      <div>

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-lg font-semibold text-gray-900">
            Connected Accounts
          </h2>

          <Button
            variant="secondary"
            size="sm"
            icon={
              <RefreshCw
                className={cn(
                  'w-3.5 h-3.5',
                  refreshing &&
                    'animate-spin'
                )}
              />
            }
            onClick={
              handleRefresh
            }
            loading={refreshing}
          >
            Refresh
          </Button>

        </div>


        {loading ? (

          <Card className="p-8">

            <div className="flex items-center justify-center">

              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />

              <span className="ml-3 text-sm text-gray-500">
                Loading connected accounts...
              </span>

            </div>

          </Card>

        ) : connectedAccounts.length ===
          0 ? (

          <Card className="p-0">

            <EmptyState
              icon={
                <AlertCircle className="w-8 h-8" />
              }
              title="No accounts connected"
              description="Connect your social media accounts to start scheduling posts and tracking analytics."
              action={
                <Button
                  icon={
                    <Plus className="w-4 h-4" />
                  }
                  onClick={() =>
                    setShowConnect(
                      true
                    )
                  }
                >
                  Connect Account
                </Button>
              }
            />

          </Card>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <AnimatePresence>

              {connectedAccounts.map(
                (
                  account,
                  idx
                ) => {

                  const config =
                    getPlatformDetails(
                      account.platform
                    );

                  const Icon =
                    config.icon;

                  return (

                    <motion.div
                      key={account.id}
                      layout
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      transition={{
                        delay:
                          idx * 0.08,
                      }}
                    >

                      <Card
                        hover
                        className="p-5 h-full"
                      >

                        <div className="flex items-start justify-between mb-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                              style={{
                                backgroundColor:
                                  config.color,
                              }}
                            >

                              <Icon className="w-5 h-5" />

                            </div>

                            <div>

                              <p className="text-sm font-semibold text-gray-900">
                                {
                                  config.name
                                }
                              </p>

                              <p className="text-xs text-gray-500">
                                {getAccountDisplayName(
                                  account
                                )}
                              </p>

                            </div>

                          </div>

                          <Badge
                            variant="success"
                            dot
                          >
                            Connected
                          </Badge>

                        </div>


                        <div className="grid grid-cols-2 gap-3 mb-4">

                          <div className="p-3 bg-gray-50 rounded-xl">

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">

                              <Users className="w-3.5 h-3.5" />

                              Followers

                            </div>

                            <p className="text-lg font-bold text-gray-900">

                              {formatNumber(
                                Number(
                                  account.followers ||
                                    0
                                )
                              )}

                            </p>

                          </div>


                          <div className="p-3 bg-gray-50 rounded-xl">

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">

                              <FileText className="w-3.5 h-3.5" />

                              Posts

                            </div>

                            <p className="text-lg font-bold text-gray-900">

                              {Number(
                                account.posts ||
                                  0
                              )}

                            </p>

                          </div>

                        </div>


                        <div className="flex items-center gap-2">

                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            icon={
                              <RefreshCw className="w-3.5 h-3.5" />
                            }
                            onClick={
                              handleRefresh
                            }
                            loading={
                              refreshing
                            }
                          >
                            Refresh
                          </Button>


                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setDisconnectTarget(
                                account.id
                              )
                            }
                            icon={
                              <Trash2 className="w-3.5 h-3.5" />
                            }
                          >
                            Disconnect
                          </Button>

                        </div>

                      </Card>

                    </motion.div>

                  );
                }
              )}

            </AnimatePresence>

          </div>

        )}

      </div>


      {/* =====================================================
          AVAILABLE PLATFORMS
      ===================================================== */}

      {disconnectedPlatforms.length >
        0 && (

        <div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Platforms
          </h2>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {disconnectedPlatforms.map(
              (
                platform,
                idx
              ) => (

                <motion.div
                  key={platform.id}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      idx * 0.08,
                  }}
                >

                  <Card
                    hover
                    className="p-5 h-full flex items-center gap-4"
                  >

                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        backgroundColor:
                          platform.color,
                      }}
                    >

                      <platform.icon className="w-5 h-5" />

                    </div>


                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-semibold text-gray-900">
                        {platform.name}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {platform.desc}
                      </p>

                    </div>


                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleConnect(
                          platform.id
                        )
                      }
                      loading={
                        connecting ===
                        platform.id
                      }
                    >
                      {connecting ===
                      platform.id
                        ? 'Connecting...'
                        : 'Connect'}
                    </Button>

                  </Card>

                </motion.div>

              )
            )}

          </div>

        </div>

      )}


      {/* =====================================================
          CONNECT ACCOUNT MODAL
      ===================================================== */}

      <Modal
        isOpen={showConnect}
        onClose={() =>
          setShowConnect(false)
        }
        title="Connect a Social Account"
        size="md"
      >

        <p className="text-sm text-gray-500 mb-4">
          Choose a platform to connect.
          You'll be redirected to authorize
          access.
        </p>


        <div className="space-y-2">

          {availablePlatforms.map(
            (platform) => {

              const isConnected =
                connectedPlatformIds.has(
                  platform.id
                );

              return (

                <div
                  key={platform.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    isConnected
                      ? 'bg-gray-50 border-gray-200'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                  )}
                >

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      backgroundColor:
                        platform.color,
                    }}
                  >

                    <platform.icon className="w-5 h-5" />

                  </div>


                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium text-gray-900">
                      {platform.name}
                    </p>

                    <p className="text-xs text-gray-500 truncate">
                      {platform.desc}
                    </p>

                  </div>


                  {isConnected ? (

                    <Badge
                      variant="success"
                      dot
                    >
                      Connected
                    </Badge>

                  ) : (

                    <Button
                      size="sm"
                      onClick={() =>
                        handleConnect(
                          platform.id
                        )
                      }
                      loading={
                        connecting ===
                        platform.id
                      }
                    >
                      {connecting ===
                      platform.id
                        ? 'Connecting...'
                        : 'Connect'}
                    </Button>

                  )}

                </div>

              );
            }
          )}

        </div>

      </Modal>


      {/* =====================================================
          DISCONNECT CONFIRMATION
      ===================================================== */}

      <Modal
        isOpen={
          disconnectTarget !== null
        }
        onClose={() =>
          setDisconnectTarget(null)
        }
        title="Disconnect Account?"
        size="sm"
      >

        <p className="text-sm text-gray-600 mb-6">
          This will remove the account from
          your workspace. You can reconnect it
          anytime.
        </p>


        <div className="flex gap-3">

          <Button
            variant="secondary"
            fullWidth
            onClick={() =>
              setDisconnectTarget(
                null
              )
            }
          >
            Cancel
          </Button>


          <Button
            variant="danger"
            fullWidth
            onClick={
              handleDisconnect
            }
            icon={
              <X className="w-4 h-4" />
            }
          >
            Disconnect
          </Button>

        </div>

      </Modal>

>>>>>>> origin/shravanik-latest-scheduler
    </div>
  );
}