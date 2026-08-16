import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  LayoutGrid,
  Columns,
  Square,
  AlertCircle,
  RefreshCw,
  Edit,
  XCircle,
  Save,
  Upload,
  Trash2,
} from 'lucide-react';

import {
  Card,
  Badge,
  Button,
  Modal,
} from '../components/ui';

import {
  postService,
  campaignService,
  accountService,
  uploadService,
} from '../services/api';

import {
  getPlatformConfig,
  formatTime,
  cn,
} from '../utils/helpers';

type ViewMode = 'month' | 'week' | 'day';

interface SocialAccount {
  id: number;
  platform?: string;
  account_name?: string | null;
  account_id?: string | null;
}

interface CalendarPost {
  id: string;
  content: string;
  platforms: string[];
  date: Date;
  status: string;
  campaign?: string;
  campaign_id?: number | null;
  social_account_ids?: number[];
  media_url?: string | null;
  media_type?: string;
  timezone?: string;
}

interface ApiPost {
  id: number | string;
  content?: string | null;
  scheduled_time?: string | null;
  status?: string;
  campaign_id?: number | null;
  social_accounts?: any[];
  post_social_accounts?: any[];
  social_account_ids?: number[];
  media_url?: string | null;
  media_type?: string;
  timezone?: string;
}

interface Campaign {
  id: number | string;
  name?: string;
  title?: string;
  status?: string;
  color?: string;
}

const weekdays = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  publishing: 'bg-indigo-500',
  published: 'bg-emerald-500',
  draft: 'bg-gray-400',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
  pending_approval: 'bg-amber-500',
};

const parseScheduledDate = (
  scheduledTime?: string | null
): Date | null => {
  if (!scheduledTime) {
    return null;
  }

  const value = String(scheduledTime).trim();

  if (!value) {
    return null;
  }

  let normalizedValue = value;

  const hasTimezone =
    /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);

  if (!hasTimezone) {
    normalizedValue = `${value}Z`;
  }

  const parsed = new Date(normalizedValue);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const formatDateForDebug = (date: Date) => {
  return {
    local: date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    iso: date.toISOString(),
  };
};

const getISTDateTime = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || '';

  return {
    date: `${getPart('year')}-${getPart('month')}-${getPart(
      'day'
    )}`,
    time: `${getPart('hour')}:${getPart('minute')}`,
  };
};

const normalizePlatform = (platform?: string) => {
  if (!platform) {
    return '';
  }

  return String(platform)
    .toLowerCase()
    .trim();
};

const normalizeMediaType = (mediaType?: string | null) => {
  if (!mediaType) {
    return 'text';
  }

  return String(mediaType).toLowerCase();
};

