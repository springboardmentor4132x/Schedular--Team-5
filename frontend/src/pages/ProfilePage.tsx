import { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Globe,
  Camera,
} from 'lucide-react';

import {
  Avatar,
  Card,
  Button,
  Input,
} from '../components/ui';

import { authService } from '../services/api';

type UserData = {
  id?: number;
  username: string;
  email: string;
  role: string;
  full_name?: string | null;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
};

export function ProfilePage() {
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

  const [fullName, setFullName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [website, setWebsite] =
    useState('');

  const [bio, setBio] =
    useState('');

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await authService.getMe();

      const data = response.data;

      setUser(data);

      setFullName(
        data.full_name || ''
      );

      setEmail(
        data.email || ''
      );

      setPhone(
        data.phone || ''
      );

      setWebsite(
        data.website || ''
      );

      setBio(
        data.bio || ''
      );
    } catch (error) {
      console.error(
        'Unable to load profile:',
        error
      );

      setError(
        'Unable to load your profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const handleSave = async () => {
    if (!user) {
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError('');

      const response =
        await authService.updateMe({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          website: website.trim(),
          bio: bio.trim(),
        });

      const updatedUser =
        response.data;

      setUser(
        (previous) => ({
          ...previous,
          ...updatedUser,
        })
      );

      setFullName(
        updatedUser.full_name || ''
      );

      setEmail(
        updatedUser.email || ''
      );

      setPhone(
        updatedUser.phone || ''
      );

      setWebsite(
        updatedUser.website || ''
      );

      setBio(
        updatedUser.bio || ''
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error: any) {
      console.error(
        'Unable to save profile:',
        error
      );

      const message =
        error?.response?.data?.detail;

      setError(
        typeof message === 'string'
          ? message
          : 'Unable to save profile changes.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-gray-500">
            Loading profile...
          </p>

        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR / NO USER
  ======================================================= */

  if (!user) {
    return (
      <div className="text-center py-10">

        <p className="text-sm text-red-500">
          {error ||
            'Unable to load profile.'}
        </p>

        <button
          type="button"
          onClick={loadProfile}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
        >
          Try again
        </button>

      </div>
    );
  }

  /* =======================================================
     DISPLAY VALUES
  ======================================================= */

  const displayName =
    fullName ||
    user.username;

  const formattedRole =
    user.role
      .replace(/_/g, ' ')
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your personal profile information.
        </p>
      </div>

      {/* PROFILE CARD */}

      <Card className="p-6">

        {/* PROFILE SUMMARY */}

        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">

          <div className="relative">

            <Avatar
              name={displayName}
              size="xl"
            />

            <button
              type="button"
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

          </div>

          <div>

            <p className="text-sm font-semibold text-gray-900">
              {displayName}
            </p>

            <p className="text-xs text-gray-500">
              {email}
            </p>

            <p className="mt-1 text-xs text-indigo-600 font-medium">
              {formattedRole}
            </p>

          </div>

        </div>

        {/* FORM */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Input
            label="Username"
            value={user.username}
            disabled
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            icon={
              <Mail className="w-4 h-4" />
            }
          />

          <Input
            label="Full Name"
            value={fullName}
            onChange={(event) =>
              setFullName(
                event.target.value
              )
            }
          />

          <Input
            label="Role"
            value={formattedRole}
            disabled
          />

          <Input
            label="Phone"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value
              )
            }
            placeholder="+91 XXXXX XXXXX"
            icon={
              <Phone className="w-4 h-4" />
            }
          />

          <Input
            label="Website"
            value={website}
            onChange={(event) =>
              setWebsite(
                event.target.value
              )
            }
            placeholder="https://..."
            icon={
              <Globe className="w-4 h-4" />
            }
          />

        </div>

        {/* BIO */}

        <div className="mt-4">

          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bio
          </label>

          <textarea
            rows={4}
            value={bio}
            onChange={(event) =>
              setBio(
                event.target.value
              )
            }
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
          />

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* SAVE */}

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">

          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : saved
              ? 'Saved!'
              : 'Save Changes'}
          </Button>

        </div>

      </Card>

    </div>
  );
}