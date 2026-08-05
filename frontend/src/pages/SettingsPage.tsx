import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, Shield, Palette, Users, Mail, Lock, Globe,
  Check, Smartphone, Monitor, Moon, Sun, Trash2, LogOut,
  Camera, Key, Eye, EyeOff,
} from 'lucide-react';
import { Card, Avatar, Badge, Button, Input } from '../components/ui';
import { currentUser, teamMembers } from '../data/mockData';
import { cn } from '../utils/helpers';

type Tab = 'profile' | 'notifications' | 'security' | 'appearance' | 'team';

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'team', label: 'Team', icon: Users },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [notifPrefs, setNotifPrefs] = useState({
    scheduledPosts: true,
    campaignAlerts: true,
    weeklyReport: true,
    productUpdates: false,
    teamActivity: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar tabs */}
        <Card className="p-3 h-fit lg:sticky lg:top-20">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                  activeTab === tab.key ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Profile Information</h2>
              <p className="text-sm text-gray-500 mb-6">Update your personal details and photo</p>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="relative">
                  <Avatar src={currentUser.avatar} name={currentUser.name} size="xl" />
                  <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                  <button className="mt-2 text-xs text-indigo-600 font-medium hover:text-indigo-700">Change photo</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" defaultValue={currentUser.name} />
                <Input label="Email" type="email" defaultValue={currentUser.email} icon={<Mail className="w-4 h-4" />} />
                <Input label="Role" defaultValue={currentUser.role} />
                <Input label="Company" defaultValue={currentUser.company} />
                <Input label="Phone" placeholder="+1 (555) 000-0000" icon={<Smartphone className="w-4 h-4" />} />
                <Input label="Website" placeholder="https://..." icon={<Globe className="w-4 h-4" />} />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  defaultValue="Marketing professional passionate about social media and brand storytelling."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                <Badge variant="purple">Pro Plan</Badge>
                <div className="flex gap-2">
                  <Button variant="secondary">Cancel</Button>
                  <Button icon={saved ? <Check className="w-4 h-4" /> : undefined} onClick={handleSave}>
                    {saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-500 mb-6">Choose what notifications you want to receive</p>

              <div className="space-y-4">
                {[
                  { key: 'scheduledPosts', title: 'Scheduled Post Reminders', desc: 'Get notified before your posts go live' },
                  { key: 'campaignAlerts', title: 'Campaign Alerts', desc: 'Important updates about your active campaigns' },
                  { key: 'weeklyReport', title: 'Weekly Performance Report', desc: 'Summary of your social media performance' },
                  { key: 'productUpdates', title: 'Product Updates', desc: 'News about new features and improvements' },
                  { key: 'teamActivity', title: 'Team Activity', desc: 'When team members join or make changes' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs({ ...notifPrefs, [item.key]: !notifPrefs[item.key as keyof typeof notifPrefs] })}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-all flex-shrink-0',
                        notifPrefs[item.key as keyof typeof notifPrefs] ? 'bg-indigo-600' : 'bg-gray-300'
                      )}
                    >
                      <motion.div
                        animate={{ x: notifPrefs[item.key as keyof typeof notifPrefs] ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                <Button icon={saved ? <Check className="w-4 h-4" /> : undefined} onClick={handleSave}>
                  {saved ? 'Saved!' : 'Save Preferences'}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h2>
                <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure</p>

                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    icon={<Lock className="w-4 h-4" />}
                  />
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    icon={<Key className="w-4 h-4" />}
                  />
                  <Input
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    icon={<Key className="w-4 h-4" />}
                  />
                </div>

                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPassword ? 'Hide passwords' : 'Show passwords'}
                </button>

                <div className="mt-6 flex justify-end">
                  <Button icon={saved ? <Check className="w-4 h-4" /> : undefined} onClick={handleSave}>
                    {saved ? 'Saved!' : 'Update Password'}
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-500 mb-6">Add an extra layer of security to your account</p>

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Authenticator App</p>
                      <p className="text-xs text-gray-500">Enabled · Google Authenticator</p>
                    </div>
                  </div>
                  <Badge variant="success" dot>Active</Badge>
                </div>
              </Card>

              <Card className="p-6 border-red-200">
                <h2 className="text-lg font-semibold text-red-700 mb-1">Danger Zone</h2>
                <p className="text-sm text-gray-500 mb-6">Irreversible actions for your account</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delete Account</p>
                      <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sign Out</p>
                      <p className="text-xs text-gray-500">Sign out from all devices</p>
                    </div>
                    <Button variant="secondary" size="sm" icon={<LogOut className="w-4 h-4" />}>Sign Out</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'appearance' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Appearance</h2>
              <p className="text-sm text-gray-500 mb-6">Customize how SocialPilot looks on your device</p>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'light', label: 'Light', icon: Sun },
                    { key: 'dark', label: 'Dark', icon: Moon },
                    { key: 'system', label: 'System', icon: Monitor },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTheme(t.key as any)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        theme === t.key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <t.icon className={cn('w-6 h-6', theme === t.key ? 'text-indigo-600' : 'text-gray-400')} />
                      <span className={cn('text-sm font-medium', theme === t.key ? 'text-indigo-700' : 'text-gray-700')}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Density</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Comfortable', 'Compact'].map((d, i) => (
                    <button
                      key={d}
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                        i === 0 ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      )}
                    >
                      <span className="text-sm font-medium">{d}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button icon={saved ? <Check className="w-4 h-4" /> : undefined} onClick={handleSave}>
                  {saved ? 'Saved!' : 'Save Preferences'}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'team' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Team Members</h2>
                  <p className="text-sm text-gray-500">Manage who has access to your workspace</p>
                </div>
                <Button size="sm" icon={<User className="w-4 h-4" />}>Invite</Button>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors"
                  >
                    <Avatar src={member.avatar} name={member.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                        {member.status === 'active' && <Badge variant="success" dot>Active</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        defaultValue={member.role}
                        className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option>Administrator</option>
                        <option>Marketing Team</option>
                        <option>Content Creator</option>
                        <option>Business User</option>
                      </select>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
