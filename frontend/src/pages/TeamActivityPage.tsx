import { useEffect, useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Megaphone,
  RefreshCw,
  UserCheck,
  UserPlus,
  AlertCircle,
} from 'lucide-react';

import api from '../services/api';

type TeamActivity = {
  id: number;
  activity_type?: string;
  type?: string;
  action?: string;
  title?: string;
  description?: string;
  message?: string;

  user_id?: number;
  user_name?: string;
  username?: string;
  actor_name?: string;

  created_at?: string;
  timestamp?: string;

  campaign_id?: number;
  campaign_name?: string;

  [key: string]: any;
};

function getActivityType(
  activity: TeamActivity
): string {
  return (
    activity.activity_type ||
    activity.type ||
    activity.action ||
    ''
  ).toLowerCase();
}

function getActivityTitle(
  activity: TeamActivity
): string {
  if (activity.title) {
    return activity.title;
  }

  const type = getActivityType(activity);

  switch (type) {
    case 'campaign_created':
      return 'Campaign Created';

    case 'campaign_updated':
      return 'Campaign Updated';

    case 'campaign_started':
      return 'Campaign Started';

    case 'campaign_ended':
      return 'Campaign Ended';

    case 'marketing_team_assigned':
      return 'Marketing Team Assigned';

    default:
      return type
        ? type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) =>
              letter.toUpperCase()
            )
        : 'Team Activity';
  }
}

function getActivityDescription(
  activity: TeamActivity
): string {
  if (activity.description) {
    return activity.description;
  }

  if (activity.message) {
    return activity.message;
  }

  const type = getActivityType(activity);

  switch (type) {
    case 'campaign_created':
      return 'A new campaign was created.';

    case 'campaign_updated':
      return 'A campaign was updated.';

    case 'campaign_started':
      return 'A campaign was started.';

    case 'campaign_ended':
      return 'A campaign was ended.';

    case 'marketing_team_assigned':
      return 'A marketing team was assigned to a business user.';

    default:
      return 'A team activity was recorded.';
  }
}

function getActivityIcon(
  activity: TeamActivity
) {
  const type = getActivityType(activity);

  if (
    type.includes('campaign_created') ||
    type.includes('created')
  ) {
    return Megaphone;
  }

  if (
    type.includes('campaign_updated') ||
    type.includes('updated')
  ) {
    return RefreshCw;
  }

  if (
    type.includes('campaign_started') ||
    type.includes('started')
  ) {
    return CheckCircle2;
  }

  if (
    type.includes('campaign_ended') ||
    type.includes('ended')
  ) {
    return Clock;
  }

  if (
    type.includes('marketing_team_assigned') ||
    type.includes('assigned')
  ) {
    return UserCheck;
  }

  return Activity;
}

function getActivityIconStyle(
  activity: TeamActivity
): string {
  const type = getActivityType(activity);

  if (type.includes('created')) {
    return 'bg-blue-50 text-blue-600';
  }

  if (type.includes('updated')) {
    return 'bg-indigo-50 text-indigo-600';
  }

  if (type.includes('started')) {
    return 'bg-green-50 text-green-600';
  }

  if (type.includes('ended')) {
    return 'bg-gray-100 text-gray-600';
  }

  if (type.includes('assigned')) {
    return 'bg-purple-50 text-purple-600';
  }

  return 'bg-gray-100 text-gray-600';
}

function getActivityDate(
  activity: TeamActivity
): string | null {
  return (
    activity.created_at ||
    activity.timestamp ||
    null
  );
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return 'Unknown time';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActorName(
  activity: TeamActivity
): string {
  return (
    activity.actor_name ||
    activity.user_name ||
    activity.username ||
    'Team member'
  );
}

function normalizeActivities(
  data: any
): TeamActivity[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data.activities)
  ) {
    return data.activities;
  }

  if (
    data &&
    Array.isArray(data.items)
  ) {
    return data.items;
  }

  if (
    data &&
    Array.isArray(data.results)
  ) {
    return data.results;
  }

  return [];
}

