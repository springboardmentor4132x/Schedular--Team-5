import { useState } from 'react';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';
import { Card, Button } from '../components/ui';

type SettingKey =
  | 'publishing'
  | 'campaigns'
  | 'accountActivity'
  | 'teamCollaboration'
  | 'system'
  | 'inApp'
  | 'email'
  | 'push';

export function NotificationSettingsPage() {
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
    publishing: true,
    campaigns: true,
    accountActivity: true,
    teamCollaboration: true,
    system: true,
    inApp: true,
    email: true,
    push: false,
  });

  const toggleSetting = (key: SettingKey) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationTypes = [
    {
      key: 'publishing' as const,
      title: 'Publishing Notifications',
      description:
        'Get updates about scheduled, published, failed, or cancelled posts.',
    },
    {
      key: 'campaigns' as const,
      title: 'Campaign Notifications',
      description:
        'Receive updates about campaign creation, progress, and completion.',
    },
    {
      key: 'accountActivity' as const,
      title: 'Account Activity',
      description:
        'Get alerts about connected accounts, login activity, and security.',
    },
    {
      key: 'teamCollaboration' as const,
      title: 'Team Collaboration',
      description:
        'Receive updates about tasks, approvals, comments, and team activity.',
    },
    {
      key: 'system' as const,
      title: 'System Notifications',
      description:
        'Receive important application updates, maintenance, and announcements.',
    },
  ];

  const channels = [
    {
      key: 'inApp' as const,
      title: 'In-App Notifications',
      description: 'Show notifications inside the application.',
      icon: Bell,
    },
    {
      key: 'email' as const,
      title: 'Email Notifications',
      description: 'Receive important notifications through email.',
      icon: Mail,
    },
    {
      key: 'push' as const,
      title: 'Push Notifications',
      description: 'Future support for mobile and PWA notifications.',
      icon: Smartphone,
    },
  ];

  const Toggle = ({
    enabled,
    onClick,
  }: {
    enabled: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '52px',
        height: '28px',
        minWidth: '52px',
        borderRadius: '999px',
        border: 'none',
        padding: '3px',
        backgroundColor: enabled ? '#4f46e5' : '#d1d5db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: enabled ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'block',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  );

  const handleSave = () => {
    alert('Notification settings saved successfully!');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Notification Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage how and when you receive notifications.
        </p>
      </div>

      {/* Notification Types */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Bell className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Notification Types
            </h2>

            <p className="text-sm text-gray-500">
              Choose which activities you want to be notified about.
            </p>
          </div>
        </div>

        <div>
          {notificationTypes.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-6 border-b border-gray-100 py-5"
            >
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {item.description}
                </p>
              </div>

              <Toggle
                enabled={settings[item.key]}
                onClick={() => toggleSetting(item.key)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Channels */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Mail className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Notification Channels
            </h2>

            <p className="text-sm text-gray-500">
              Choose where you want to receive notifications.
            </p>
          </div>
        </div>

        <div>
          {channels.map((channel) => {
            const Icon = channel.icon;

            return (
              <div
                key={channel.key}
                className="flex items-center justify-between gap-6 border-b border-gray-100 py-5"
              >
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {channel.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {channel.description}
                    </p>
                  </div>
                </div>

                <Toggle
                  enabled={settings[channel.key]}
                  onClick={() => toggleSetting(channel.key)}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          icon={<Save className="h-4 w-4" />}
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </div>

    </div>
  );
}