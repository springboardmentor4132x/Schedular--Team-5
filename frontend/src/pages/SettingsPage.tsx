import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Palette,
  Users,
  Mail,
  Lock,
  Globe,
  Check,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Trash2,
  LogOut,
  Camera,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';

import {
  Card,
  Avatar,
  Badge,
  Button,
  Input,
} from '../components/ui';

import { authService, uploadService } from '../services/api';
import { cn } from '../utils/helpers';

type Tab =
  | 'profile'
  | 'notifications'
  | 'security'
  | 'appearance'
  | 'team';

type UserData = {
  id?: number;
  username: string;
  email: string;
  role: string;
  full_name?: string | null;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  bio?: string | null;
};

type NotificationPreferences = {
  id?: number;
  user_id?: number;

  publishing_notifications_enabled: boolean;
  campaign_notifications_enabled: boolean;
  account_activity_notifications_enabled: boolean;
  team_collaboration_notifications_enabled: boolean;
  system_notifications_enabled: boolean;
  in_app_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;

  email_frequency: string;
  promotional_emails_enabled: boolean;

  created_at?: string;
  updated_at?: string;
};

type EmailPreferences = {
  email_notifications_enabled: boolean;
  email_frequency: string;
  promotional_emails_enabled: boolean;
};

const tabs: {
  key: Tab;
  label: string;
  icon: any;
}[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'team', label: 'Team', icon: Users },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] =
    useState<Tab>('profile');

  const [user, setUser] =
    useState<UserData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const [theme, setTheme] =
    useState<'light' | 'dark' | 'system'>('light');

  /*
   * ---------------------------------------------------------
   * NOTIFICATION PREFERENCES
   * ---------------------------------------------------------
   */

  const [notifPrefs, setNotifPrefs] =
    useState<NotificationPreferences>({
      publishing_notifications_enabled: true,
      campaign_notifications_enabled: true,
      account_activity_notifications_enabled: true,
      team_collaboration_notifications_enabled: true,
      system_notifications_enabled: true,
      in_app_notifications_enabled: true,
      email_notifications_enabled: true,
      push_notifications_enabled: false,
      email_frequency: 'immediate',
      promotional_emails_enabled: false,
    });

  const [emailPrefs, setEmailPrefs] =
    useState<EmailPreferences>({
      email_notifications_enabled: true,
      email_frequency: 'immediate',
      promotional_emails_enabled: false,
    });

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationsSaving, setNotificationsSaving] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [selectedPhoto, setSelectedPhoto] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /*
   * ---------------------------------------------------------
   * LOAD REAL USER PROFILE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await authService.getMe();

        setUser(response.data);
      } catch (err) {
        console.error(
          'Unable to load settings profile:',
          err
        );

        setError(
          'Unable to load your profile information.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /*
   * ---------------------------------------------------------
   * NOTIFICATION API HELPERS
   * ---------------------------------------------------------
   */

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('auth_token');

    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  const loadNotificationPreferences =
    async () => {
      try {
        setNotificationsLoading(true);
        setError('');

        const response =
          await fetch(
            'http://127.0.0.1:8000/notification-preferences',
            {
              method: 'GET',
              headers: getAuthHeaders(),
            }
          );

        if (!response.ok) {
          const errorData =
            await response.json().catch(
              () => null
            );

          throw new Error(
            errorData?.detail ||
              'Unable to load notification preferences.'
          );
        }

        const data =
          await response.json();

        setNotifPrefs(data);

        /*
         * Keep the dedicated email state
         * synchronized with the main preferences.
         */
        setEmailPrefs({
          email_notifications_enabled:
            data.email_notifications_enabled,
          email_frequency:
            data.email_frequency,
          promotional_emails_enabled:
            data.promotional_emails_enabled,
        });

      } catch (err: any) {
        console.error(
          'Unable to load notification preferences:',
          err
        );

        setError(
          err?.message ||
            'Unable to load notification preferences.'
        );
      } finally {
        setNotificationsLoading(false);
      }
    };

  const loadEmailPreferences =
    async () => {
      try {
        const response =
          await fetch(
            'http://127.0.0.1:8000/notification-preferences/email',
            {
              method: 'GET',
              headers: getAuthHeaders(),
            }
          );

        if (!response.ok) {
          const errorData =
            await response.json().catch(
              () => null
            );

          throw new Error(
            errorData?.detail ||
              'Unable to load email preferences.'
          );
        }

        const data =
          await response.json();

        setEmailPrefs(data);

      } catch (err) {
        console.error(
          'Unable to load email preferences:',
          err
        );
      }
    };

  /*
   * ---------------------------------------------------------
   * LOAD NOTIFICATIONS WHEN TAB IS OPENED
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (activeTab !== 'notifications') {
      return;
    }

    loadNotificationPreferences();
    loadEmailPreferences();
  }, [activeTab]);

  /*
   * ---------------------------------------------------------
   * SAVE NOTIFICATION PREFERENCES
   * ---------------------------------------------------------
   */

  const handleSaveNotificationPreferences =
    async () => {
      try {
        setNotificationsSaving(true);
        setError('');
        setSuccessMessage('');
        setSaved(false);

        /*
         * Main notification preferences.
         */
        const mainPayload = {
          publishing_notifications_enabled:
            notifPrefs.publishing_notifications_enabled,

          campaign_notifications_enabled:
            notifPrefs.campaign_notifications_enabled,

          account_activity_notifications_enabled:
            notifPrefs.account_activity_notifications_enabled,

          team_collaboration_notifications_enabled:
            notifPrefs.team_collaboration_notifications_enabled,

          system_notifications_enabled:
            notifPrefs.system_notifications_enabled,

          in_app_notifications_enabled:
            notifPrefs.in_app_notifications_enabled,

          email_notifications_enabled:
            emailPrefs.email_notifications_enabled,

          push_notifications_enabled:
            notifPrefs.push_notifications_enabled,

          email_frequency:
            emailPrefs.email_frequency,

          promotional_emails_enabled:
            emailPrefs.promotional_emails_enabled,
        };

        const mainResponse =
          await fetch(
            'http://127.0.0.1:8000/notification-preferences',
            {
              method: 'PATCH',
              headers: getAuthHeaders(),
              body: JSON.stringify(
                mainPayload
              ),
            }
          );

        if (!mainResponse.ok) {
          const errorData =
            await mainResponse.json().catch(
              () => null
            );

          throw new Error(
            errorData?.detail ||
              'Unable to save notification preferences.'
          );
        }

        const updatedMainData =
          await mainResponse.json();

        /*
         * Dedicated email preferences endpoint.
         */
        const emailPayload = {
          email_notifications_enabled:
            emailPrefs.email_notifications_enabled,

          email_frequency:
            emailPrefs.email_frequency,

          promotional_emails_enabled:
            emailPrefs.promotional_emails_enabled,
        };

        const emailResponse =
          await fetch(
            'http://127.0.0.1:8000/notification-preferences/email',
            {
              method: 'PATCH',
              headers: getAuthHeaders(),
              body: JSON.stringify(
                emailPayload
              ),
            }
          );

        if (!emailResponse.ok) {
          const errorData =
            await emailResponse.json().catch(
              () => null
            );

          throw new Error(
            errorData?.detail ||
              'Unable to save email preferences.'
          );
        }

        const updatedEmailData =
          await emailResponse.json();

        /*
         * Update frontend with actual backend values.
         */
        setNotifPrefs(
          updatedMainData
        );

        setEmailPrefs(
          updatedEmailData
        );

        setSaved(true);

        setSuccessMessage(
          'Notification preferences saved successfully.'
        );

        setTimeout(() => {
          setSaved(false);
          setSuccessMessage('');
        }, 2500);

      } catch (err: any) {
        console.error(
          'Unable to save notification preferences:',
          err
        );

        setError(
          err?.message ||
            'Unable to save notification preferences.'
        );
      } finally {
        setNotificationsSaving(false);
      }
    };

  /*
   * ---------------------------------------------------------
   * NOTIFICATION TOGGLE HELPER
   * ---------------------------------------------------------
   */

  const toggleNotification =
    (
      key: keyof NotificationPreferences
    ) => {
      setNotifPrefs((previous) => ({
        ...previous,
        [key]:
          !previous[key],
      }));
    };

  /*
   * ---------------------------------------------------------
   * EMAIL PREFERENCE UPDATE
   * ---------------------------------------------------------
   */

  const updateEmailPreference =
    (
      key: keyof EmailPreferences,
      value:
        | boolean
        | string
    ) => {
      setEmailPrefs((previous) => ({
        ...previous,
        [key]: value,
      }));

      /*
       * Keep the main notification state
       * synchronized with email settings.
       */
      if (
        key ===
        'email_notifications_enabled'
      ) {
        setNotifPrefs((previous) => ({
          ...previous,
          email_notifications_enabled:
            value as boolean,
        }));
      }

      if (
        key ===
        'email_frequency'
      ) {
        setNotifPrefs((previous) => ({
          ...previous,
          email_frequency:
            value as string,
        }));
      }

      if (
        key ===
        'promotional_emails_enabled'
      ) {
        setNotifPrefs((previous) => ({
          ...previous,
          promotional_emails_enabled:
            value as boolean,
        }));
      }
    };

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const formatRole = (role: string) => {
    return role
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const displayName =
    user?.full_name ||
    user?.username ||
    'User';

  /*
   * ---------------------------------------------------------
   * PROFILE SAVE
   * ---------------------------------------------------------
   */

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      setSaved(false);

      const response =
        await authService.updateMe({
          full_name:
            user.full_name || '',
          email:
            user.email,
          phone:
            user.phone || '',
          company:
            user.company || '',
          website:
            user.website || '',
          bio:
            user.bio || '',
        });

      if (response.data) {
        setUser((previous) => ({
          ...previous,
          ...(response.data || {}),
        }));
      }

      setSaved(true);

      setSuccessMessage(
        'Profile changes saved successfully.'
      );

      setTimeout(() => {
        setSaved(false);
        setSuccessMessage('');
      }, 2500);

    } catch (err: any) {
      console.error(
        'Unable to save profile:',
        err
      );

      const backendMessage =
        err?.response?.data?.detail;

      setError(
        backendMessage ||
          'Unable to save profile changes.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * PHOTO SELECTION
   * ---------------------------------------------------------
   */

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image file.'
      );
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setSelectedPhoto(previewUrl);

    uploadService
      .uploadMedia(file)
      .then((response) => {
        console.log(
          'Profile image uploaded:',
          response.data
        );

        setSuccessMessage(
          'Profile photo uploaded successfully.'
        );

        setTimeout(() => {
          setSuccessMessage('');
        }, 2500);
      })
      .catch((err) => {
        console.error(
          'Profile photo upload failed:',
          err
        );

        setError(
          'Profile photo upload failed.'
        );
      });
  };

  /*
   * ---------------------------------------------------------
   * PASSWORD CHANGE
   * ---------------------------------------------------------
   */

  const handleChangePassword =
    async () => {
      if (!currentPassword) {
        setError(
          'Please enter your current password.'
        );
        return;
      }

      if (!newPassword) {
        setError(
          'Please enter a new password.'
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          'New password and confirmation password do not match.'
        );
        return;
      }

      try {
        setChangingPassword(true);
        setError('');
        setSuccessMessage('');

        await authService.updatePassword({
          current_password:
            currentPassword,
          new_password:
            newPassword,
        });

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setSuccessMessage(
          'Password changed successfully.'
        );

        setTimeout(() => {
          setSuccessMessage('');
        }, 2500);

      } catch (err: any) {
        console.error(
          'Unable to change password:',
          err
        );

        const backendMessage =
          err?.response?.data?.detail;

        setError(
          backendMessage ||
            'Unable to change password.'
        );
      } finally {
        setChangingPassword(false);
      }
    };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-gray-500">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN SETTINGS PAGE
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Settings
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your account preferences and configuration
        </p>
      </div>

      {/* GLOBAL ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}

          <button
            type="button"
            className="ml-3 font-medium underline"
            onClick={() => setError('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* GLOBAL SUCCESS */}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">

        {/* ===================================================
            SETTINGS SIDEBAR
        =================================================== */}

        <Card className="p-3 h-fit lg:sticky lg:top-20">

          <nav className="flex lg:flex-col gap-1 overflow-x-auto">

            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setActiveTab(tab.key)
                }
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                  activeTab === tab.key
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}

          </nav>

        </Card>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <motion.div
          key={activeTab}
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.2,
          }}
        >

          {/* =================================================
              PROFILE
          ================================================= */}

          {activeTab === 'profile' && user && (
            <Card className="p-6">

              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Profile Information
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Update your personal details and photo
              </p>

              {/* AVATAR */}

              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">

                <div className="relative">

                  <Avatar
                    src={
                      selectedPhoto ||
                      undefined
                    }
                    name={displayName}
                    size="xl"
                  />

                  <button
                    type="button"
                    onClick={
                      handlePhotoClick
                    }
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
                    title="Change profile photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                </div>

                <div>

                  <p className="text-sm font-semibold text-gray-900">
                    {displayName}
                  </p>

                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>

                  <p className="mt-1 text-xs text-indigo-600 font-medium">
                    {formatRole(user.role)}
                  </p>

                  <button
                    type="button"
                    onClick={
                      handlePhotoClick
                    }
                    className="mt-2 text-xs text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Change photo
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={
                      handlePhotoChange
                    }
                  />

                </div>

              </div>

              {/* PROFILE FIELDS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Input
                  label="Username"
                  value={
                    user.username
                  }
                  disabled
                  onChange={() => {}}
                />

                <Input
                  label="Email"
                  type="email"
                  value={
                    user.email
                  }
                  icon={
                    <Mail className="w-4 h-4" />
                  }
                  onChange={(event) =>
                    setUser({
                      ...user,
                      email:
                        event.target.value,
                    })
                  }
                />

                <Input
                  label="Full Name"
                  value={
                    user.full_name ||
                    ''
                  }
                  onChange={(event) =>
                    setUser({
                      ...user,
                      full_name:
                        event.target.value,
                    })
                  }
                />

                <Input
                  label="Role"
                  value={
                    formatRole(
                      user.role
                    )
                  }
                  disabled
                  onChange={() => {}}
                />

                <Input
                  label="Company"
                  value={
                    user.company ||
                    ''
                  }
                  onChange={(event) =>
                    setUser({
                      ...user,
                      company:
                        event.target.value,
                    })
                  }
                />

                <Input
                  label="Phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={
                    user.phone ||
                    ''
                  }
                  icon={
                    <Smartphone className="w-4 h-4" />
                  }
                  onChange={(event) =>
                    setUser({
                      ...user,
                      phone:
                        event.target.value,
                    })
                  }
                />

                <Input
                  label="Website"
                  placeholder="https://..."
                  value={
                    user.website ||
                    ''
                  }
                  icon={
                    <Globe className="w-4 h-4" />
                  }
                  onChange={(event) =>
                    setUser({
                      ...user,
                      website:
                        event.target.value,
                    })
                  }
                />

              </div>

              {/* BIO */}

              <div className="mt-4">

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bio
                </label>

                <textarea
                  rows={3}
                  value={
                    user.bio || ''
                  }
                  onChange={(event) =>
                    setUser({
                      ...user,
                      bio:
                        event.target.value,
                    })
                  }
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />

              </div>

              {/* SAVE */}

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">

                <Badge variant="purple">
                  {formatRole(
                    user.role
                  )}
                </Badge>

                <div className="flex gap-2">

                  <Button
                    variant="secondary"
                    onClick={() =>
                      window.location.reload()
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    icon={
                      saved ? (
                        <Check className="w-4 h-4" />
                      ) : undefined
                    }
                    onClick={
                      handleSaveProfile
                    }
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? 'Saving...'
                      : saved
                      ? 'Saved!'
                      : 'Save Changes'}
                  </Button>

                </div>

              </div>

            </Card>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {activeTab === 'notifications' && (
            <Card className="p-6">

              <div className="flex items-start justify-between gap-4 mb-6">

                <div>

                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Notification Preferences
                  </h2>

                  <p className="text-sm text-gray-500">
                    Choose what notifications you want to receive
                  </p>

                </div>

                {notificationsLoading && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    Loading...
                  </div>
                )}

              </div>

              {notificationsLoading ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  Loading notification preferences...
                </div>
              ) : (
                <>

                  {/* =================================================
                      GENERAL NOTIFICATIONS
                  ================================================= */}

                  <div className="space-y-4">

                    {[
                      {
                        key:
                          'publishing_notifications_enabled' as const,
                        title:
                          'Publishing Notifications',
                        desc:
                          'Get notified about scheduled and published posts',
                      },

                      {
                        key:
                          'campaign_notifications_enabled' as const,
                        title:
                          'Campaign Notifications',
                        desc:
                          'Receive important updates about your campaigns',
                      },

                      {
                        key:
                          'account_activity_notifications_enabled' as const,
                        title:
                          'Account Activity',
                        desc:
                          'Get notified about important account activity',
                      },

                      {
                        key:
                          'team_collaboration_notifications_enabled' as const,
                        title:
                          'Team Collaboration',
                        desc:
                          'Receive notifications when team members collaborate',
                      },

                      {
                        key:
                          'system_notifications_enabled' as const,
                        title:
                          'System Notifications',
                        desc:
                          'Receive important system and application notifications',
                      },

                      {
                        key:
                          'in_app_notifications_enabled' as const,
                        title:
                          'In-App Notifications',
                        desc:
                          'Show notifications inside the SocialPilot application',
                      },

                      {
                        key:
                          'push_notifications_enabled' as const,
                        title:
                          'Push Notifications',
                        desc:
                          'Receive notifications through browser or device push notifications',
                      },

                    ].map((item) => {

                      const enabled =
                        notifPrefs[
                          item.key
                        ];

                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors"
                        >

                          <div className="pr-4">

                            <p className="text-sm font-medium text-gray-900">
                              {item.title}
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.desc}
                            </p>

                          </div>

                          <button
                            type="button"
                            aria-label={`Toggle ${item.title}`}
                            onClick={() =>
                              toggleNotification(
                                item.key
                              )
                            }
                            className={cn(
                              'relative w-11 h-6 rounded-full transition-all flex-shrink-0',
                              enabled
                                ? 'bg-indigo-600'
                                : 'bg-gray-300'
                            )}
                          >

                            <motion.div
                              animate={{
                                x: enabled
                                  ? 22
                                  : 2,
                              }}
                              transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 30,
                              }}
                              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                            />

                          </button>

                        </div>
                      );
                    })}

                  </div>

                  {/* =================================================
                      EMAIL NOTIFICATIONS
                  ================================================= */}

                  <div className="mt-8 pt-6 border-t border-gray-100">

                    <div className="flex items-center gap-2 mb-4">

                      <Mail className="w-4 h-4 text-indigo-600" />

                      <h3 className="text-sm font-semibold text-gray-900">
                        Email Notifications
                      </h3>

                    </div>

                    {/* EMAIL ENABLED */}

                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">

                      <div className="pr-4">

                        <p className="text-sm font-medium text-gray-900">
                          Email Notifications
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          Receive notification emails in your inbox
                        </p>

                      </div>

                      <button
                        type="button"
                        aria-label="Toggle email notifications"
                        onClick={() =>
                          updateEmailPreference(
                            'email_notifications_enabled',
                            !emailPrefs.email_notifications_enabled
                          )
                        }
                        className={cn(
                          'relative w-11 h-6 rounded-full transition-all flex-shrink-0',
                          emailPrefs.email_notifications_enabled
                            ? 'bg-indigo-600'
                            : 'bg-gray-300'
                        )}
                      >

                        <motion.div
                          animate={{
                            x:
                              emailPrefs.email_notifications_enabled
                                ? 22
                                : 2,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                        />

                      </button>

                    </div>

                    {/* EMAIL FREQUENCY */}

                    <div className="mt-4 p-4 rounded-xl border border-gray-200">

                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email Frequency
                      </label>

                      <p className="text-xs text-gray-500 mb-3">
                        Choose how frequently you want to receive email notifications.
                      </p>

                      <select
                        value={
                          emailPrefs.email_frequency
                        }
                        onChange={(event) =>
                          updateEmailPreference(
                            'email_frequency',
                            event.target.value
                          )
                        }
                        className="w-full sm:w-64 px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >

                        <option value="immediate">
                          Immediate
                        </option>

                        <option value="daily">
                          Daily
                        </option>

                        <option value="weekly">
                          Weekly
                        </option>

                      </select>

                    </div>

                    {/* PROMOTIONAL EMAILS */}

                    <div className="flex items-center justify-between mt-4 p-4 rounded-xl border border-gray-200">

                      <div className="pr-4">

                        <p className="text-sm font-medium text-gray-900">
                          Promotional Emails
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          Receive product news, offers, and promotional updates
                        </p>

                      </div>

                      <button
                        type="button"
                        aria-label="Toggle promotional emails"
                        onClick={() =>
                          updateEmailPreference(
                            'promotional_emails_enabled',
                            !emailPrefs.promotional_emails_enabled
                          )
                        }
                        className={cn(
                          'relative w-11 h-6 rounded-full transition-all flex-shrink-0',
                          emailPrefs.promotional_emails_enabled
                            ? 'bg-indigo-600'
                            : 'bg-gray-300'
                        )}
                      >

                        <motion.div
                          animate={{
                            x:
                              emailPrefs.promotional_emails_enabled
                                ? 22
                                : 2,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                        />

                      </button>

                    </div>

                  </div>

                  {/* =================================================
                      SAVE NOTIFICATION PREFERENCES
                  ================================================= */}

                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">

                    <p className="text-xs text-gray-500">
                      Changes are saved to your account.
                    </p>

                    <Button
                      icon={
                        saved ? (
                          <Check className="w-4 h-4" />
                        ) : undefined
                      }
                      onClick={
                        handleSaveNotificationPreferences
                      }
                      disabled={
                        notificationsSaving ||
                        notificationsLoading
                      }
                    >
                      {notificationsSaving
                        ? 'Saving...'
                        : saved
                        ? 'Saved!'
                        : 'Save Preferences'}
                    </Button>

                  </div>

                </>
              )}

            </Card>
          )}

          {/* =================================================
              SECURITY
          ================================================= */}

          {activeTab === 'security' && (
            <div className="space-y-6">

              <Card className="p-6">

                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Change Password
                </h2>

                <p className="text-sm text-gray-500 mb-6">
                  Update your password to keep your account secure
                </p>

                <div className="space-y-4">

                  <Input
                    label="Current Password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Enter current password"
                    value={
                      currentPassword
                    }
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    icon={
                      <Lock className="w-4 h-4" />
                    }
                  />

                  <Input
                    label="New Password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Enter new password"
                    value={
                      newPassword
                    }
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    icon={
                      <Key className="w-4 h-4" />
                    }
                  />

                  <Input
                    label="Confirm New Password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Re-enter new password"
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    icon={
                      <Key className="w-4 h-4" />
                    }
                  />

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}

                  {showPassword
                    ? 'Hide passwords'
                    : 'Show passwords'}
                </button>

                <div className="mt-6 flex justify-end">

                  <Button
                    onClick={
                      handleChangePassword
                    }
                    disabled={
                      changingPassword
                    }
                  >
                    {changingPassword
                      ? 'Updating...'
                      : 'Update Password'}
                  </Button>

                </div>

              </Card>

              <Card className="p-6">

                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Two-Factor Authentication
                </h2>

                <p className="text-sm text-gray-500 mb-6">
                  Add an extra layer of security to your account
                </p>

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-gray-900">
                        Authenticator App
                      </p>

                      <p className="text-xs text-gray-500">
                        2FA configuration
                      </p>

                    </div>

                  </div>

                  <Badge variant="success">
                    Available
                  </Badge>

                </div>

              </Card>

              <Card className="p-6 border-red-200">

                <h2 className="text-lg font-semibold text-red-700 mb-1">
                  Danger Zone
                </h2>

                <p className="text-sm text-gray-500 mb-6">
                  Irreversible actions for your account
                </p>

                <div className="space-y-3">

                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">

                    <div>

                      <p className="text-sm font-medium text-gray-900">
                        Delete Account
                      </p>

                      <p className="text-xs text-gray-500">
                        Permanently delete your account and all data
                      </p>

                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      icon={
                        <Trash2 className="w-4 h-4" />
                      }
                    >
                      Delete
                    </Button>

                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">

                    <div>

                      <p className="text-sm font-medium text-gray-900">
                        Sign Out
                      </p>

                      <p className="text-xs text-gray-500">
                        Sign out from all devices
                      </p>

                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={
                        <LogOut className="w-4 h-4" />
                      }
                      onClick={() => {
                        localStorage.removeItem(
                          'auth_token'
                        );

                        localStorage.removeItem(
                          'user_role'
                        );

                        window.location.href =
                          '/login';
                      }}
                    >
                      Sign Out
                    </Button>

                  </div>

                </div>

              </Card>

            </div>
          )}

          {/* =================================================
              APPEARANCE
          ================================================= */}

          {activeTab === 'appearance' && (
            <Card className="p-6">

              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Appearance
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Customize how SocialPilot looks on your device
              </p>

              <div>

                <p className="text-sm font-medium text-gray-700 mb-3">
                  Theme
                </p>

                <div className="grid grid-cols-3 gap-3">

                  {[
                    {
                      key: 'light',
                      label: 'Light',
                      icon: Sun,
                    },
                    {
                      key: 'dark',
                      label: 'Dark',
                      icon: Moon,
                    },
                    {
                      key: 'system',
                      label: 'System',
                      icon: Monitor,
                    },
                  ].map((t) => (

                    <button
                      key={t.key}
                      type="button"
                      onClick={() =>
                        setTheme(
                          t.key as
                            | 'light'
                            | 'dark'
                            | 'system'
                        )
                      }
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        theme === t.key
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >

                      <t.icon
                        className={cn(
                          'w-6 h-6',
                          theme === t.key
                            ? 'text-indigo-600'
                            : 'text-gray-400'
                        )}
                      />

                      <span
                        className={cn(
                          'text-sm font-medium',
                          theme === t.key
                            ? 'text-indigo-700'
                            : 'text-gray-700'
                        )}
                      >
                        {t.label}
                      </span>

                    </button>

                  ))}

                </div>

              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">

                <p className="text-sm font-medium text-gray-700 mb-3">
                  Density
                </p>

                <div className="grid grid-cols-2 gap-3">

                  {[
                    'Comfortable',
                    'Compact',
                  ].map((density, index) => (

                    <button
                      key={density}
                      type="button"
                      className={cn(
                        'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                        index === 0
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      )}
                    >

                      <span className="text-sm font-medium">
                        {density}
                      </span>

                    </button>

                  ))}

                </div>

              </div>

              <div className="mt-6 flex justify-end">

                <Button
                  icon={
                    saved ? (
                      <Check className="w-4 h-4" />
                    ) : undefined
                  }
                  onClick={() => {
                    setSaved(true);

                    setTimeout(() => {
                      setSaved(false);
                    }, 2000);
                  }}
                >
                  {saved
                    ? 'Saved!'
                    : 'Save Preferences'}
                </Button>

              </div>

            </Card>
          )}

          {/* =================================================
              TEAM
          ================================================= */}

          {activeTab === 'team' && (
            <Card className="p-6">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Team Members
                  </h2>

                  <p className="text-sm text-gray-500">
                    Team management
                  </p>

                </div>

                <Badge variant="purple">
                  Administrator
                </Badge>

              </div>

              <div className="p-6 rounded-xl border border-dashed border-gray-300 text-center">

                <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />

                <p className="text-sm font-medium text-gray-700">
                  Team management
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Team members can be managed through the user management APIs.
                </p>

              </div>

            </Card>
          )}

        </motion.div>

      </div>

    </div>
  );
}