export function TeamActivityPage() {
  const [activities, setActivities] =
    useState<TeamActivity[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const fetchActivities = async (
    showRefreshLoader = false
  ) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await api.get(
        '/team-activities',
        {
          params: {
            limit: 50,
            offset: 0,
          },
        }
      );

      const normalized =
        normalizeActivities(
          response.data
        );

      setActivities(normalized);
    } catch (err: any) {
      console.error(
        'Failed to fetch team activities:',
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Unable to load team activities. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Team Activity
                </h1>

                <p className="text-sm text-gray-500 mt-0.5">
                  See what is happening across your team.
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchActivities(true)
            }
            disabled={
              loading || refreshing
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}
          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <div className="flex items-start gap-3">

              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />

              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  Unable to load activities
                </p>

                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchActivities()
                }
                className="text-sm font-medium text-red-700 hover:text-red-900"
              >
                Retry
              </button>

            </div>

          </div>
        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

            <div className="flex flex-col items-center justify-center py-16">

              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />

              <p className="mt-3 text-sm text-gray-500">
                Loading team activity...
              </p>

            </div>

          </div>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          !error &&
          activities.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">

                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Activity className="w-7 h-7 text-gray-400" />
                </div>

                <h2 className="text-base font-semibold text-gray-900">
                  No team activity yet
                </h2>

                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  When campaigns are created, updated,
                  or teams are assigned, the activity
                  will appear here.
                </p>

              </div>

            </div>
          )}


        {/* =================================================
            ACTIVITY FEED
        ================================================= */}

        {!loading &&
          activities.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

              <div className="px-5 py-4 border-b border-gray-200">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Recent Activity
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Showing {activities.length}{' '}
                      recent activities
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    Latest first
                  </div>

                </div>

              </div>


              <div className="divide-y divide-gray-100">

                {activities.map(
                  (
                    activity,
                    index
                  ) => {
                    const Icon =
                      getActivityIcon(
                        activity
                      );

                    const iconStyle =
                      getActivityIconStyle(
                        activity
                      );

                    const title =
                      getActivityTitle(
                        activity
                      );

                    const description =
                      getActivityDescription(
                        activity
                      );

                    const actor =
                      getActorName(
                        activity
                      );

                    const date =
                      getActivityDate(
                        activity
                      );

                    return (
                      <div
                        key={
                          activity.id ??
                          index
                        }
                        className="relative px-5 py-5 hover:bg-gray-50/70 transition-colors"
                      >

                        <div className="flex gap-4">

                          {/* ICON */}

                          <div className="relative flex-shrink-0">

                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyle}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            {index <
                              activities.length -
                                1 && (
                              <div className="absolute left-1/2 top-10 bottom-[-21px] w-px bg-gray-200 -translate-x-1/2" />
                            )}

                          </div>


                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">

                              <div>

                                <h3 className="text-sm font-semibold text-gray-900">
                                  {title}
                                </h3>

                                <p className="text-sm text-gray-600 mt-1">
                                  {description}
                                </p>

                              </div>

                              <span className="flex-shrink-0 text-xs text-gray-400 sm:ml-4">
                                {formatDate(
                                  date
                                )}
                              </span>

                            </div>


                            {/* ACTOR / CAMPAIGN */}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">

                              <div className="flex items-center gap-1.5 text-xs text-gray-500">

                                <UserPlus className="w-3.5 h-3.5" />

                                <span>
                                  {actor}
                                </span>

                              </div>

                              {activity.campaign_name && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">

                                  <Megaphone className="w-3.5 h-3.5" />

                                  <span>
                                    {
                                      activity.campaign_name
                                    }
                                  </span>

                                </div>
                              )}

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

      </div>
    </div>
  );
}

export default TeamActivityPage;