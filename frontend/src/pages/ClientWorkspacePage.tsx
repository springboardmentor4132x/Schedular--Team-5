import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  FileText,
  BarChart2,
  CheckCircle,
  Clock,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  Upload,
  Video,
  Calendar,
  User,
  Mail,
  ArrowUpDown
} from 'lucide-react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const Card = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden',
      className
    )}
  >
    {children}
  </div>
);

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  [key: string]: any;
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all rounded-xl focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs focus:ring-2 focus:ring-indigo-500/20',
    secondary:
      'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200',
    danger:
      'bg-red-600 text-white hover:bg-red-700 shadow-xs focus:ring-2 focus:ring-red-500/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export function ClientWorkspacePage() {
  const { clientId } = useParams<{ clientId: string }>();

  const numericClientId = Number(clientId);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [client, setClient] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [submittingCampaign, setSubmittingCampaign] = useState(false);

  const [postContent, setPostContent] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'text'>('text');
  const [uploadingFile, setUploadingFile] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('auth_token');

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchWorkspaceData = async (isRefresh = false) => {
    if (!clientId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setDashboardError(null);

    try {
      const headers = getHeaders();

      const [clientRes, campaignsRes, postsRes, accountsRes] =
        await Promise.all([
          fetch(`/api/clients/${clientId}`, { headers }),
          fetch(`/api/clients/${clientId}/campaigns`, { headers }),
          fetch(`/api/posts?client_id=${numericClientId}`, { headers }),
          fetch(`/api/clients/${clientId}/social-accounts`, { headers })
        ]);

      const clientData = clientRes.ok
        ? await clientRes.json()
        : {
            id: numericClientId,
            name: `Client Account #${numericClientId}`,
            handle: `@client_${numericClientId}`,
            email: `client_${numericClientId}@example.com`
          };

      const campaignsData = campaignsRes.ok
        ? await campaignsRes.json()
        : [];

      const postsData = postsRes.ok
        ? await postsRes.json()
        : [];

      const accountsData = accountsRes.ok
        ? await accountsRes.json()
        : [];

      const finalPosts = Array.isArray(postsData)
        ? postsData
        : postsData.posts || [];

      setClient(clientData);

      setCampaigns(
        Array.isArray(campaignsData)
          ? campaignsData
          : campaignsData.campaigns || []
      );

      setPosts(finalPosts);

      setSocialAccounts(
        Array.isArray(accountsData)
          ? accountsData
          : accountsData.accounts || []
      );
    } catch (err: any) {
      console.error('Failed to load client workspace:', err);
      setDashboardError(
        err?.message || 'Failed to load client workspace.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchWorkspaceData();
    }
  }, [clientId]);

  const openCreateModal = () => {
    setEditingPostId(null);
    setPostContent('');
    setSelectedCampaignId(
      campaigns.length > 0 ? String(campaigns[0].id) : ''
    );
    setSelectedAccountIds([]);
    setScheduleDate('');
    setScheduleTime('');
    setSaveAsDraft(false);
    setUploadedMediaUrl('');
    setLocalPreviewUrl('');
    setMediaType('text');
    setModalError(null);
    setIsPostModalOpen(true);
  };

  const openEditModal = (post: any) => {
    setEditingPostId(String(post.id));
    setPostContent(post.content || '');

    setSelectedCampaignId(
      post.campaign_id ? String(post.campaign_id) : ''
    );

    setSelectedAccountIds(
      Array.isArray(post.social_account_ids)
        ? post.social_account_ids.map((id: any) => String(id))
        : []
    );

    if (post.scheduled_time) {
      const d = new Date(post.scheduled_time);

      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const parts = formatter.formatToParts(d);

      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;

      const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const time = timeFormatter.format(d);

      setScheduleDate(`${year}-${month}-${day}`);
      setScheduleTime(time);
    } else {
      setScheduleDate('');
      setScheduleTime('');
    }

    setSaveAsDraft(
      post.status === 'draft' || post.save_as_draft === true
    );

    setUploadedMediaUrl(post.media_url || '');
    setLocalPreviewUrl(post.media_url || '');

    setMediaType(
      post.media_type === 'image'
        ? 'image'
        : post.media_type === 'video'
        ? 'video'
        : 'text'
    );

    setModalError(null);
    setIsPostModalOpen(true);
  };

  const handleFileSelection = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadingFile(true);
    setModalError(null);

    const isVideo = file.type.startsWith('video');

    setMediaType(isVideo ? 'video' : 'image');

    const preview = URL.createObjectURL(file);

    setLocalPreviewUrl(preview);

    setTimeout(() => {
      setUploadedMediaUrl(preview);
      setUploadingFile(false);
    }, 600);
  };

  const removeSelectedMedia = () => {
    setUploadedMediaUrl('');
    setLocalPreviewUrl('');
    setMediaType('text');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertIndiaTimeToUTC = (
    date: string,
    time: string
  ): string => {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    const utcMillis = Date.UTC(
      year,
      month - 1,
      day,
      hour - 5,
      minute - 30
    );

    return new Date(utcMillis).toISOString();
  };

  const handleSavePostForm = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!numericClientId || Number.isNaN(numericClientId)) {
      setModalError('Invalid client ID.');
      return;
    }

    if (!postContent.trim()) {
      setModalError('Post content cannot be empty.');
      return;
    }

    if (!saveAsDraft && !scheduleDate) {
      setModalError('Please select a schedule date.');
      return;
    }

    if (!saveAsDraft && !scheduleTime) {
      setModalError('Please select a schedule time.');
      return;
    }

    if (
      !saveAsDraft &&
      selectedAccountIds.length === 0
    ) {
      setModalError(
        'Please select at least one social account.'
      );
      return;
    }

    setSubmittingPost(true);
    setModalError(null);

    try {
      let scheduledTimestamp: string | null = null;

      if (!saveAsDraft) {
        scheduledTimestamp = convertIndiaTimeToUTC(
          scheduleDate,
          scheduleTime
        );
      }

      const postPayload = {
        client_id: numericClientId,
        content: postContent.trim(),
        media_url: uploadedMediaUrl || null,
        media_type: uploadedMediaUrl ? mediaType : 'text',
        scheduled_time: scheduledTimestamp,
        timezone: 'Asia/Kolkata',
        campaign_id: selectedCampaignId
          ? Number(selectedCampaignId)
          : null,
        social_account_ids: selectedAccountIds.map(Number),
        save_as_draft: saveAsDraft
      };

      console.log(
        'POST /api/posts/ payload:',
        postPayload
      );

      const token = localStorage.getItem('auth_token');

      const endpoint = editingPostId
        ? `/api/posts/${editingPostId}`
        : '/api/posts/';

      const method = editingPostId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postPayload)
      });

      const responseText = await response.text();

      console.log(
        'POST /api/posts/ status:',
        response.status
      );

      console.log(
        'POST /api/posts/ response:',
        responseText
      );

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}.`;

        try {
          const errorData = JSON.parse(responseText);

          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((item: any) =>
                typeof item === 'string'
                  ? item
                  : item.msg || JSON.stringify(item)
              )
              .join(', ');
          } else if (errorData.detail) {
            errorMessage =
              typeof errorData.detail === 'string'
                ? errorData.detail
                : JSON.stringify(errorData.detail);
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          if (responseText) {
            errorMessage = responseText.substring(0, 500);
          }
        }

        throw new Error(errorMessage);
      }

      const savedPost = responseText
        ? JSON.parse(responseText)
        : null;

      if (savedPost) {
        setPosts(prev => {
          if (editingPostId) {
            return prev.map(p =>
              String(p.id) === String(editingPostId)
                ? savedPost
                : p
            );
          }

          return [savedPost, ...prev];
        });
      }

      setIsPostModalOpen(false);

      await fetchWorkspaceData(true);
    } catch (err: any) {
      console.error('Failed to save post:', err);

      setModalError(
        err?.message ||
          'Failed to save or schedule post.'
      );
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleCreateCampaign = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!campaignName.trim()) {
      return;
    }

    if (!numericClientId) {
      return;
    }

    setSubmittingCampaign(true);

    try {
      const token = localStorage.getItem('auth_token');

      const payload = {
        client_id: numericClientId,
        name: campaignName.trim(),
        description: campaignDescription.trim(),
        status: 'active'
      };

      const res = await fetch(
        `/api/clients/${clientId}/campaigns`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const responseText = await res.text();

      if (!res.ok) {
        throw new Error(
          responseText ||
            `Campaign creation failed with status ${res.status}`
        );
      }

      const newCamp = responseText
        ? JSON.parse(responseText)
        : null;

      if (newCamp) {
        setCampaigns(prev => [newCamp, ...prev]);
      }

      setIsCampaignModalOpen(false);
      setCampaignName('');
      setCampaignDescription('');
    } catch (err: any) {
      console.error('Campaign creation failed:', err);
    } finally {
      setSubmittingCampaign(false);
    }
  };

  const handleDeletePost = async (
    postId: string | number
  ) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this scheduled post?'
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `/api/posts/${postId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          `Delete failed with status ${response.status}`
        );
      }

      setPosts(prev =>
        prev.filter(
          p => String(p.id) !== String(postId)
        )
      );
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    const timeA = a.scheduled_time
      ? new Date(a.scheduled_time).getTime()
      : 0;

    const timeB = b.scheduled_time
      ? new Date(b.scheduled_time).getTime()
      : 0;

    return sortOrder === 'newest'
      ? timeB - timeA
      : timeA - timeB;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">
          Loading workspace profile context...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/app/clients"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Clients
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Client Workspace
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            Manage campaigns, posts, scheduling, publishing,
            and analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchWorkspaceData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={cn(
              'w-4 h-4 text-gray-500',
              refreshing && 'animate-spin'
            )}
          />
          Refresh
        </button>
      </div>

      {dashboardError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {dashboardError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xs">
                <User className="w-6 h-6" />
              </div>

              <div className="space-y-1 flex-1">
                <h2 className="text-xl font-bold text-gray-900 capitalize">
                  {client?.name}
                </h2>

                <p className="text-sm text-indigo-600 font-semibold">
                  {client?.handle}
                </p>

                {client?.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{client?.email}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">
                  Campaigns
                </h3>

                <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-md font-semibold">
                  {campaigns.length}
                </span>
              </div>

              <Button
                size="sm"
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() =>
                  setIsCampaignModalOpen(true)
                }
              >
                Create Campaign
              </Button>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
                No campaigns found for this client.
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map(camp => (
                  <div
                    key={camp.id}
                    className="p-4 border border-gray-100 bg-gray-50 rounded-xl flex items-center justify-between hover:border-gray-200 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {camp.name || camp.title}
                      </h4>

                      <p className="text-xs text-gray-400 mt-0.5">
                        {camp.description ||
                          'Campaign tracking group.'}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                      {camp.status || 'active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="font-bold text-gray-900">
                Posts Queue
              </h3>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setSortOrder(prev =>
                      prev === 'newest'
                        ? 'oldest'
                        : 'newest'
                    )
                  }
                  icon={
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  }
                >
                  Sort:{' '}
                  {sortOrder === 'newest'
                    ? 'Newest'
                    : 'Oldest'}
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={openCreateModal}
                >
                  New Post
                </Button>
              </div>
            </div>

            {sortedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-2">
                <FileText className="w-8 h-8 text-gray-300" />

                <p className="text-sm">
                  No scheduled posts found for this client
                  workspace.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedPosts.map(post => {
                  const matchedCampaign =
                    campaigns.find(
                      c =>
                        String(c.id) ===
                        String(post.campaign_id)
                    );

                  const isDraft =
                    post.status === 'draft' ||
                    post.save_as_draft === true;

                  return (
                    <div
                      key={post.id}
                      className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isDraft ? (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold text-[10px]">
                              Draft
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[10px]">
                              {post.status || 'Scheduled'}
                            </span>
                          )}

                          {matchedCampaign && (
                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium text-[10px]">
                              {matchedCampaign.name}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                          <span className="capitalize px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                            {post.media_type || 'text'}
                          </span>

                          {post.scheduled_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(
                                post.scheduled_time
                              ).toLocaleString('en-IN', {
                                timeZone:
                                  'Asia/Kolkata'
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {post.media_url && (
                          <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={post.media_url}
                              alt="Thumbnail asset"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(post)
                            }
                            title="Edit Post"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeletePost(post.id)
                            }
                            title="Delete Post"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              Analytics Overview
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                <span className="text-2xl font-black text-gray-900">
                  {posts.length}
                </span>

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
                  Total Posts
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                <span className="text-2xl font-black text-gray-900">
                  {campaigns.length}
                </span>

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
                  Total Campaigns
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isCampaignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() =>
                !submittingCampaign &&
                setIsCampaignModalOpen(false)
              }
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 16
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 16
              }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 border border-gray-100"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">
                  Create New Campaign
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setIsCampaignModalOpen(false)
                  }
                  disabled={submittingCampaign}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleCreateCampaign}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Campaign Name
                  </label>

                  <input
                    type="text"
                    required
                    value={campaignName}
                    onChange={e =>
                      setCampaignName(e.target.value)
                    }
                    placeholder="e.g., Summer Product Launch"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Description (Optional)
                  </label>

                  <textarea
                    rows={3}
                    value={campaignDescription}
                    onChange={e =>
                      setCampaignDescription(
                        e.target.value
                      )
                    }
                    placeholder="Brief objective of this campaign..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={submittingCampaign}
                    onClick={() =>
                      setIsCampaignModalOpen(false)
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={submittingCampaign}
                  >
                    Save Campaign
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() =>
                !submittingPost &&
                setIsPostModalOpen(false)
              }
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 16
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 16
              }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden z-10 border border-gray-100"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">
                  {editingPostId
                    ? 'Edit Contextual Post'
                    : 'New Contextual Post'}
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setIsPostModalOpen(false)
                  }
                  disabled={submittingPost}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSavePostForm}
                className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
              >
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />

                    <span>{modalError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Post Content
                  </label>

                  <textarea
                    rows={4}
                    value={postContent}
                    onChange={e =>
                      setPostContent(e.target.value)
                    }
                    placeholder="What do you want to share for this client?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Select Social Accounts
                  </label>

                  {socialAccounts.length === 0 ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-400">
                      No social accounts linked to this
                      client workspace.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
                      {socialAccounts.map(acc => {
                        const accountId = String(
                          acc.id
                        );

                        const isChecked =
                          selectedAccountIds.includes(
                            accountId
                          );

                        return (
                          <label
                            key={acc.id}
                            className="flex items-center gap-2.5 p-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={
                                submittingPost
                              }
                              onChange={e => {
                                if (
                                  e.target.checked
                                ) {
                                  setSelectedAccountIds(
                                    prev => [
                                      ...prev,
                                      accountId
                                    ]
                                  );
                                } else {
                                  setSelectedAccountIds(
                                    prev =>
                                      prev.filter(
                                        id =>
                                          id !==
                                          accountId
                                      )
                                  );
                                }
                              }}
                              className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500/20 cursor-pointer"
                            />

                            <span className="text-xs font-medium text-gray-800">
                              {acc.name ||
                                acc.platform_username}
                            </span>

                            <span className="ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                              {acc.platform}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Attached Media Assets
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelection}
                  />

                  {localPreviewUrl ? (
                    <div className="relative border border-gray-200 bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-16 h-16 bg-gray-200 border border-gray-300 rounded-lg overflow-hidden shrink-0 relative">
                          {mediaType === 'video' ? (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                              <Video className="w-5 h-5" />
                            </div>
                          ) : (
                            <img
                              src={localPreviewUrl}
                              alt="Selection preview"
                              className="w-full h-full object-cover"
                            />
                          )}

                          {uploadingFile && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {mediaType === 'video'
                              ? 'Video File Asset'
                              : 'Image File Asset'}
                          </p>

                          <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1 mt-0.5">
                            {uploadingFile ? (
                              <span className="text-indigo-600 animate-pulse font-semibold">
                                Uploading...
                              </span>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                Staged & Ready
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={
                          removeSelectedMedia
                        }
                        disabled={submittingPost}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        uploadingFile ||
                        submittingPost
                      }
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all text-gray-400 hover:text-indigo-600 group cursor-pointer"
                    >
                      <Upload className="w-6 h-6 stroke-[1.5] group-hover:scale-105 transition-transform duration-200 mb-1.5" />

                      <span className="text-xs font-semibold">
                        Upload Direct System Media
                      </span>

                      <span className="text-[10px] text-gray-400 mt-0.5 font-medium">
                        Supports JPEG, PNG, MP4 up to
                        50MB
                      </span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Schedule Date
                    </label>

                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                      <input
                        type="date"
                        disabled={
                          saveAsDraft ||
                          submittingPost
                        }
                        value={scheduleDate}
                        onChange={e =>
                          setScheduleDate(
                            e.target.value
                          )
                        }
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Schedule Time
                    </label>

                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                      <input
                        type="time"
                        disabled={
                          saveAsDraft ||
                          submittingPost
                        }
                        value={scheduleTime}
                        onChange={e =>
                          setScheduleTime(
                            e.target.value
                          )
                        }
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Link to Campaign (Optional)
                  </label>

                  <select
                    value={selectedCampaignId}
                    onChange={e =>
                      setSelectedCampaignId(
                        e.target.value
                      )
                    }
                    disabled={submittingPost}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="">None</option>

                    {campaigns.map(camp => (
                      <option
                        key={camp.id}
                        value={camp.id}
                      >
                        {camp.name || camp.title}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 select-none cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={saveAsDraft}
                    disabled={submittingPost}
                    onChange={e =>
                      setSaveAsDraft(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500/20 cursor-pointer"
                  />

                  <span className="text-xs text-gray-600 font-medium">
                    Save this post as a draft
                  </span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={submittingPost}
                    onClick={() =>
                      setIsPostModalOpen(false)
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={submittingPost}
                    disabled={uploadingFile}
                  >
                    {editingPostId
                      ? 'Update Post'
                      : 'Schedule Post'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}