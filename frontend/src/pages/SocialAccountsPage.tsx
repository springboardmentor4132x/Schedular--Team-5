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

    } finally {
      setConnecting(null);
    }
  };


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

    </div>
  );
}