export function CalendarPage() {
  const navigateTo = useNavigate();

  const [viewMode, setViewMode] =
    useState<ViewMode>('month');

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedPost, setSelectedPost] =
    useState<CalendarPost | null>(null);

  const [showPostModal, setShowPostModal] =
    useState(false);

  const [posts, setPosts] =
    useState<CalendarPost[]>([]);

  const [campaigns, setCampaigns] =
    useState<Campaign[]>([]);

  const [socialAccounts, setSocialAccounts] =
    useState<SocialAccount[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingAccounts, setLoadingAccounts] =
    useState(false);

  const [error, setError] =
    useState('');

  const [refreshing, setRefreshing] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [editContent, setEditContent] =
    useState('');

  const [editDate, setEditDate] =
    useState('');

  const [editTime, setEditTime] =
    useState('');

  const [editSocialAccountIds, setEditSocialAccountIds] =
    useState<number[]>([]);

  const [editMediaUrl, setEditMediaUrl] =
    useState<string | null>(null);

  const [editMediaType, setEditMediaType] =
    useState('text');

  const [selectedMediaFile, setSelectedMediaFile] =
    useState<File | null>(null);

  const [uploadingMedia, setUploadingMedia] =
    useState(false);

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [cancellingPost, setCancellingPost] =
    useState(false);

  const userRole =
    localStorage.getItem('user_role');

  const canSchedulePost =
    userRole === 'marketing_team' ||
    userRole === 'content_creator';

  const getPostPlatforms = (
    post: ApiPost
  ): string[] => {
    const accounts =
      post.social_accounts ||
      post.post_social_accounts ||
      [];

    if (Array.isArray(accounts) && accounts.length > 0) {
      return accounts
        .map((item: any) => {
          const account =
            item.social_account ||
            item.account ||
            item;

          return normalizePlatform(
            account.platform
          );
        })
        .filter(Boolean);
    }

    if (
      Array.isArray(post.social_account_ids) &&
      post.social_account_ids.length > 0
    ) {
      return post.social_account_ids.map(
        (id) => String(id)
      );
    }

    return [];
  };

  const getPostSocialAccountIds = (
    post: ApiPost
  ): number[] => {
    if (
      Array.isArray(post.social_account_ids)
    ) {
      return post.social_account_ids
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id));
    }

    const accounts =
      post.social_accounts ||
      post.post_social_accounts ||
      [];

    if (!Array.isArray(accounts)) {
      return [];
    }

    return accounts
      .map((item: any) => {
        const account =
          item.social_account ||
          item.account ||
          item;

        return Number(
          account.id
        );
      })
      .filter(
        (id) =>
          !Number.isNaN(id)
      );
  };

  const loadSocialAccounts = async () => {
    try {
      setLoadingAccounts(true);

      const response =
        await accountService.getAll();

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.items ||
            response.data?.accounts ||
            response.data?.social_accounts ||
            [];

      setSocialAccounts(data);
    } catch (err) {
      console.error(
        'Social accounts loading error:',
        err
      );
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadCalendarData = async (
    showRefreshLoader = false
  ) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const [
        postsResponse,
        campaignsResponse,
      ] = await Promise.all([
        postService.getCalendar(),
        campaignService.getAll(),
      ]);

      console.log(
        'Calendar posts API response:',
        postsResponse.data
      );

      console.log(
        'Calendar campaigns API response:',
        campaignsResponse.data
      );

      const postsData =
        Array.isArray(postsResponse.data)
          ? postsResponse.data
          : postsResponse.data?.items ||
            postsResponse.data?.posts ||
            [];

      const campaignsData =
        Array.isArray(campaignsResponse.data)
          ? campaignsResponse.data
          : campaignsResponse.data?.items ||
            campaignsResponse.data?.campaigns ||
            [];

      const campaignMap =
        new Map<string, Campaign>();

      campaignsData.forEach(
        (campaign: Campaign) => {
          campaignMap.set(
            String(campaign.id),
            campaign
          );
        }
      );

      const transformedPosts: CalendarPost[] =
        postsData
          .filter((post: ApiPost) => {
            return Boolean(
              post.scheduled_time
            );
          })
          .map((post: ApiPost) => {
            const parsedDate =
              parseScheduledDate(
                post.scheduled_time
              );

            if (!parsedDate) {
              console.warn(
                'Invalid scheduled_time for post:',
                post.id,
                post.scheduled_time
              );

              return null;
            }

            const postPlatforms =
              getPostPlatforms(post);

            const socialAccountIds =
              getPostSocialAccountIds(post);

            const campaign =
              post.campaign_id !== null &&
              post.campaign_id !== undefined
                ? campaignMap.get(
                    String(
                      post.campaign_id
                    )
                  )
                : undefined;

            console.log(
              `Calendar post ${post.id} date:`,
              {
                backend:
                  post.scheduled_time,
                ...formatDateForDebug(
                  parsedDate
                ),
              }
            );

            return {
              id: String(post.id),

              content:
                post.content ||
                'No content',

              platforms:
                postPlatforms,

              date:
                parsedDate,

              status:
                String(
                  post.status ||
                    'scheduled'
                ).toLowerCase(),

              campaign:
                campaign?.name ||
                campaign?.title ||
                undefined,

              campaign_id:
                post.campaign_id,

              social_account_ids:
                socialAccountIds,

              media_url:
                post.media_url,

              media_type:
                post.media_type,

              timezone:
                post.timezone ||
                'Asia/Kolkata',
            };
          })
          .filter(
            (
              post
            ): post is CalendarPost =>
              post !== null
          );

      setPosts(
        transformedPosts
      );

      setCampaigns(
        campaignsData
      );
    } catch (err: any) {
      console.error(
        'Calendar data loading error:',
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          'Your session has expired. Please log in again.'
        );
      } else {
        setError(
          err.response?.data?.detail ||
            'Unable to load calendar data from the server.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
    loadSocialAccounts();
  }, []);

  const getPostsForDate = (
    date: Date
  ) => {
    return posts.filter(
      (post) =>
        post.date.getFullYear() ===
          date.getFullYear() &&
        post.date.getMonth() ===
          date.getMonth() &&
        post.date.getDate() ===
          date.getDate()
    );
  };

  const getCampaignColor = (
    campaignName?: string
  ) => {
    if (!campaignName) {
      return undefined;
    }

    const campaign =
      campaigns.find(
        (item) =>
          (item.name ||
            item.title) ===
          campaignName
      );

    return campaign?.color;
  };

  const navigateCalendar = (
    direction:
      | 'prev'
      | 'next'
      | 'today'
  ) => {
    if (
      direction === 'today'
    ) {
      setCurrentDate(
        new Date()
      );

      return;
    }

    const newDate =
      new Date(currentDate);

    if (
      viewMode === 'month'
    ) {
      newDate.setMonth(
        newDate.getMonth() +
          (direction === 'next'
            ? 1
            : -1)
      );
    } else if (
      viewMode === 'week'
    ) {
      newDate.setDate(
        newDate.getDate() +
          (direction === 'next'
            ? 7
            : -7)
      );
    } else {
      newDate.setDate(
        newDate.getDate() +
          (direction === 'next'
            ? 1
            : -1)
      );
    }

    setCurrentDate(
      newDate
    );
  };

  const headerTitle = (() => {
    if (
      viewMode === 'month'
    ) {
      return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }

    if (
      viewMode === 'week'
    ) {
      const start =
        new Date(currentDate);

      start.setDate(
        start.getDate() -
          start.getDay()
      );

      const end =
        new Date(start);

      end.setDate(
        end.getDate() + 6
      );

      return `${months[start.getMonth()].slice(0, 3)} ${start.getDate()} - ${months[end.getMonth()].slice(0, 3)} ${end.getDate()}, ${end.getFullYear()}`;
    }

    return `${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  })();

  const openPost = (
    post: CalendarPost
  ) => {
    setSelectedPost(post);

    setIsEditing(false);

    setEditContent(
      post.content
    );

    const istDateTime =
      getISTDateTime(
        post.date
      );

    setEditDate(
      istDateTime.date
    );

    setEditTime(
      istDateTime.time
    );

    setEditSocialAccountIds(
      post.social_account_ids || []
    );

    setEditMediaUrl(
      post.media_url || null
    );

    setEditMediaType(
      normalizeMediaType(
        post.media_type
      )
    );

    setSelectedMediaFile(null);

    setShowPostModal(true);
  };

  const startEditing = () => {
    if (!selectedPost) {
      return;
    }

    if (
      selectedPost.status ===
        'cancelled' ||
      selectedPost.status ===
        'published' ||
      selectedPost.status ===
        'publishing'
    ) {
      setError(
        'This post cannot be edited in its current status.'
      );

      return;
    }

    if (
      socialAccounts.length === 0
    ) {
      loadSocialAccounts();
    }

    setIsEditing(true);
  };

  const toggleSocialAccount = (
    accountId: number
  ) => {
    setEditSocialAccountIds(
      (current) => {
        if (
          current.includes(accountId)
        ) {
          return current.filter(
            (id) =>
              id !== accountId
          );
        }

        return [
          ...current,
          accountId,
        ];
      }
    );
  };

  const handleMediaFileChange = (
    file: File | null
  ) => {
    if (!file) {
      return;
    }

    const fileType =
      file.type.toLowerCase();

    let mediaType =
      '';

    if (
      fileType.startsWith(
        'image/'
      )
    ) {
      mediaType = 'image';
    } else if (
      fileType.startsWith(
        'video/'
      )
    ) {
      mediaType = 'video';
    } else {
      setError(
        'Please select an image or video file.'
      );

      return;
    }

    setError('');

    setSelectedMediaFile(
      file
    );

    setEditMediaType(
      mediaType
    );
  };

  const uploadSelectedMedia =
    async (): Promise<
      string | null
    > => {
      if (!selectedMediaFile) {
        return editMediaUrl;
      }

      try {
        setUploadingMedia(true);
        setError('');

        const response =
          await uploadService.uploadMedia(
            selectedMediaFile
          );

        const uploadedUrl =
          response.data?.url ||
          response.data?.media_url ||
          response.data?.file_url;

        if (!uploadedUrl) {
          throw new Error(
            'Media upload succeeded but no media URL was returned.'
          );
        }

        setEditMediaUrl(
          uploadedUrl
        );

        setSelectedMediaFile(
          null
        );

        return uploadedUrl;
      } catch (err: any) {
        console.error(
          'Media upload error:',
          err
        );

        const detail =
          err.response?.data?.detail;

        setError(
          detail ||
            'Unable to upload the media file. Please try again.'
        );

        return null;
      } finally {
        setUploadingMedia(false);
      }
    };

  const removeMedia = () => {
    setEditMediaUrl(
      null
    );

    setSelectedMediaFile(
      null
    );

    setEditMediaType(
      'text'
    );
  };

  const saveEditedPost = async () => {
    if (!selectedPost) {
      return;
    }

    if (!editContent.trim()) {
      setError(
        'Post content cannot be empty.'
      );

      return;
    }

    if (!editDate || !editTime) {
      setError(
        'Please provide both date and time.'
      );

      return;
    }

    if (
      editSocialAccountIds.length ===
      0
    ) {
      setError(
        'At least one social account is required for a scheduled post.'
      );

      return;
    }

    try {
      setSavingEdit(true);
      setError('');

      let finalMediaUrl =
        editMediaUrl;

      if (selectedMediaFile) {
        finalMediaUrl =
          await uploadSelectedMedia();

        if (!finalMediaUrl) {
          return;
        }
      }

      const finalMediaType =
        finalMediaUrl
          ? editMediaType
          : 'text';

      const updateData = {
        content:
          editContent.trim(),

        scheduled_time:
          `${editDate}T${editTime}:00`,

        timezone:
          'Asia/Kolkata',

        social_account_ids:
          editSocialAccountIds,

        media_url:
          finalMediaUrl,

        media_type:
          finalMediaType,
      };

      console.log(
        'Updating post:',
        {
          id: selectedPost.id,
          data: updateData,
        }
      );

      const response =
        await postService.update(
          selectedPost.id,
          updateData
        );

      console.log(
        'Update post response:',
        response.data
      );

      setIsEditing(false);
      setShowPostModal(false);
      setSelectedPost(null);

      await loadCalendarData(
        true
      );
    } catch (err: any) {
      console.error(
        'Update post error:',
        err
      );

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item: any) =>
                item.msg ||
                'Validation error'
            )
            .join(', ')
        );
      } else {
        setError(
          detail ||
            'Unable to update the post. Please try again.'
        );
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelSelectedPost =
    async () => {
      if (!selectedPost) {
        return;
      }

      if (
        selectedPost.status ===
        'cancelled'
      ) {
        setError(
          'This post is already cancelled.'
        );

        return;
      }

      if (
        selectedPost.status ===
          'published' ||
        selectedPost.status ===
          'publishing'
      ) {
        setError(
          'A published or currently publishing post cannot be cancelled.'
        );

        return;
      }

      const confirmed =
        window.confirm(
          'Are you sure you want to cancel this scheduled post?'
        );

      if (!confirmed) {
        return;
      }

      try {
        setCancellingPost(true);
        setError('');

        console.log(
          'Cancelling post:',
          selectedPost.id
        );

        const response =
          await postService.cancel(
            selectedPost.id
          );

        console.log(
          'Cancel post response:',
          response.data
        );

        setShowPostModal(false);
        setSelectedPost(null);

        await loadCalendarData(
          true
        );
      } catch (err: any) {
        console.error(
          'Cancel post error:',
          err
        );

        const detail =
          err.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map(
                (item: any) =>
                  item.msg ||
                  'Cancellation validation error'
              )
              .join(', ')
          );
        } else {
          setError(
            detail ||
              'Unable to cancel the post. Please try again.'
          );
        }
      } finally {
        setCancellingPost(false);
      }
    };

  const renderPostButton = (
    post: CalendarPost
  ) => {
    const campaignColor =
      getCampaignColor(
        post.campaign
      );

    return (
      <motion.button
        key={post.id}
        whileHover={{
          scale: 1.02,
        }}
        onClick={() =>
          openPost(post)
        }
        className={cn(
          'w-full text-left px-1.5 py-1 rounded-md text-[10px] sm:text-xs font-medium text-white truncate flex items-center gap-1',
          statusColors[
            post.status
          ] ||
            'bg-indigo-500'
        )}
        style={
          campaignColor
            ? {
                backgroundColor:
                  campaignColor,
              }
            : undefined
        }
      >
        <Clock className="w-2.5 h-2.5 flex-shrink-0" />

        <span className="truncate">
          {formatTime(
            post.date.toISOString()
          )}
        </span>
      </motion.button>
    );
  };

  const renderMonthView =
    () => {
      const year =
        currentDate.getFullYear();

      const month =
        currentDate.getMonth();

      const firstDay =
        new Date(
          year,
          month,
          1
        ).getDay();

      const daysInMonth =
        new Date(
          year,
          month + 1,
          0
        ).getDate();

      const daysInPrevMonth =
        new Date(
          year,
          month,
          0
        ).getDate();

      const today =
        new Date();

      const cells: {
        date: Date;
        current: boolean;
      }[] = [];

      for (
        let i =
          firstDay - 1;
        i >= 0;
        i--
      ) {
        cells.push({
          date: new Date(
            year,
            month - 1,
            daysInPrevMonth - i
          ),
          current: false,
        });
      }

      for (
        let i = 1;
        i <= daysInMonth;
        i++
      ) {
        cells.push({
          date: new Date(
            year,
            month,
            i
          ),
          current: true,
        });
      }

      const remaining =
        42 - cells.length;

      for (
        let i = 1;
        i <= remaining;
        i++
      ) {
        cells.push({
          date: new Date(
            year,
            month + 1,
            i
          ),
          current: false,
        });
      }

      return (
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
          {weekdays.map(
            (day) => (
              <div
                key={day}
                className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-600"
              >
                {day}
              </div>
            )
          )}

          {cells.map(
            (
              cell,
              idx
            ) => {
              const dayPosts =
                getPostsForDate(
                  cell.date
                );

              const isToday =
                cell.date.toDateString() ===
                today.toDateString();

              return (
                <div
                  key={idx}
                  className={cn(
                    'bg-white min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 relative group',
                    !cell.current &&
                      'bg-gray-50/50',
                    isToday &&
                      'ring-2 ring-indigo-500 ring-inset'
                  )}
                >
                  <div
                    className={cn(
                      'text-xs font-medium mb-1 inline-flex w-6 h-6 items-center justify-center rounded-full',
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : cell.current
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    )}
                  >
                    {cell.date.getDate()}
                  </div>

                  <div className="space-y-1">
                    {dayPosts
                      .slice(
                        0,
                        3
                      )
                      .map(
                        (
                          post
                        ) =>
                          renderPostButton(
                            post
                          )
                      )}

                    {dayPosts.length >
                      3 && (
                      <p className="text-[10px] text-gray-500 px-1">
                        +
                        {dayPosts.length -
                          3}{' '}
                        more
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      );
    };

  const renderWeekView =
    () => {
      const start =
        new Date(
          currentDate
        );

      start.setDate(
        start.getDate() -
          start.getDay()
      );

      const hours =
        Array.from(
          {
            length: 24,
          },
          (_, i) => i
        );

      const today =
        new Date();

      return (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50" />

              {Array.from(
                {
                  length: 7,
                }
              ).map(
                (_, i) => {
                  const date =
                    new Date(
                      start
                    );

                  date.setDate(
                    date.getDate() +
                      i
                  );

                  const isToday =
                    date.toDateString() ===
                    today.toDateString();

                  return (
                    <div
                      key={i}
                      className="bg-gray-50 py-2 text-center"
                    >
                      <p className="text-xs font-semibold text-gray-600">
                        {
                          weekdays[
                            i
                          ]
                        }
                      </p>

                      <p
                        className={cn(
                          'text-sm font-bold mt-0.5 inline-flex w-7 h-7 items-center justify-center rounded-full',
                          isToday
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-900'
                        )}
                      >
                        {date.getDate()}
                      </p>
                    </div>
                  );
                }
              )}

              {hours
                .filter(
                  (h) =>
                    h >= 6 &&
                    h <= 22
                )
                .map(
                  (hour) => (
                    <div
                      key={hour}
                      className="contents"
                    >
                      <div className="bg-white px-2 py-3 text-xs text-gray-400 text-right">
                        {hour ===
                        12
                          ? '12 PM'
                          : hour >
                            12
                          ? `${
                              hour -
                              12
                            } PM`
                          : `${hour} AM`}
                      </div>

                      {Array.from(
                        {
                          length: 7,
                        }
                      ).map(
                        (
                          _,
                          dayIdx
                        ) => {
                          const date =
                            new Date(
                              start
                            );

                          date.setDate(
                            date.getDate() +
                              dayIdx
                          );

                          const hourPosts =
                            posts.filter(
                              (
                                post
                              ) =>
                                post.date.getFullYear() ===
                                  date.getFullYear() &&
                                post.date.getMonth() ===
                                  date.getMonth() &&
                                post.date.getDate() ===
                                  date.getDate() &&
                                post.date.getHours() ===
                                  hour
                            );

                          return (
                            <div
                              key={`d-${dayIdx}-h-${hour}`}
                              className="bg-white min-h-[50px] p-1 relative"
                            >
                              {hourPosts.map(
                                (
                                  post
                                ) => (
                                  <motion.button
                                    key={
                                      post.id
                                    }
                                    whileHover={{
                                      scale: 1.02,
                                    }}
                                    onClick={() =>
                                      openPost(
                                        post
                                      )
                                    }
                                    className={cn(
                                      'w-full text-left px-1.5 py-1 rounded-md text-[10px] font-medium text-white truncate flex items-center gap-1',
                                      statusColors[
                                        post.status
                                      ] ||
                                        'bg-indigo-500'
                                    )}
                                  >
                                    <span className="truncate">
                                      {post.content.slice(
                                        0,
                                        30
                                      )}
                                      ...
                                    </span>
                                  </motion.button>
                                )
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      );
    };

  const renderDayView =
    () => {
      const hours =
        Array.from(
          {
            length: 24,
          },
          (_, i) => i
        );

      const dayPosts =
        posts.filter(
          (post) =>
            post.date.getFullYear() ===
              currentDate.getFullYear() &&
            post.date.getMonth() ===
              currentDate.getMonth() &&
            post.date.getDate() ===
              currentDate.getDate()
        );

      return (
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-[80px_1fr] gap-px bg-gray-200 rounded-xl overflow-hidden">
            {hours
              .filter(
                (h) =>
                  h >= 6 &&
                  h <= 22
              )
              .map(
                (hour) => (
                  <div
                    key={hour}
                    className="contents"
                  >
                    <div className="bg-white px-3 py-4 text-xs text-gray-400 text-right">
                      {hour ===
                      12
                        ? '12 PM'
                        : hour >
                          12
                        ? `${
                            hour -
                            12
                          } PM`
                        : `${hour} AM`}
                    </div>

                    <div className="bg-white min-h-[60px] p-2">
                      {dayPosts
                        .filter(
                          (
                            post
                          ) =>
                            post.date.getHours() ===
                            hour
                        )
                        .map(
                          (
                            post
                          ) => (
                            <motion.button
                              key={
                                post.id
                              }
                              whileHover={{
                                scale: 1.01,
                              }}
                              onClick={() =>
                                openPost(
                                  post
                                )
                              }
                              className={cn(
                                'w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-white flex items-center gap-2',
                                statusColors[
                                  post.status
                                ] ||
                                  'bg-indigo-500'
                              )}
                            >
                              <Clock className="w-3 h-3 flex-shrink-0" />

                              <span className="truncate">
                                {formatTime(
                                  post.date.toISOString()
                                )}{' '}
                                -{' '}
                                {post.content.slice(
                                  0,
                                  40
                                )}
                                ...
                              </span>
                            </motion.button>
                          )
                        )}
                    </div>
                  </div>
                )
              )}
          </div>

          {dayPosts.length ===
            0 && (
            <div className="text-center py-12">
              <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />

              <p className="text-sm text-gray-500">
                No posts scheduled
                for this day
              </p>
            </div>
          )}
        </div>
      );
    };

  const viewModes: {
    mode: ViewMode;
    icon: any;
    label: string;
  }[] = [
    {
      mode: 'month',
      icon: Square,
      label: 'Month',
    },
    {
      mode: 'week',
      icon: Columns,
      label: 'Week',
    },
    {
      mode: 'day',
      icon: LayoutGrid,
      label: 'Day',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Content Calendar
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            View and manage your scheduled content
          </p>
        </div>

        {canSchedulePost && (
          <Button
            icon={
              <Plus className="w-4 h-4" />
            }
            onClick={() =>
              navigateTo(
                '/app/create-post'
              )
            }
          >
            Schedule Post
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />

          <span>{error}</span>

          <button
            type="button"
            className="ml-auto text-red-500 hover:text-red-700"
            onClick={() =>
              setError('')
            }
          >
            ×
          </button>
        </div>
      )}

      <Card className="p-3 flex flex-wrap items-center gap-4">
        <span className="text-xs font-medium text-gray-500">
          Campaigns:
        </span>

        {campaigns
          .filter(
            (campaign) =>
              campaign.status !==
              'draft'
          )
          .map(
            (campaign) => {
              const name =
                campaign.name ||
                campaign.title ||
                `Campaign ${campaign.id}`;

              return (
                <div
                  key={
                    campaign.id
                  }
                  className="flex items-center gap-1.5"
                >
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor:
                        campaign.color ||
                        '#6366f1',
                    }}
                  />

                  <span className="text-xs text-gray-600">
                    {name}
                  </span>
                </div>
              );
            }
          )}

        <div className="w-px h-4 bg-gray-200 mx-2" />

        <span className="text-xs font-medium text-gray-500">
          Status:
        </span>

        {[
          {
            label: 'Scheduled',
            color: 'bg-blue-500',
          },
          {
            label: 'Published',
            color:
              'bg-emerald-500',
          },
          {
            label: 'Draft',
            color:
              'bg-gray-400',
          },
          {
            label: 'Failed',
            color:
              'bg-red-500',
          },
          {
            label: 'Cancelled',
            color:
              'bg-gray-500',
          },
        ].map((status) => (
          <div
            key={
              status.label
            }
            className="flex items-center gap-1.5"
          >
            <div
              className={cn(
                'w-3 h-3 rounded',
                status.color
              )}
            />

            <span className="text-xs text-gray-600">
              {status.label}
            </span>
          </div>
        ))}
      </Card>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                navigateCalendar(
                  'today'
                )
              }
            >
              Today
            </Button>

            <div className="flex">
              <button
                onClick={() =>
                  navigateCalendar(
                    'prev'
                  )
                }
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <button
                onClick={() =>
                  navigateCalendar(
                    'next'
                  )
                }
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 ml-2">
              {headerTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                loadCalendarData(
                  true
                )
              }
              disabled={
                refreshing
              }
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh calendar"
            >
              <RefreshCw
                className={cn(
                  'w-4 h-4 text-gray-600',
                  refreshing &&
                    'animate-spin'
                )}
              />
            </button>

            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
              {viewModes.map(
                (vm) => (
                  <button
                    key={
                      vm.mode
                    }
                    onClick={() =>
                      setViewMode(
                        vm.mode
                      )
                    }
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      viewMode ===
                        vm.mode
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <vm.icon className="w-3.5 h-3.5" />

                    {vm.label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-indigo-500 mx-auto mb-3 animate-spin" />

            <p className="text-sm text-gray-500">
              Loading calendar data...
            </p>
          </div>
        ) : posts.length ===
          0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />

            <p className="text-sm font-medium text-gray-600">
              No scheduled posts found
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {canSchedulePost
                ? 'Create a scheduled post from the Create Post page and it will appear here.'
                : 'Scheduled posts for your business will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode ===
              'month' &&
              renderMonthView()}

            {viewMode ===
              'week' &&
              renderWeekView()}

            {viewMode ===
              'day' &&
              renderDayView()}
          </>
        )}
      </Card>

      <Modal
        isOpen={
          showPostModal
        }
        onClose={() => {
          if (
            !savingEdit &&
            !cancellingPost &&
            !uploadingMedia
          ) {
            setShowPostModal(
              false
            );
            setIsEditing(false);
            setSelectedMediaFile(
              null
            );
          }
        }}
        title={
          isEditing
            ? 'Edit Scheduled Post'
            : 'Post Details'
        }
        size="md"
      >
        {selectedPost && (
          <div className="space-y-4">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant={
                      selectedPost.status ===
                      'published'
                        ? 'success'
                        : selectedPost.status ===
                          'failed'
                        ? 'danger'
                        : selectedPost.status ===
                          'draft'
                        ? 'default'
                        : selectedPost.status ===
                          'cancelled'
                        ? 'default'
                        : 'info'
                    }
                    dot
                  >
                    {
                      selectedPost.status
                    }
                  </Badge>

                  <span className="text-xs text-gray-500 text-right">
                    {formatTime(
                      selectedPost.date.toISOString()
                    )}{' '}
                    ·{' '}
                    {selectedPost.date.toLocaleDateString(
                      'en-US',
                      {
                        weekday:
                          'long',
                        month:
                          'long',
                        day:
                          'numeric',
                        year:
                          'numeric',
                      }
                    )}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {
                      selectedPost.content
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Platforms
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    {selectedPost.platforms.length >
                    0 ? (
                      selectedPost.platforms.map(
                        (platform) => {
                          const config =
                            getPlatformConfig(
                              platform
                            );

                          const Icon =
                            config.icon;

                          return (
                            <div
                              key={
                                platform
                              }
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg"
                            >
                              <Icon
                                className="w-4 h-4"
                                style={{
                                  color:
                                    config.color,
                                }}
                              />

                              <span className="text-xs font-medium text-gray-700">
                                {
                                  config.name
                                }
                              </span>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <span className="text-xs text-gray-400">
                        Platform information unavailable
                      </span>
                    )}
                  </div>
                </div>

                {selectedPost.campaign && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Campaign
                    </p>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            getCampaignColor(
                              selectedPost.campaign
                            ) ||
                            '#6366f1',
                        }}
                      />

                      <span className="text-sm font-medium text-gray-900">
                        {
                          selectedPost.campaign
                        }
                      </span>
                    </div>
                  </div>
                )}

                {selectedPost.media_type &&
                  selectedPost.media_type !==
                    'text' && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Media
                      </p>

                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                          Type:{' '}
                          {
                            selectedPost.media_type
                          }
                        </p>

                        {selectedPost.media_url && (
                          <p className="text-xs text-gray-500 mt-1 break-all">
                            {
                              selectedPost.media_url
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() =>
                      setShowPostModal(
                        false
                      )
                    }
                    disabled={
                      cancellingPost
                    }
                  >
                    Close
                  </Button>

                  {selectedPost.status !==
                    'cancelled' &&
                    selectedPost.status !==
                      'published' &&
                    selectedPost.status !==
                      'publishing' && (
                      <>
                        <Button
                          variant="secondary"
                          fullWidth
                          icon={
                            <Edit className="w-4 h-4" />
                          }
                          onClick={
                            startEditing
                          }
                          disabled={
                            cancellingPost
                          }
                        >
                          Edit Post
                        </Button>

                        <Button
                          variant="danger"
                          fullWidth
                          icon={
                            <XCircle className="w-4 h-4" />
                          }
                          onClick={
                            cancelSelectedPost
                          }
                          loading={
                            cancellingPost
                          }
                          disabled={
                            cancellingPost
                          }
                        >
                          Cancel Post
                        </Button>
                      </>
                    )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Post Content
                  </label>

                  <textarea
                    value={
                      editContent
                    }
                    onChange={(e) =>
                      setEditContent(
                        e.target.value
                      )
                    }
                    rows={6}
                    maxLength={280}
                    disabled={
                      savingEdit ||
                      uploadingMedia
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none disabled:bg-gray-50"
                  />

                  <p className="text-xs text-gray-400 text-right mt-1">
                    {
                      editContent.length
                    }{' '}
                    / 280
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date
                    </label>

                    <div className="relative">
                      <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                      <input
                        type="date"
                        value={
                          editDate
                        }
                        onChange={(e) =>
                          setEditDate(
                            e.target.value
                          )
                        }
                        disabled={
                          savingEdit ||
                          uploadingMedia
                        }
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Time (IST)
                    </label>

                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                      <input
                        type="time"
                        value={
                          editTime
                        }
                        onChange={(e) =>
                          setEditTime(
                            e.target.value
                          )
                        }
                        disabled={
                          savingEdit ||
                          uploadingMedia
                        }
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <p className="text-xs text-indigo-700">
                    Schedule time is entered in{' '}
                    <strong>
                      IST (Asia/Kolkata)
                    </strong>
                    .
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Social Accounts
                    </label>

                    <span className="text-xs text-gray-400">
                      {
                        editSocialAccountIds.length
                      }{' '}
                      selected
                    </span>
                  </div>

                  {loadingAccounts ? (
                    <div className="flex items-center justify-center py-5 border border-gray-200 rounded-xl">
                      <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin mr-2" />

                      <span className="text-xs text-gray-500">
                        Loading social accounts...
                      </span>
                    </div>
                  ) : socialAccounts.length ===
                    0 ? (
                    <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
                      <p className="text-xs text-amber-700">
                        No connected social accounts were found.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {socialAccounts.map(
                        (
                          account
                        ) => {
                          const accountId =
                            Number(
                              account.id
                            );

                          const selected =
                            editSocialAccountIds.includes(
                              accountId
                            );

                          const platform =
                            normalizePlatform(
                              account.platform
                            );

                          let config:
                            any;

                          try {
                            config =
                              getPlatformConfig(
                                platform
                              );
                          } catch {
                            config =
                              null;
                          }

                          const Icon =
                            config?.icon;

                          return (
                            <button
                              type="button"
                              key={
                                account.id
                              }
                              onClick={() =>
                                toggleSocialAccount(
                                  accountId
                                )
                              }
                              disabled={
                                savingEdit ||
                                uploadingMedia
                              }
                              className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                                selected
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 bg-white hover:bg-gray-50'
                              )}
                            >
                              <div
                                className={cn(
                                  'w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0',
                                  selected
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : 'border-gray-300'
                                )}
                              >
                                {selected && (
                                  <span className="text-white text-xs font-bold">
                                    ✓
                                  </span>
                                )}
                              </div>

                              {Icon ? (
                                <Icon
                                  className="w-5 h-5"
                                  style={{
                                    color:
                                      config.color,
                                  }}
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-200" />
                              )}

                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800">
                                  {config?.name ||
                                    platform ||
                                    'Social Account'}
                                </p>

                                <p className="text-xs text-gray-500 truncate">
                                  {account.account_name ||
                                    account.account_id ||
                                    `Account ${account.id}`}
                                </p>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media
                  </label>

                  {editMediaUrl ? (
                    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700">
                            Current media
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            Type:{' '}
                            {editMediaType}
                          </p>

                          <p className="text-xs text-gray-500 mt-1 break-all">
                            {editMediaUrl}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={
                            removeMedia
                          }
                          disabled={
                            savingEdit ||
                            uploadingMedia
                          }
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                          title="Remove media"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-500">
                        No media attached
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <label
                      className={cn(
                        'flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors',
                        (savingEdit ||
                          uploadingMedia) &&
                          'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {uploadingMedia ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}

                      {uploadingMedia
                        ? 'Uploading...'
                        : editMediaUrl
                        ? 'Replace Media'
                        : 'Choose Media'}

                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        disabled={
                          savingEdit ||
                          uploadingMedia
                        }
                        onChange={(
                          e
                        ) => {
                          const file =
                            e.target.files?.[0] ||
                            null;

                          handleMediaFileChange(
                            file
                          );

                          e.target.value =
                            '';
                        }}
                      />
                    </label>

                    {selectedMediaFile && (
                      <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <p className="text-xs text-indigo-700">
                          New file selected:{' '}
                          <strong>
                            {
                              selectedMediaFile.name
                            }
                          </strong>
                        </p>

                        <p className="text-xs text-indigo-600 mt-1">
                          It will be uploaded when you save the post.
                        </p>
                      </div>
                    )}

                    <p className="text-[11px] text-gray-400 mt-2">
                      Supported: images and videos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() =>
                      setIsEditing(
                        false
                      )
                    }
                    disabled={
                      savingEdit ||
                      uploadingMedia
                    }
                  >
                    Back
                  </Button>

                  <Button
                    variant="primary"
                    fullWidth
                    icon={
                      <Save className="w-4 h-4" />
                    }
                    onClick={
                      saveEditedPost
                    }
                    loading={
                      savingEdit
                    }
                    disabled={
                      savingEdit ||
                      uploadingMedia
                    }
                  >
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

