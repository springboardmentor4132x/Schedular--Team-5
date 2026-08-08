import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  RefreshCw,
  Check,
  X, 
  Users, 
  FileText,
  Globe,
  AlertCircle,
} from 'lucide-react';
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa';
import { Card, Badge, Modal, Button, EmptyState } from '../components/ui';
import { socialAccounts as initialAccounts } from '../data/mockData';
import { formatNumber, getPlatformConfig, cn } from '../utils/helpers';

const availablePlatforms = [
  { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: '#1877F2', desc: 'Connect your Facebook Pages' },
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#E1306C', desc: 'Connect your Instagram Business' },
  { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: '#1DA1F2', desc: 'Connect your Twitter account' },
  { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: '#0A66C2', desc: 'Connect your LinkedIn Pages' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, color: '#FF0000', desc: 'Connect your YouTube channel' },
  { id: 'pinterest', name: 'Pinterest', icon: Globe, color: '#E60023', desc: 'Connect your Pinterest account' },
];

export function SocialAccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [showConnect, setShowConnect] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);

  const connectedAccounts = accounts.filter((a) => a.status === 'connected');
  const disconnectedPlatforms = availablePlatforms.filter(
    (p) => !accounts.some((a) => a.platform === p.id && a.status === 'connected')
  );

  const handleConnect = (platformId: string) => {
    setConnecting(platformId);
    setTimeout(() => {
      setAccounts((prev) => {
        const existing = prev.find((a) => a.platform === platformId);
        if (existing) {
          return prev.map((a) => (a.platform === platformId ? { ...a, status: 'connected' } : a));
        }
        const config = availablePlatforms.find((p) => p.id === platformId)!;
        return [
          ...prev,
          { id: Date.now().toString(), platform: platformId, handle: '@new_account', followers: 0, status: 'connected', color: config.color, posts: 0 },
        ];
      });
      setConnecting(null);
      setShowConnect(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    if (!disconnectTarget) return;
    setAccounts((prev) =>
      prev.map((a) => (a.id === disconnectTarget ? { ...a, status: 'disconnected' } : a))
    );
    setDisconnectTarget(null);
  };

  const totalFollowers = connectedAccounts.reduce((sum, a) => sum + a.followers, 0);
  const totalPosts = connectedAccounts.reduce((sum, a) => sum + a.posts, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Social Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your connected social media platforms</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowConnect(true)}>
          Connect Account
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Connected Accounts', value: connectedAccounts.length, icon: Check, color: 'from-emerald-500 to-teal-500' },
          { label: 'Total Followers', value: formatNumber(totalFollowers), icon: Users, color: 'from-indigo-500 to-violet-500' },
          { label: 'Total Posts', value: totalPosts, icon: FileText, color: 'from-amber-500 to-orange-500' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-5 flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', stat.color)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
<Card className="p-5">
  <h2 className="text-lg font-semibold mb-4">
    Platform Status
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

    {availablePlatforms.map((platform) => {

      const connected = accounts.some(
        (a) => a.platform === platform.id && a.status === "connected"
      );

      return (
        <div
          key={platform.id}
          className="border rounded-xl p-4 flex items-center justify-between"
        >
          <span className="font-medium">
            {platform.name}
          </span>

          {connected ? (
            <Badge variant="success">Connected</Badge>
          ) : (
            <Badge variant="danger">Disconnected</Badge>
          )}
        </div>
      );

    })}

  </div>
</Card>
      {/* Connected accounts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h2>
        {connectedAccounts.length === 0 ? (
          <Card className="p-0">
            <EmptyState
              icon={<AlertCircle className="w-8 h-8" />}
              title="No accounts connected"
              description="Connect your social media accounts to start scheduling posts and tracking analytics."
              action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowConnect(true)}>Connect Account</Button>}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {connectedAccounts.map((account, idx) => {
                const config = getPlatformConfig(account.platform);
                const Icon = config.icon;
                return (
                  <motion.div
                    key={account.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Card hover className="p-5 h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                            style={{ backgroundColor: account.color }}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{config.name}</p>
                            <p className="text-xs text-gray-500">{account.handle}</p>
                          </div>
                        </div>
                        <Badge variant="success" dot>Connected</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <Users className="w-3.5 h-3.5" /> Followers
                          </div>
                          <p className="text-lg font-bold text-gray-900">{formatNumber(account.followers)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <FileText className="w-3.5 h-3.5" /> Posts
                          </div>
                          <p className="text-lg font-bold text-gray-900">{account.posts}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" className="flex-1" icon={<RefreshCw className="w-3.5 h-3.5" />}>
                          Refresh
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDisconnectTarget(account.id)}
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Available platforms */}
      {disconnectedPlatforms.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Platforms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {disconnectedPlatforms.map((platform, idx) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card hover className="p-5 h-full flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: platform.color }}
                  >
                    <platform.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{platform.name}</p>
                    <p className="text-xs text-gray-500 truncate">{platform.desc}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleConnect(platform.id)}>
                    Connect
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Connect Modal */}
      <Modal isOpen={showConnect} onClose={() => setShowConnect(false)} title="Connect a Social Account" size="md">
        <p className="text-sm text-gray-500 mb-4">Choose a platform to connect. You'll be redirected to authorize access.</p>
        <div className="space-y-2">
          {availablePlatforms.map((platform) => {
            const isConnected = accounts.some((a) => a.platform === platform.id && a.status === 'connected');
            return (
              <div
                key={platform.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all',
                  isConnected ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                )}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: platform.color }}>
                  <platform.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{platform.name}</p>
                  <p className="text-xs text-gray-500 truncate">{platform.desc}</p>
                </div>
                {isConnected ? (
                  <Badge variant="success" dot>Connected</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(platform.id)}
                    loading={connecting === platform.id}
                  >
                    {connecting === platform.id ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Disconnect confirmation */}
      <Modal isOpen={!!disconnectTarget} onClose={() => setDisconnectTarget(null)} title="Disconnect Account?" size="sm">
        <p className="text-sm text-gray-600 mb-6">
          This will remove the account from your workspace. You can reconnect it anytime. Any scheduled posts to this platform will be paused.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDisconnectTarget(null)}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={handleDisconnect} icon={<X className="w-4 h-4" />}>Disconnect</Button>
        </div>
      </Modal>
    </div>
  );
}
