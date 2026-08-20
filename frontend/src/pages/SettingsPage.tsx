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
  Megaphone,
  UserRound,
  UserRoundCheck,
  Settings as SettingsIcon,
  Smartphone as SmartphoneIcon,
  ChevronDown,
} from 'lucide-react';

import {
  Card,
  Avatar,
  Badge,
  Button,
  Input,
} from '../components/ui';

import {
  authService,
  uploadService,
} from '../services/api';

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
  publishing_notifications_enabled: boolean;
  campaign_notifications_enabled: boolean;
  account_activity_notifications_enabled: boolean;
  team_collaboration_notifications_enabled: boolean;
  system_notifications_enabled: boolean;
  in_app_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
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
  {
    key: 'profile',
    label: 'Profile',
    icon: User,
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    key: 'security',
    label: 'Security',
    icon: Shield,
  },
  {
    key: 'appearance',
    label: 'Appearance',
    icon: Palette,
  },
  {
    key: 'team',
    label: 'Team',
    icon: Users,
  },
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
   * =========================================================
   * NOTIFICATION PREFERENCES
   * =========================================================
   */

  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>({
      publishing_notifications_enabled: true,
      campaign_notifications_enabled: true,
      account_activity_notifications_enabled: true,
      team_collaboration_notifications_enabled: true,
      system_notifications_enabled: true,
      in_app_notifications_enabled: true,
      email_notifications_enabled: true,
      push_notifications_enabled: true,
    });

  const [emailPrefs, setEmailPrefs] =
    useState<EmailPreferences>({
      email_notifications_enabled: true,
      email_frequency: 'weekly',
      promotional_emails_enabled: true,
    });

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const [savingNotifications, setSavingNotifications] =
    useState(false);

  const [savingEmailPreferences, setSavingEmailPreferences] =
    useState(false);

  /*
   * =========================================================
   * SECURITY
   * =========================================================
   */

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

  /*
   * =========================================================
   * PROFILE PHOTO
   * =========================================================
   */

  const [selectedPhoto, setSelectedPhoto] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /*
   * =========================================================
   * LOAD USER PROFILE
   * =========================================================
   */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await authService.getMe();

        setUser(response.data);
      } catch (err: any) {
        console.error(
          'Unable to load settings profile:',
          err
        );

        const backendMessage =
          err?.response?.data?.detail;

        setError(
          backendMessage ||
            'Unable to load your profile information.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /*
   * =========================================================
   * LOAD NOTIFICATION PREFERENCES
   * =========================================================
   */

  const loadNotificationPreferences =
    async () => {
      try {
        setLoadingNotifications(true);
        setError('');

        /*
         * Main notification preferences
         */
        const response =
          await authService.getNotificationPreferences();

        const data =
          response.data || {};

        setNotificationPrefs({
          publishing_notifications_enabled:
            Boolean(
              data.publishing_notifications_enabled
            ),

          campaign_notifications_enabled:
            Boolean(
              data.campaign_notifications_enabled
            ),

          account_activity_notifications_enabled:
            Boolean(
              data.account_activity_notifications_enabled
            ),

          team_collaboration_notifications_enabled:
            Boolean(
              data.team_collaboration_notifications_enabled
            ),

          system_notifications_enabled:
            Boolean(
              data.system_notifications_enabled
            ),

          in_app_notifications_enabled:
            Boolean(
              data.in_app_notifications_enabled
            ),

          email_notifications_enabled:
            Boolean(
              data.email_notifications_enabled
            ),

          push_notifications_enabled:
            Boolean(
              data.push_notifications_enabled
            ),
        });

        /*
         * Separate email preferences endpoint
         */
        const emailResponse =
          await authService.getEmailPreferences();

        const emailData =
          emailResponse.data || {};

        setEmailPrefs({
          email_notifications_enabled:
            Boolean(
              emailData.email_notifications_enabled
            ),

          email_frequency:
            emailData.email_frequency ||
            'weekly',

          promotional_emails_enabled:
            Boolean(
              emailData.promotional_emails_enabled
            ),
        });

      } catch (err: any) {
        console.error(
          'Unable to load notification preferences:',
          err
        );

        const backendMessage =
          err?.response?.data?.detail;

        setError(
          backendMessage ||
            'Unable to load notification preferences.'
        );
      } finally {
        setLoadingNotifications(false);
      }
    };

  /*
   * Load preferences only when
   * Notifications tab is opened.
   */

  useEffect(() => {
    if (activeTab !== 'notifications') {
      return;
    }

    loadNotificationPreferences();
  }, [activeTab]);

  /*
   * =========================================================
   * HELPERS
   * =========================================================
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
   * =========================================================
   * PROFILE SAVE
   * =========================================================
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
          ...previous!,
          ...response.data,
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
   * =========================================================
   * PHOTO SELECTION
   * =========================================================
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

    /*
     * The upload service expects a platform value.
     * "profile" is used here because this upload
     * belongs to the profile photo.
     */

    uploadService
      .uploadMedia(
        file,
        'profile'
      )
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
   * =========================================================
   * PASSWORD CHANGE
   * =========================================================
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
   * =========================================================
   * SAVE MAIN NOTIFICATION PREFERENCES
   * =========================================================
   */

  const handleSaveNotificationPreferences =
    async () => {
      try {
        setSavingNotifications(true);
        setError('');
        setSuccessMessage('');
        setSaved(false);

        await authService.updateNotificationPreferences(
          notificationPrefs
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

        const backendMessage =
          err?.response?.data?.detail;

        setError(
          backendMessage ||
            'Unable to save notification preferences.'
        );
      } finally {
        setSavingNotifications(false);
      }
    };

  /*
   * =========================================================
   * SAVE EMAIL PREFERENCES
   * =========================================================
   */

  const handleSaveEmailPreferences =
    async () => {
      try {
        setSavingEmailPreferences(true);
        setError('');
        setSuccessMessage('');
        setSaved(false);

        await authService.updateEmailPreferences(
          emailPrefs
        );

        setSaved(true);

        setSuccessMessage(
          'Email preferences saved successfully.'
        );

        setTimeout(() => {
          setSaved(false);
          setSuccessMessage('');
        }, 2500);

      } catch (err: any) {
        console.error(
          'Unable to save email preferences:',
          err
        );

        const backendMessage =
          err?.response?.data?.detail;

        setError(
          backendMessage ||
            'Unable to save email preferences.'
        );
      } finally {
        setSavingEmailPreferences(false);
      }
    };

  /*
   * =========================================================
   * NOTIFICATION TOGGLE
   * =========================================================
   */

  const toggleNotificationPreference =
    (
      key: keyof NotificationPreferences
    ) => {
      setNotificationPrefs((previous) => ({
        ...previous,
        [key]:
          !previous[key],
      }));
    };

  /*
   * =========================================================
   * EMAIL TOGGLE
   * =========================================================
   */

  const toggleEmailPreference =
    (
      key:
        | 'email_notifications_enabled'
        | 'promotional_emails_enabled'
    ) => {
      setEmailPrefs((previous) => ({
        ...previous,
        [key]:
          !previous[key],
      }));
    };

  /*
   * =========================================================
   * LOADING
   * =========================================================
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
   * =========================================================
   * MAIN SETTINGS PAGE
   * =========================================================
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

        {/* SETTINGS SIDEBAR */}

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

        {/* CONTENT */}

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
            <div className="space-y-6">

              {loadingNotifications ? (
                <Card className="p-8">

                  <div className="flex flex-col items-center justify-center">

                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />

                    <p className="mt-4 text-sm text-gray-500">
                      Loading notification preferences...
                    </p>

                  </div>

                </Card>
              ) : (
                <>

                  {/* =================================================
                      NOTIFICATION TYPES
                  ================================================= */}

                  <Card className="p-6">

                    <div className="flex items-start gap-3 mb-6">

                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">

                        <Bell className="w-5 h-5 text-indigo-600" />

                      </div>

                      <div>

                        <h2 className="text-lg font-semibold text-gray-900">
                          Notification Preferences
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          Choose which types of notifications you want to receive.
                        </p>

                      </div>

                    </div>

                    <div className="space-y-3">

                      {[
                        {
                          key:
                            'publishing_notifications_enabled' as const,
                          title:
                            'Publishing Notifications',
                          desc:
                            'Receive notifications about scheduled posts and publishing activity.',
                          icon:
                            Megaphone,
                        },

                        {
                          key:
                            'campaign_notifications_enabled' as const,
                          title:
                            'Campaign Notifications',
                          desc:
                            'Receive important updates about your campaigns.',
                          icon:
                            Megaphone,
                        },

                        {
                          key:
                            'account_activity_notifications_enabled' as const,
                          title:
                            'Account Activity Notifications',
                          desc:
                            'Receive notifications about important activity on your account.',
                          icon:
                            UserRound,
                        },

                        {
                          key:
                            'team_collaboration_notifications_enabled' as const,
                          title:
                            'Team Collaboration Notifications',
                          desc:
                            'Receive notifications when team members collaborate or make changes.',
                          icon:
                            UserRoundCheck,
                        },

                        {
                          key:
                            'system_notifications_enabled' as const,
                          title:
                            'System Notifications',
                          desc:
                            'Receive important system and service notifications.',
                          icon:
                            SettingsIcon,
                        },
                      ].map((item) => {

                        const enabled =
                          notificationPrefs[
                            item.key
                          ];

                        const Icon =
                          item.icon;

                        return (
                          <div
                            key={item.key}
                            className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors"
                          >

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">

                                <Icon className="w-4 h-4 text-gray-600" />

                              </div>

                              <div>

                                <p className="text-sm font-medium text-gray-900">
                                  {item.title}
                                </p>

                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.desc}
                                </p>

                              </div>

                            </div>

                            <button
                              type="button"
                              aria-label={`Toggle ${item.title}`}
                              onClick={() =>
                                toggleNotificationPreference(
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

                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">

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
                          savingNotifications
                        }
                      >
                        {savingNotifications
                          ? 'Saving...'
                          : saved
                          ? 'Saved!'
                          : 'Save Notification Preferences'}
                      </Button>

                    </div>

                  </Card>

                  {/* =================================================
                      NOTIFICATION CHANNELS
                  ================================================= */}

                  <Card className="p-6">

                    <div className="flex items-start gap-3 mb-6">

                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">

                        <SmartphoneIcon className="w-5 h-5 text-blue-600" />

                      </div>

                      <div>

                        <h2 className="text-lg font-semibold text-gray-900">
                          Notification Channels
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          Choose where you want to receive notifications.
                        </p>

                      </div>

                    </div>

                    <div className="space-y-3">

                      {[
                        {
                          key:
                            'in_app_notifications_enabled' as const,
                          title:
                            'In-App Notifications',
                          desc:
                            'Show notifications inside SocialPilot.',
                          icon:
                            Bell,
                        },

                        {
                          key:
                            'email_notifications_enabled' as const,
                          title:
                            'Email Notifications',
                          desc:
                            'Receive notifications through email.',
                          icon:
                            Mail,
                        },

                        {
                          key:
                            'push_notifications_enabled' as const,
                          title:
                            'Push Notifications',
                          desc:
                            'Receive notifications through push messages.',
                          icon:
                            Smartphone,
                        },
                      ].map((item) => {

                        const enabled =
                          notificationPrefs[
                            item.key
                          ];

                        const Icon =
                          item.icon;

                        return (
                          <div
                            key={item.key}
                            className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors"
                          >

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">

                                <Icon className="w-4 h-4 text-gray-600" />

                              </div>

                              <div>

                                <p className="text-sm font-medium text-gray-900">
                                  {item.title}
                                </p>

                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.desc}
                                </p>

                              </div>

                            </div>

                            <button
                              type="button"
                              aria-label={`Toggle ${item.title}`}
                              onClick={() =>
                                toggleNotificationPreference(
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

                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">

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
                          savingNotifications
                        }
                      >
                        {savingNotifications
                          ? 'Saving...'
                          : saved
                          ? 'Saved!'
                          : 'Save Channel Preferences'}
                      </Button>

                    </div>

                  </Card>

                  {/* =================================================
                      EMAIL PREFERENCES
                  ================================================= */}

                  <Card className="p-6">

                    <div className="flex items-start gap-3 mb-6">

                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">

                        <Mail className="w-5 h-5 text-emerald-600" />

                      </div>

                      <div>

                        <h2 className="text-lg font-semibold text-gray-900">
                          Email Preferences
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          Control how email notifications and promotional messages are delivered.
                        </p>

                      </div>

                    </div>

                    {/* EMAIL NOTIFICATIONS */}

                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200">

                      <div>

                        <p className="text-sm font-medium text-gray-900">
                          Email Notifications
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          Receive notifications by email.
                        </p>

                      </div>

                      <button
                        type="button"
                        aria-label="Toggle email notifications"
                        onClick={() =>
                          toggleEmailPreference(
                            'email_notifications_enabled'
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

                    <div className="mt-4">

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Frequency
                      </label>

                      <div className="relative">

                        <select
                          value={
                            emailPrefs.email_frequency
                          }
                          onChange={(event) =>
                            setEmailPrefs(
                              (previous) => ({
                                ...previous,
                                email_frequency:
                                  event.target.value,
                              })
                            )
                          }
                          className="w-full appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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

                          <option value="monthly">
                            Monthly
                          </option>

                        </select>

                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                      </div>

                      <p className="text-xs text-gray-500 mt-1.5">
                        Choose how frequently email notifications should be sent.
                      </p>

                    </div>

                    {/* PROMOTIONAL EMAILS */}

                    <div className="mt-4 flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200">

                      <div>

                        <p className="text-sm font-medium text-gray-900">
                          Promotional Emails
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          Receive product news, offers, and promotional messages.
                        </p>

                      </div>

                      <button
                        type="button"
                        aria-label="Toggle promotional emails"
                        onClick={() =>
                          toggleEmailPreference(
                            'promotional_emails_enabled'
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

                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">

                      <Button
                        icon={
                          saved ? (
                            <Check className="w-4 h-4" />
                          ) : undefined
                        }
                        onClick={
                          handleSaveEmailPreferences
                        }
                        disabled={
                          savingEmailPreferences
                        }
                      >
                        {savingEmailPreferences
                          ? 'Saving...'
                          : saved
                          ? 'Saved!'
                          : 'Save Email Preferences'}
                      </Button>

                    </div>

                  </Card>

                </>
              )}

            </div>
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