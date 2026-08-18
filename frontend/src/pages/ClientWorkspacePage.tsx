import React, { useEffect, useRef, useState } from 'react';
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
  ArrowUpDown,
  Link2,
} from 'lucide-react';

import {
  postService,
  campaignService,
  accountService,
  businessAssignmentService,
} from '../services/api';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-gray-100 rounded-2xl shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
};

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
    'inline-flex items-center justify-center font-medium transition-all rounded-xl focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20',
    secondary:
      'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200',
    danger:
      'bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-2 focus:ring-red-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
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
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : icon}
      <span>{children}</span>
    </button>
  );
};

type MediaType = 'image' | 'video' | 'text';

const IMAGE_PLATFORMS = ['instagram', 'facebook', 'linkedin'];

const VIDEO_PLATFORMS = [
  'instagram',
  'facebook',
  'linkedin',
  'youtube',
];

export function ClientWorkspacePage() {
  const { clientId } = useParams<{ clientId: string }>();

  const numericClientId = Number(clientId);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboardError, setDashboardError] =
    useState<string | null>(null);

  const [client, setClient] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);

  const [sortOrder, setSortOrder] =
    useState<'newest' | 'oldest'>('newest');

  const [isPostModalOpen, setIsPostModalOpen] =
    useState(false);

  const [deletePostTarget, setDeletePostTarget] =
    useState<any>(null);

  const [deletingPost, setDeletingPost] =
    useState(false);

  const [editingPostId, setEditingPostId] =
    useState<string | null>(null);

  const [editingPost, setEditingPost] =
    useState<any>(null);

  const [modalError, setModalError] =
    useState<string | null>(null);

  const [modalSuccess, setModalSuccess] =
    useState<string | null>(null);

  const [submittingPost, setSubmittingPost] =
    useState(false);

  const [cancellingPost, setCancellingPost] =
    useState(false);

  const [isCampaignModalOpen, setIsCampaignModalOpen] =
    useState(false);

  const [campaignName, setCampaignName] =
    useState('');

  const [campaignDescription, setCampaignDescription] =
    useState('');

  const [submittingCampaign, setSubmittingCampaign] =
    useState(false);

  const [isReassignModalOpen, setIsReassignModalOpen] =
    useState(false);

  const [reassignPost, setReassignPost] =
    useState<any>(null);

  const [reassignCampaignId, setReassignCampaignId] =
    useState('');

  const [reassignError, setReassignError] =
    useState<string | null>(null);

  const [submittingReassign, setSubmittingReassign] =
    useState(false);

  const [postContent, setPostContent] =
    useState('');

  const [selectedCampaignId, setSelectedCampaignId] =
    useState('');

  const [selectedAccountIds, setSelectedAccountIds] =
    useState<string[]>([]);

  const [scheduleDate, setScheduleDate] =
    useState('');

  const [scheduleTime, setScheduleTime] =
    useState('');

  const [saveAsDraft, setSaveAsDraft] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [uploadedMediaUrl, setUploadedMediaUrl] =
    useState('');

  const [localPreviewUrl, setLocalPreviewUrl] =
    useState('');

  const [mediaType, setMediaType] =
    useState('text');

  const [uploadingFile, setUploadingFile] =
    useState(false);

  const [selectedFileName, setSelectedFileName] =
    useState('');

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const getPlatformName = (account: any) => {
    return String(
      account?.platform ||
        account?.provider ||
        ''
    ).toLowerCase();
  };

  const getAllowedPlatforms = (
    type: MediaType
  ) => {
    if (type === 'image') {
      return IMAGE_PLATFORMS;
    }

    if (type === 'video') {
      return VIDEO_PLATFORMS;
    }

    return [];
  };

  const isAccountAllowedForMedia = (
    account: any,
    type: MediaType
  ) => {
    if (type === 'text') {
      return true;
    }

    const platform =
      getPlatformName(account);

    return getAllowedPlatforms(type).includes(
      platform
    );
  };

  const getBackendBaseUrl = () => {
    const configuredUrl =
      (import.meta as any)?.env?.VITE_API_URL;

    if (configuredUrl) {
      return String(configuredUrl).replace(
        /\/$/,
        ''
      );
    }

    return 'http://127.0.0.1:8000';
  };

  const makeAbsoluteMediaUrl = (
    value: string
  ) => {
    if (!value) {
      return '';
    }

    if (
      value.startsWith('http://') ||
      value.startsWith('https://')
    ) {
      return value;
    }

    if (
      value.startsWith('blob:') ||
      value.startsWith('data:')
    ) {
      return '';
    }

    if (value.startsWith('/')) {
      return `${getBackendBaseUrl()}${value}`;
    }

    return `${getBackendBaseUrl()}/${value}`;
  };

  const uploadFileToBackend = async (
    file: File
  ): Promise<string> => {
    const token =
      localStorage.getItem('auth_token');

    if (!token) {
      throw new Error(
        'Authentication token not found. Please log in again.'
      );
    }

    const selectedPlatforms =
      socialAccounts
        .filter((account) =>
          selectedAccountIds.includes(
            String(account.id)
          )
        )
        .map((account) =>
          getPlatformName(account)
        )
        .filter(Boolean);

    let uploadPlatform =
      selectedPlatforms[0] || 'facebook';

    if (
      mediaType === 'image' &&
      !IMAGE_PLATFORMS.includes(
        uploadPlatform
      )
    ) {
      uploadPlatform = 'facebook';
    }

    if (
      mediaType === 'video' &&
      !VIDEO_PLATFORMS.includes(
        uploadPlatform
      )
    ) {
      uploadPlatform = 'facebook';
    }

    const formData = new FormData();

    formData.append('file', file);

    const uploadUrl =
      `${getBackendBaseUrl()}/uploads/?platform=${encodeURIComponent(
        uploadPlatform
      )}`;

    console.log(
      '>>> UPLOADING REAL MEDIA FILE'
    );

    console.log(
      '>>> UPLOAD URL:',
      uploadUrl
    );

    console.log(
      '>>> FILE NAME:',
      file.name
    );

    console.log(
      '>>> FILE TYPE:',
      file.type
    );

    console.log(
      '>>> FILE SIZE:',
      file.size
    );

    const response =
      await fetch(
        uploadUrl,
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: formData,
        }
      );

    const rawText =
      await response.text();

    let data: any = {};

    try {
      data = rawText
        ? JSON.parse(rawText)
        : {};
    } catch {
      data = {
        raw: rawText,
      };
    }

    console.log(
      '>>> UPLOAD STATUS:',
      response.status
    );

    console.log(
      '>>> UPLOAD RESPONSE:',
      data
    );

    if (!response.ok) {
      const detail =
        data?.detail ||
        data?.message ||
        data?.error ||
        rawText;

      throw new Error(
        typeof detail === 'string'
          ? detail
          : JSON.stringify(detail)
      );
    }

    const returnedUrl =
      data?.url ||
      data?.media_url ||
      data?.file_url ||
      data?.path ||
      data?.location ||
      data?.data?.url ||
      data?.data?.media_url;

    if (!returnedUrl) {
      throw new Error(
        'Upload succeeded, but the backend did not return a media URL.'
      );
    }

    const finalUrl =
      makeAbsoluteMediaUrl(
        String(returnedUrl)
      );

    if (!finalUrl) {
      throw new Error(
        'The backend returned an invalid media URL.'
      );
    }

    if (
      !finalUrl.startsWith('http://') &&
      !finalUrl.startsWith('https://')
    ) {
      throw new Error(
        `Invalid uploaded media URL: ${finalUrl}`
      );
    }

    console.log(
      '>>> FINAL MEDIA URL:',
      finalUrl
    );

    return finalUrl;
  };

  const fetchWorkspaceData = async (
    isRefresh = false
  ) => {
    if (
      !clientId ||
      !numericClientId ||
      Number.isNaN(numericClientId)
    ) {
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setDashboardError(null);

    try {
      console.log(
        'Loading workspace for client:',
        numericClientId
      );

      console.log(
        'AUTH TOKEN EXISTS:',
        !!localStorage.getItem(
          'auth_token'
        )
      );

      const [
        clientResponse,
        campaignsResponse,
        postsResponse,
        accountsResponse,
      ] = await Promise.all([
        businessAssignmentService
          .getClientDetails(
            numericClientId
          )
          .catch((error: any) => {
            console.error(
              'Client details request failed:',
              error
            );

            return null;
          }),

        campaignService
          .getAll(
            numericClientId
          )
          .catch((error: any) => {
            console.error(
              'Campaign request failed:',
              error
            );

            return null;
          }),

        postService
          .getAll(
            undefined,
            numericClientId
          )
          .catch((error: any) => {
            console.error(
              'Posts request failed:',
              error
            );

            throw error;
          }),

        accountService
          .getAll()
          .catch((error: any) => {
            console.error(
              'Social accounts request failed:',
              error
            );

            return null;
          }),
      ]);

      const clientData =
        clientResponse?.data || {
          id: numericClientId,
          name:
            `Client Account #${numericClientId}`,
          username:
            `client_${numericClientId}`,
          email:
            `client_${numericClientId}@example.com`,
        };

      let campaignsData =
        campaignsResponse?.data || [];

      let postsData =
        postsResponse?.data || [];

      let accountsData =
        accountsResponse?.data || [];

      if (!Array.isArray(campaignsData)) {
        campaignsData =
          campaignsData?.campaigns || [];
      }

      if (!Array.isArray(postsData)) {
        postsData =
          postsData?.posts || [];
      }

      if (!Array.isArray(accountsData)) {
        accountsData =
          accountsData?.accounts || [];
      }

      const finalCampaigns =
        Array.isArray(campaignsData)
          ? campaignsData
          : [];

      const finalPosts =
        Array.isArray(postsData)
          ? postsData
          : [];

      const allAccounts =
        Array.isArray(accountsData)
          ? accountsData
          : [];

      const finalAccounts =
        allAccounts.filter(
          (account: any) => {
            if (
              account.client_id ===
                undefined ||
              account.client_id === null
            ) {
              return true;
            }

            return (
              Number(
                account.client_id
              ) === numericClientId
            );
          }
        );

      console.log(
        'Client data:',
        clientData
      );

      console.log(
        'Campaigns data:',
        finalCampaigns
      );

      console.log(
        'Posts data:',
        finalPosts
      );

      console.log(
        'Social accounts data:',
        finalAccounts
      );

      setClient(clientData);
      setCampaigns(finalCampaigns);
      setPosts(finalPosts);
      setSocialAccounts(
        finalAccounts
      );
    } catch (error: any) {
      console.error(
        'Failed to load client workspace:',
        error
      );

      const status =
        error?.response?.status;

      const detail =
        error?.response?.data?.detail;

      if (status === 401) {
        setDashboardError(
          'Your login session is no longer valid. Please log in again.'
        );
      } else if (status === 403) {
        setDashboardError(
          'You are not authorized to access this client workspace.'
        );
      } else if (detail) {
        setDashboardError(
          typeof detail === 'string'
            ? detail
            : 'The server rejected the workspace request.'
        );
      } else {
        setDashboardError(
          error?.message ||
            'Failed to load client workspace.'
        );
      }
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
    setEditingPost(null);
    setPostContent('');

    setSelectedCampaignId(
      campaigns.length > 0
        ? String(campaigns[0].id)
        : ''
    );

    setSelectedAccountIds([]);
    setScheduleDate('');
    setScheduleTime('');
    setSaveAsDraft(false);
    setUploadedMediaUrl('');
    setLocalPreviewUrl('');
    setMediaType('text');
    setSelectedFile(null);
    setSelectedFileName('');
    setModalError(null);
    setModalSuccess(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsPostModalOpen(true);
  };

  const openEditModal = (
    post: any
  ) => {
    setEditingPostId(
      String(post.id)
    );

    setEditingPost(post);

    setPostContent(
      post.content || ''
    );

    setSelectedCampaignId(
      post.campaign_id
        ? String(post.campaign_id)
        : ''
    );

    setSelectedAccountIds(
      Array.isArray(
        post.social_account_ids
      )
        ? post.social_account_ids.map(
            (id: any) =>
              String(id)
          )
        : Array.isArray(
            post.social_accounts
          )
        ? post.social_accounts.map(
            (account: any) =>
              String(account.id)
          )
        : []
    );

    if (post.scheduled_time) {
      const date =
        new Date(
          post.scheduled_time
        );

      const dateFormatter =
        new Intl.DateTimeFormat(
          'en-CA',
          {
            timeZone:
              'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }
        );

      const parts =
        dateFormatter.formatToParts(
          date
        );

      const year =
        parts.find(
          (p) =>
            p.type === 'year'
        )?.value;

      const month =
        parts.find(
          (p) =>
            p.type === 'month'
        )?.value;

      const day =
        parts.find(
          (p) =>
            p.type === 'day'
        )?.value;

      const timeFormatter =
        new Intl.DateTimeFormat(
          'en-GB',
          {
            timeZone:
              'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }
        );

      const time =
        timeFormatter.format(
          date
        );

      setScheduleDate(
        `${year}-${month}-${day}`
      );

      setScheduleTime(time);
    } else {
      setScheduleDate('');
      setScheduleTime('');
    }

    setSaveAsDraft(
      post.status === 'draft' ||
        post.save_as_draft === true
    );

    const normalizedMediaType =
      post.media_type === 'image'
        ? 'image'
        : post.media_type === 'video'
        ? 'video'
        : 'text';

    setMediaType(
      normalizedMediaType
    );

    const storedMediaUrl =
      post.media_url &&
      !String(
        post.media_url
      ).startsWith('blob:')
        ? makeAbsoluteMediaUrl(
            String(post.media_url)
          )
        : '';

    setUploadedMediaUrl(
      storedMediaUrl
    );

    setLocalPreviewUrl(
      storedMediaUrl
    );

    setSelectedFile(null);
    setSelectedFileName('');
    setModalError(null);
    setModalSuccess(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsPostModalOpen(true);
  };

  const openReassignModal = (
    post: any
  ) => {
    setReassignPost(post);

    setReassignCampaignId('');

    setReassignError(null);

    setIsReassignModalOpen(true);
  };

  const closeReassignModal = () => {
    if (submittingReassign) {
      return;
    }

    setIsReassignModalOpen(false);
    setReassignPost(null);
    setReassignCampaignId('');
    setReassignError(null);
  };

  const handleReassignCampaign =
    async () => {
      if (!reassignPost?.id) {
        setReassignError(
          'The selected post could not be identified.'
        );

        return;
      }

      if (!reassignCampaignId) {
        setReassignError(
          'Please select a campaign.'
        );

        return;
      }

      const campaignId =
        Number(
          reassignCampaignId
        );

      if (
        !campaignId ||
        Number.isNaN(campaignId)
      ) {
        setReassignError(
          'Invalid campaign selected.'
        );

        return;
      }

      setSubmittingReassign(true);
      setReassignError(null);

      try {
        console.log(
          '>>> REASSIGNING POST:',
          reassignPost.id
        );

        console.log(
          '>>> NEW CAMPAIGN ID:',
          campaignId
        );

        const response =
          await postService.update(
            reassignPost.id,
            {
              campaign_id:
                campaignId,
            }
          );

        console.log(
          '>>> REASSIGN RESPONSE:',
          response.data
        );

        const updatedPost =
          response.data;

        setPosts(
          (previous) =>
            previous.map(
              (post) =>
                String(post.id) ===
                String(
                  reassignPost.id
                )
                  ? {
                      ...post,
                      ...(updatedPost ||
                        {}),
                      campaign_id:
                        campaignId,
                    }
                  : post
            )
        );

        setIsReassignModalOpen(
          false
        );

        setReassignPost(null);
        setReassignCampaignId('');

        await fetchWorkspaceData(
          true
        );
      } catch (error: any) {
        console.error(
          '>>> REASSIGN CAMPAIGN FAILED:',
          error
        );

        const status =
          error?.response?.status;

        const detail =
          error?.response
            ?.data?.detail;

        if (status === 401) {
          setReassignError(
            'Your login session is invalid or expired. Please log in again.'
          );
        } else if (status === 403) {
          setReassignError(
            'You are not authorized to reassign this post.'
          );
        } else if (
          Array.isArray(detail)
        ) {
          setReassignError(
            detail
              .map(
                (item: any) =>
                  typeof item ===
                  'string'
                    ? item
                    : item?.msg ||
                      JSON.stringify(
                        item
                      )
              )
              .join(', ')
          );
        } else if (detail) {
          setReassignError(
            typeof detail ===
              'string'
              ? detail
              : JSON.stringify(
                  detail
                )
          );
        } else {
          setReassignError(
            error?.message ||
              'Failed to reconnect the post to the selected campaign.'
          );
        }
      } finally {
        setSubmittingReassign(
          false
        );
      }
    };

  const handleCancelPost =
    async () => {
      if (!editingPostId) {
        setModalError(
          'The selected post could not be identified.'
        );

        return;
      }

      if (
        submittingPost ||
        cancellingPost
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          'Are you sure you want to cancel this post? This action will mark the post as CANCELLED.'
        );

      if (!confirmed) {
        return;
      }

      setCancellingPost(true);
      setModalError(null);
      setModalSuccess(null);

      try {
        console.log(
          '>>> CANCELLING POST:',
          editingPostId
        );

        const response =
          await postService.cancel(
            editingPostId
          );

        console.log(
          '>>> CANCEL POST RESPONSE:',
          response.data
        );

        setModalSuccess(
          'Post cancelled successfully.'
        );

        setPosts(
          (previous) =>
            previous.map(
              (post) =>
                String(post.id) ===
                String(editingPostId)
                  ? {
                      ...post,
                      ...(response.data ||
                        {}),
                      status:
                        response.data?.status ||
                        'CANCELLED',
                    }
                  : post
            )
        );

        setIsPostModalOpen(false);
        setEditingPostId(null);
        setEditingPost(null);

        await fetchWorkspaceData(
          true
        );
      } catch (error: any) {
        console.error(
          '>>> CANCEL POST FAILED:',
          error
        );

        const status =
          error?.response?.status;

        const detail =
          error?.response
            ?.data?.detail;

        let message =
          'Failed to cancel the post.';

        if (status === 401) {
          message =
            'Your login session is invalid or expired. Please log in again.';
        } else if (
          status === 403
        ) {
          message =
            'You are not authorized to cancel this post.';
        } else if (
          Array.isArray(detail)
        ) {
          message =
            detail
              .map(
                (item: any) =>
                  typeof item ===
                  'string'
                    ? item
                    : item?.msg ||
                      JSON.stringify(
                        item
                      )
              )
              .join(', ');
        } else if (detail) {
          message =
            typeof detail ===
            'string'
              ? detail
              : JSON.stringify(
                  detail
                );
        } else if (
          error?.message
        ) {
          message =
            error.message;
        }

        setModalError(
          message
        );
      } finally {
        setCancellingPost(
          false
        );
      }
    };

  const handleMediaTypeChange =
    (
      newType: MediaType
    ) => {
      setMediaType(newType);
      setModalError(null);

      if (newType === 'text') {
        setSelectedAccountIds([]);
        setUploadedMediaUrl('');
        setLocalPreviewUrl('');
        setSelectedFile(null);
        setSelectedFileName('');
        return;
      }

      const allowed =
        getAllowedPlatforms(
          newType
        );

      setSelectedAccountIds(
        (previous) =>
          previous.filter(
            (id) => {
              const account =
                socialAccounts.find(
                  (a) =>
                    String(
                      a.id
                    ) ===
                    String(id)
                );

              if (!account) {
                return false;
              }

              return allowed.includes(
                getPlatformName(
                  account
                )
              );
            }
          )
      );
    };

  const handleFileSelection =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      setModalError(null);

      const isVideo =
        file.type.startsWith(
          'video/'
        );

      const detectedType:
        | 'image'
        | 'video' =
        isVideo
          ? 'video'
          : 'image';

      if (
        detectedType ===
          'image' &&
        !file.type.startsWith(
          'image/'
        )
      ) {
        setModalError(
          'Please select a valid image file.'
        );

        return;
      }

      if (
        detectedType ===
          'video' &&
        !file.type.startsWith(
          'video/'
        )
      ) {
        setModalError(
          'Please select a valid video file.'
        );

        return;
      }

      if (
        file.size >
        50 * 1024 * 1024
      ) {
        setModalError(
          'File size must be 50MB or smaller.'
        );

        return;
      }

      setMediaType(
        detectedType
      );

      const allowedPlatforms =
        getAllowedPlatforms(
          detectedType
        );

      setSelectedAccountIds(
        (previous) =>
          previous.filter(
            (id) => {
              const account =
                socialAccounts.find(
                  (a) =>
                    String(
                      a.id
                    ) ===
                    String(id)
                );

              return (
                !!account &&
                allowedPlatforms.includes(
                  getPlatformName(
                    account
                  )
                )
              );
            }
          )
      );

      if (
        localPreviewUrl &&
        localPreviewUrl.startsWith(
          'blob:'
        )
      ) {
        URL.revokeObjectURL(
          localPreviewUrl
        );
      }

      const preview =
        URL.createObjectURL(
          file
        );

      setLocalPreviewUrl(
        preview
      );

      setSelectedFile(file);
      setSelectedFileName(
        file.name
      );
      setUploadedMediaUrl('');
      setUploadingFile(true);

      try {
        const realUrl =
          await uploadFileToBackend(
            file
          );

        setUploadedMediaUrl(
          realUrl
        );

        setModalError(null);

        console.log(
          '>>> MEDIA STAGED SUCCESSFULLY'
        );

        console.log(
          '>>> REAL MEDIA URL:',
          realUrl
        );
      } catch (error: any) {
        console.error(
          '>>> MEDIA UPLOAD FAILED:',
          error
        );

        setUploadedMediaUrl('');

        setModalError(
          error?.message ||
            'Media upload failed. Please try again.'
        );
      } finally {
        setUploadingFile(
          false
        );
      }
    };

  const removeSelectedMedia =
    () => {
      if (
        localPreviewUrl &&
        localPreviewUrl.startsWith(
          'blob:'
        )
      ) {
        URL.revokeObjectURL(
          localPreviewUrl
        );
      }

      setUploadedMediaUrl('');
      setLocalPreviewUrl('');
      setSelectedFile(null);
      setSelectedFileName('');
      setMediaType('text');
      setSelectedAccountIds([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

  const convertIndiaTimeToUTC =
    (
      date: string,
      time: string
    ) => {
      const [
        year,
        month,
        day,
      ] = date
        .split('-')
        .map(Number);

      const [
        hour,
        minute,
      ] = time
        .split(':')
        .map(Number);

      const utcMillis =
        Date.UTC(
          year,
          month - 1,
          day,
          hour,
          minute
        ) -
        5.5 *
          60 *
          60 *
          1000;

      return new Date(
        utcMillis
      ).toISOString();
    };

  const handleSavePostForm =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (
        !numericClientId ||
        Number.isNaN(
          numericClientId
        )
      ) {
        setModalError(
          'Invalid client ID.'
        );

        return;
      }

      if (
        !postContent.trim()
      ) {
        setModalError(
          'Post content cannot be empty.'
        );

        return;
      }

      if (
        !saveAsDraft &&
        !scheduleDate
      ) {
        setModalError(
          'Please select a schedule date.'
        );

        return;
      }

      if (
        !saveAsDraft &&
        !scheduleTime
      ) {
        setModalError(
          'Please select a schedule time.'
        );

        return;
      }

      if (
        !saveAsDraft &&
        selectedAccountIds.length ===
          0
      ) {
        setModalError(
          'Please select at least one allowed social account.'
        );

        return;
      }

      if (
        mediaType !== 'text' &&
        !uploadedMediaUrl
      ) {
        setModalError(
          'Please wait until the media upload finishes before scheduling the post.'
        );

        return;
      }

      if (
        uploadedMediaUrl.startsWith(
          'blob:'
        )
      ) {
        setModalError(
          'The media was not uploaded correctly. Please remove it and upload the file again.'
        );

        return;
      }

      if (
        mediaType !== 'text' &&
        selectedAccountIds.length >
          0
      ) {
        const invalidAccounts =
          selectedAccountIds.some(
            (id) => {
              const account =
                socialAccounts.find(
                  (a) =>
                    String(
                      a.id
                    ) ===
                    String(id)
                );

              return (
                !account ||
                !isAccountAllowedForMedia(
                  account,
                  mediaType
                )
              );
            }
          );

        if (invalidAccounts) {
          setModalError(
            mediaType ===
              'image'
              ? 'Images can only be published to Instagram, Facebook, and LinkedIn.'
              : 'Videos can only be published to Instagram, Facebook, LinkedIn, and YouTube.'
          );

          return;
        }
      }

      setSubmittingPost(true);
      setModalError(null);
      setModalSuccess(null);

      try {
        let scheduledTimestamp:
          | string
          | null = null;

        if (!saveAsDraft) {
          scheduledTimestamp =
            convertIndiaTimeToUTC(
              scheduleDate,
              scheduleTime
            );
        }

        const postPayload = {
          client_id:
            numericClientId,

          content:
            postContent.trim(),

          media_url:
            uploadedMediaUrl ||
            null,

          media_type:
            uploadedMediaUrl
              ? mediaType
              : 'text',

          scheduled_time:
            scheduledTimestamp,

          timezone:
            'Asia/Kolkata',

          campaign_id:
            selectedCampaignId
              ? Number(
                  selectedCampaignId
                )
              : null,

          social_account_ids:
            selectedAccountIds.map(
              Number
            ),

          save_as_draft:
            saveAsDraft,
        };

        console.log(
          '>>> FINAL POST PAYLOAD:',
          postPayload
        );

        if (
          postPayload.media_url?.startsWith(
            'blob:'
          )
        ) {
          throw new Error(
            'A browser blob URL was detected. The post was stopped because the media must be uploaded to the backend first.'
          );
        }

        let response;

        if (editingPostId) {
          response =
            await postService.update(
              editingPostId,
              postPayload
            );
        } else {
          response =
            await postService.create(
              postPayload
            );
        }

        console.log(
          'Post save response:',
          response.data
        );

        const savedPost =
          response.data;

        if (savedPost) {
          setPosts(
            (previous) => {
              if (
                editingPostId
              ) {
                return previous.map(
                  (post) =>
                    String(
                      post.id
                    ) ===
                    String(
                      editingPostId
                    )
                      ? savedPost
                      : post
                );
              }

              return [
                savedPost,
                ...previous,
              ];
            }
          );
        }

        setIsPostModalOpen(
          false
        );

        await fetchWorkspaceData(
          true
        );
      } catch (error: any) {
        console.error(
          'Failed to save post:',
          error
        );

        const status =
          error?.response?.status;

        const detail =
          error?.response
            ?.data?.detail;

        let message =
          'Failed to save or schedule post.';

        if (status === 401) {
          message =
            'Your login session is invalid or expired. Please log in again.';
        } else if (
          status === 403
        ) {
          message =
            'You are not authorized to create or update posts for this client.';
        } else if (
          Array.isArray(detail)
        ) {
          message =
            detail
              .map(
                (item: any) =>
                  typeof item ===
                  'string'
                    ? item
                    : item?.msg ||
                      JSON.stringify(
                        item
                      )
              )
              .join(', ');
        } else if (detail) {
          message =
            typeof detail ===
            'string'
              ? detail
              : JSON.stringify(
                  detail
                );
        } else if (
          error?.message
        ) {
          message =
            error.message;
        }

        setModalError(
          message
        );
      } finally {
        setSubmittingPost(
          false
        );
      }
    };

  const handleCreateCampaign =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (!campaignName.trim()) {
        return;
      }

      if (!numericClientId) {
        return;
      }

      setSubmittingCampaign(
        true
      );

      try {
        const payload = {
          client_id:
            numericClientId,
          name:
            campaignName.trim(),
          description:
            campaignDescription.trim(),
          status: 'active',
        };

        console.log(
          'Creating campaign:',
          payload
        );

        const response =
          await campaignService.create(
            payload
          );

        const newCampaign =
          response.data;

        if (newCampaign) {
          setCampaigns(
            (previous) => [
              newCampaign,
              ...previous,
            ]
          );
        }

        setIsCampaignModalOpen(
          false
        );

        setCampaignName('');
        setCampaignDescription('');
      } catch (error: any) {
        console.error(
          'Campaign creation failed:',
          error
        );

        const detail =
          error?.response?.data
            ?.detail;

        setDashboardError(
          typeof detail ===
            'string'
            ? detail
            : error?.message ||
                'Campaign creation failed.'
        );
      } finally {
        setSubmittingCampaign(
          false
        );
      }
    };

  const handleDeletePost = (
    post: any
  ) => {
    setDeletePostTarget(post);
  };

  const closeDeletePostModal = () => {
    if (deletingPost) {
      return;
    }

    setDeletePostTarget(null);
  };

  const handleDeleteFromAllPlatforms = async () => {
    if (!deletePostTarget?.id) {
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to delete this post from all connected platforms and locally?'
      )
    ) {
      return;
    }

    setDeletingPost(true);

    try {
      await postService.delete(
        deletePostTarget.id
      );

      setPosts(
        (previous) =>
          previous.filter(
            (post) =>
              String(post.id) !==
              String(deletePostTarget.id)
          )
      );

      setDeletePostTarget(null);
    } catch (error: any) {
      console.error(
        'Failed to delete post from all platforms:',
        error
      );

      const status =
        error?.response?.status;

      if (status === 401) {
        setDashboardError(
          'Your login session is invalid or expired.'
        );
      } else if (status === 403) {
        setDashboardError(
          'You are not authorized to delete this post.'
        );
      } else {
        setDashboardError(
          error?.response?.data?.detail ||
            error?.message ||
            'Failed to delete post from all platforms.'
        );
      }
    } finally {
      setDeletingPost(false);
    }
  };

  const handleDeleteFromSocialAccount = async (
    socialAccountId: string | number
  ) => {
    if (!deletePostTarget?.id) {
      return;
    }

    const account =
      socialAccounts.find(
        (item: any) =>
          String(item.id) ===
          String(socialAccountId)
      );

    const accountName =
      account?.account_name ||
      account?.name ||
      account?.platform_username ||
      `Account ${socialAccountId}`;

    const platform = account
      ? getPlatformName(account)
      : 'Social Account';

    if (
      !window.confirm(
        `Are you sure you want to delete this post from ${platform} - ${accountName}?`
      )
    ) {
      return;
    }

    setDeletingPost(true);

    try {
      await postService.deleteFromSocialAccount(
        deletePostTarget.id,
        socialAccountId
      );

      setPosts(
        (previous) =>
          previous.map(
            (post) => {
              if (
                String(post.id) !==
                String(deletePostTarget.id)
              ) {
                return post;
              }

              const updatedIds =
                Array.isArray(
                  post.social_account_ids
                )
                  ? post.social_account_ids.filter(
                      (id: any) =>
                        String(id) !==
                        String(socialAccountId)
                    )
                  : [];

              const updatedAccounts =
                Array.isArray(
                  post.social_accounts
                )
                  ? post.social_accounts.filter(
                      (item: any) =>
                        String(item.id) !==
                        String(socialAccountId)
                    )
                  : post.social_accounts;

              return {
                ...post,
                social_account_ids: updatedIds,
                social_accounts: updatedAccounts,
              };
            }
          )
      );

      setDeletePostTarget(null);
    } catch (error: any) {
      console.error(
        'Failed to delete post from social account:',
        error
      );

      const status =
        error?.response?.status;

      if (status === 401) {
        setDashboardError(
          'Your login session is invalid or expired.'
        );
      } else if (status === 403) {
        setDashboardError(
          'You are not authorized to delete this post from this social account.'
        );
      } else {
        setDashboardError(
          error?.response?.data?.detail ||
            error?.message ||
            'Failed to delete post from this social account.'
        );
      }
    } finally {
      setDeletingPost(false);
    }
  };

  const sortedPosts =
    [...posts].sort(
      (a, b) => {
        const timeA =
          a.scheduled_time
            ? new Date(
                a.scheduled_time
              ).getTime()
            : 0;

        const timeB =
          b.scheduled_time
            ? new Date(
                b.scheduled_time
              ).getTime()
            : 0;

        return sortOrder ===
          'newest'
          ? timeB - timeA
          : timeA - timeB;
      }
    );

  const displayedAccounts =
    socialAccounts.filter(
      (account) =>
        isAccountAllowedForMedia(
          account,
          mediaType
        )
    );

  const isPostUnassigned = (
    post: any
  ) => {
    return (
      post?.campaign_id ===
        null ||
      post?.campaign_id ===
        undefined ||
      post?.campaign_id ===
        ''
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />

          <p className="text-sm text-gray-500 font-medium">
            Loading workspace profile context...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-start gap-3">
            <Link
              to="/clients"
              className="mt-1 p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Client Workspace
              </h1>

              <p className="text-sm text-gray-500 mt-0.5">
                Manage campaigns, posts,
                scheduling, publishing,
                and analytics.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchWorkspaceData(true)
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={cn(
                'w-4 h-4 text-gray-500',
                refreshing &&
                  'animate-spin'
              )}
            />

            Refresh
          </button>
        </div>

        {dashboardError && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />

            <span>
              {dashboardError}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  <User className="w-6 h-6" />
                </div>

                <div className="space-y-1 flex-1">
                  <h2 className="text-xl font-bold text-gray-900 capitalize">
                    {client?.name ||
                      client?.full_name ||
                      `Client ${numericClientId}`}
                  </h2>

                  <p className="text-sm text-indigo-600 font-semibold">
                    {client?.handle ||
                      client?.username ||
                      ''}
                  </p>

                  {client?.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                      <Mail className="w-3.5 h-3.5" />

                      <span>
                        {client.email}
                      </span>
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
                  icon={
                    <Plus className="w-4 h-4" />
                  }
                  onClick={() =>
                    setIsCampaignModalOpen(
                      true
                    )
                  }
                >
                  Create Campaign
                </Button>
              </div>

              {campaigns.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
                  No campaigns found
                  for this client.
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(
                    (campaign) => (
                      <div
                        key={
                          campaign.id
                        }
                        className="p-4 border border-gray-100 bg-gray-50 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {campaign.name ||
                              campaign.title}
                          </h4>

                          <p className="text-xs text-gray-400 mt-0.5">
                            {campaign.description ||
                              'Campaign tracking group.'}
                          </p>
                        </div>

                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {campaign.status ||
                            'active'}
                        </span>
                      </div>
                    )
                  )}
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
                      setSortOrder(
                        (previous) =>
                          previous ===
                          'newest'
                            ? 'oldest'
                            : 'newest'
                      )
                    }
                    icon={
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    }
                  >
                    Sort:{' '}
                    {sortOrder ===
                    'newest'
                      ? 'Newest'
                      : 'Oldest'}
                  </Button>

                  <Button
                    size="sm"
                    icon={
                      <Plus className="w-4 h-4" />
                    }
                    onClick={
                      openCreateModal
                    }
                  >
                    New Post
                  </Button>
                </div>
              </div>

              {sortedPosts.length ===
              0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                  <FileText className="w-8 h-8 text-gray-300 mb-2" />

                  <p className="text-sm">
                    No scheduled posts
                    found for this
                    client workspace.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sortedPosts.map(
                    (post) => {
                      const matchedCampaign =
                        campaigns.find(
                          (campaign) =>
                            String(
                              campaign.id
                            ) ===
                            String(
                              post.campaign_id
                            )
                        );

                      const normalizedStatus =
                        String(
                          post.status ||
                            'scheduled'
                        ).toLowerCase();

                      const isDraft =
                        normalizedStatus ===
                          'draft' ||
                        post.save_as_draft ===
                          true;

                      const unassigned =
                        isPostUnassigned(
                          post
                        );

                      const safeMediaUrl =
                        post.media_url &&
                        !String(
                          post.media_url
                        ).startsWith(
                          'blob:'
                        )
                          ? makeAbsoluteMediaUrl(
                              String(
                                post.media_url
                              )
                            )
                          : '';

                      return (
                        <div
                          key={post.id}
                          className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  'px-1.5 py-0.5 rounded font-semibold text-[10px] capitalize border inline-flex items-center gap-1',
                                  isDraft
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : normalizedStatus ===
                                      'published'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : normalizedStatus ===
                                      'failed'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : normalizedStatus ===
                                      'cancelled'
                                    ? 'bg-gray-100 text-gray-600 border-gray-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                )}
                              >
                                {!isDraft &&
                                  normalizedStatus ===
                                    'published' && (
                                    <CheckCircle className="w-3 h-3" />
                                  )}

                                {!isDraft &&
                                  normalizedStatus ===
                                    'failed' && (
                                    <AlertCircle className="w-3 h-3" />
                                  )}

                                {!isDraft &&
                                  normalizedStatus ===
                                    'scheduled' && (
                                    <Clock className="w-3 h-3" />
                                  )}

                                {isDraft
                                  ? 'Draft'
                                  : normalizedStatus}
                              </span>

                              {matchedCampaign && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium text-[10px]">
                                  {
                                    matchedCampaign.name
                                  }
                                </span>
                              )}

                              {unassigned && (
                                <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded font-medium text-[10px] border border-orange-200">
                                  No Campaign
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">
                              {post.content}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                              <span className="capitalize px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                                {post.media_type ||
                                  'text'}
                              </span>

                              {post.scheduled_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />

                                  {new Date(
                                    post.scheduled_time
                                  ).toLocaleString(
                                    'en-IN',
                                    {
                                      timeZone:
                                        'Asia/Kolkata',
                                    }
                                  )}
                                </span>
                              )}
                            </div>

                            {unassigned && (
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openReassignModal(
                                      post
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                                >
                                  <Link2 className="w-3.5 h-3.5" />

                                  Reconnect Campaign
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {safeMediaUrl && (
                              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                                {post.media_type ===
                                'video' ? (
                                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                                    <Video className="w-5 h-5" />
                                  </div>
                                ) : (
                                  <img
                                    src={
                                      safeMediaUrl
                                    }
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    post
                                  )
                                }
                                title="Edit Post"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeletePost(
                                    post
                                  )
                                }
                                title="Delete Post"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
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
          {deletePostTarget && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="absolute inset-0 bg-slate-900/60"
                onClick={closeDeletePostModal}
              />

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 16,
                }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">
                    Delete Post
                  </h3>

                  <button
                    type="button"
                    onClick={closeDeletePostModal}
                    disabled={deletingPost}
                    className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Where do you want to delete this post?
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Choose whether to remove the post from all platforms or only one connected account.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteFromAllPlatforms}
                    disabled={deletingPost}
                    className="w-full text-left p-4 border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-red-700">
                          Delete from all platforms
                        </p>

                        <p className="text-xs text-red-600 mt-0.5">
                          Remove the post from every connected platform and delete it locally.
                        </p>
                      </div>
                    </div>
                  </button>

                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Delete from one account
                    </p>

                    {Array.isArray(
                      deletePostTarget.social_account_ids
                    ) &&
                    deletePostTarget.social_account_ids.length >
                      0 ? (
                      <div className="space-y-2">
                        {deletePostTarget.social_account_ids.map(
                          (
                            socialAccountId: string | number
                          ) => {
                            const account =
                              socialAccounts.find(
                                (item: any) =>
                                  String(item.id) ===
                                  String(socialAccountId)
                              );

                            const accountName =
                              account?.account_name ||
                              account?.name ||
                              account?.platform_username ||
                              `Account ${socialAccountId}`;

                            const platform =
                              account
                                ? getPlatformName(account)
                                : 'Social Account';

                            return (
                              <button
                                key={String(
                                  socialAccountId
                                )}
                                type="button"
                                onClick={() =>
                                  handleDeleteFromSocialAccount(
                                    socialAccountId
                                  )
                                }
                                disabled={deletingPost}
                                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left disabled:opacity-50 disabled:pointer-events-none"
                              >
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                                  <Link2 className="w-4 h-4 text-indigo-600" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-800 truncate">
                                    {accountName}
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    {platform}
                                  </p>
                                </div>

                                <Trash2 className="w-4 h-4 text-gray-400" />
                              </button>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <p className="text-xs text-gray-500">
                          No social accounts are associated with this post.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={deletingPost}
                      onClick={closeDeletePostModal}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCampaignModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="absolute inset-0 bg-slate-900/60"
                onClick={() =>
                  !submittingCampaign &&
                  setIsCampaignModalOpen(
                    false
                  )
                }
              />

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 16,
                }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">
                    Create New Campaign
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setIsCampaignModalOpen(
                        false
                      )
                    }
                    disabled={
                      submittingCampaign
                    }
                    className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={
                    handleCreateCampaign
                  }
                  className="p-6 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Campaign Name
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        campaignName
                      }
                      onChange={(e) =>
                        setCampaignName(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Summer Product Launch"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Description
                    </label>

                    <textarea
                      rows={3}
                      value={
                        campaignDescription
                      }
                      onChange={(e) =>
                        setCampaignDescription(
                          e.target.value
                        )
                      }
                      placeholder="Brief objective..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={
                        submittingCampaign
                      }
                      onClick={() =>
                        setIsCampaignModalOpen(
                          false
                        )
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      loading={
                        submittingCampaign
                      }
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
          {isReassignModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="absolute inset-0 bg-slate-900/60"
                onClick={
                  closeReassignModal
                }
              />

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 16,
                }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Reconnect Campaign
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      Assign this existing post to a campaign.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeReassignModal
                    }
                    disabled={
                      submittingReassign
                    }
                    className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {reassignError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

                      <span>
                        {reassignError}
                      </span>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Existing Post
                    </p>

                    <p className="text-sm font-semibold text-gray-900 line-clamp-3">
                      {reassignPost?.content ||
                        'Post content'}
                    </p>

                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        No Campaign Assigned
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Select Campaign
                    </label>

                    {campaigns.length ===
                    0 ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500">
                        No active campaigns are available for this client.
                      </div>
                    ) : (
                      <select
                        value={
                          reassignCampaignId
                        }
                        onChange={(e) =>
                          setReassignCampaignId(
                            e.target.value
                          )
                        }
                        disabled={
                          submittingReassign
                        }
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="">
                          Select a campaign
                        </option>

                        {campaigns.map(
                          (
                            campaign
                          ) => (
                            <option
                              key={
                                campaign.id
                              }
                              value={
                                campaign.id
                              }
                            >
                              {campaign.name ||
                                campaign.title ||
                                `Campaign ${campaign.id}`}
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="text-xs text-indigo-700">
                      This will update the existing post's campaign assignment. The post itself will not be deleted or recreated.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={
                        submittingReassign
                      }
                      onClick={
                        closeReassignModal
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      loading={
                        submittingReassign
                      }
                      disabled={
                        !reassignCampaignId ||
                        campaigns.length ===
                          0
                      }
                      icon={
                        !submittingReassign ? (
                          <Link2 className="w-4 h-4" />
                        ) : undefined
                      }
                      onClick={
                        handleReassignCampaign
                      }
                    >
                      Reconnect Campaign
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isPostModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="absolute inset-0 bg-slate-900/60"
                onClick={() =>
                  !submittingPost &&
                  !cancellingPost &&
                  setIsPostModalOpen(
                    false
                  )
                }
              />

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 16,
                }}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden z-10"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">
                    {editingPostId
                      ? 'Edit Post'
                      : 'New Post'}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setIsPostModalOpen(
                        false
                      )
                    }
                    disabled={
                      submittingPost ||
                      cancellingPost
                    }
                    className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={
                    handleSavePostForm
                  }
                  className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
                >
                  {modalError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

                      <span>
                        {modalError}
                      </span>
                    </div>
                  )}

                  {modalSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2 text-xs text-green-700">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />

                      <span>
                        {modalSuccess}
                      </span>
                    </div>
                  )}

                  {editingPost &&
                    isPostUnassigned(
                      editingPost
                    ) && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                            <Link2 className="w-4 h-4 text-orange-700" />
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-900">
                              This post has no campaign assigned.
                            </p>

                            <p className="text-xs text-orange-700 mt-1">
                              Reconnect this existing post to one of the client's campaigns.
                            </p>

                            <button
                              type="button"
                              disabled={
                                submittingPost ||
                                cancellingPost
                              }
                              onClick={() =>
                                openReassignModal(
                                  editingPost
                                )
                              }
                              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              Reconnect Campaign
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Post Content
                    </label>

                    <textarea
                      rows={4}
                      value={
                        postContent
                      }
                      onChange={(e) =>
                        setPostContent(
                          e.target.value
                        )
                      }
                      placeholder="What do you want to share?"
                      disabled={
                        cancellingPost
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Media Type
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          'text',
                          'image',
                          'video',
                        ] as MediaType[]
                      ).map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            disabled={
                              submittingPost ||
                              uploadingFile ||
                              cancellingPost
                            }
                            onClick={() =>
                              handleMediaTypeChange(
                                type
                              )
                            }
                            className={cn(
                              'px-3 py-2 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer',
                              mediaType ===
                                type
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            )}
                          >
                            {type}
                          </button>
                        )
                      )}
                    </div>

                    {mediaType ===
                      'image' && (
                      <p className="text-[11px] text-gray-400 mt-2">
                        Images can be published to Instagram, Facebook, and LinkedIn.
                      </p>
                    )}

                    {mediaType ===
                      'video' && (
                      <p className="text-[11px] text-gray-400 mt-2">
                        Videos can be published to Instagram, Facebook, LinkedIn, and YouTube.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Select Social Accounts
                    </label>

                    {displayedAccounts.length ===
                    0 ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-400">
                        {mediaType ===
                        'image'
                          ? 'No Instagram, Facebook, or LinkedIn accounts are connected.'
                          : mediaType ===
                            'video'
                          ? 'No Instagram, Facebook, LinkedIn, or YouTube accounts are connected.'
                          : 'No social accounts linked to this client.'}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
                        {displayedAccounts.map(
                          (
                            account
                          ) => {
                            const accountId =
                              String(
                                account.id
                              );

                            const platform =
                              getPlatformName(
                                account
                              );

                            const checked =
                              selectedAccountIds.includes(
                                accountId
                              );

                            return (
                              <label
                                key={
                                  account.id
                                }
                                className="flex items-center gap-2.5 p-2 hover:bg-white rounded-lg cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    checked
                                  }
                                  disabled={
                                    submittingPost ||
                                    uploadingFile ||
                                    cancellingPost
                                  }
                                  onChange={(
                                    e
                                  ) => {
                                    if (
                                      e
                                        .target
                                        .checked
                                    ) {
                                      setSelectedAccountIds(
                                        (
                                          previous
                                        ) =>
                                          previous.includes(
                                            accountId
                                          )
                                            ? previous
                                            : [
                                                ...previous,
                                                accountId,
                                              ]
                                      );
                                    } else {
                                      setSelectedAccountIds(
                                        (
                                          previous
                                        ) =>
                                          previous.filter(
                                            (
                                              id
                                            ) =>
                                              id !==
                                              accountId
                                          )
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                                />

                                <span className="text-xs font-medium text-gray-800">
                                  {account.account_name ||
                                    account.name ||
                                    account.platform_username ||
                                    `Account ${account.id}`}
                                </span>

                                <span className="ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                                  {platform}
                                </span>
                              </label>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>

                  {mediaType !==
                    'text' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                        Attached Media
                      </label>

                      <input
                        type="file"
                        ref={
                          fileInputRef
                        }
                        accept={
                          mediaType ===
                          'image'
                            ? 'image/*'
                            : 'video/*'
                        }
                        className="hidden"
                        onChange={
                          handleFileSelection
                        }
                      />

                      {localPreviewUrl ? (
                        <div className="relative border border-gray-200 bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-16 h-16 bg-gray-200 border border-gray-300 rounded-lg overflow-hidden shrink-0">
                              {mediaType ===
                              'video' ? (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                                  <Video className="w-5 h-5" />
                                </div>
                              ) : (
                                <img
                                  src={
                                    localPreviewUrl
                                  }
                                  alt="Selected media"
                                  className="w-full h-full object-cover"
                                />
                              )}

                              {uploadingFile && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">
                                {selectedFileName ||
                                  'Uploaded media'}
                              </p>

                              <p className="text-[11px] font-medium mt-0.5">
                                {uploadingFile ? (
                                  <span className="text-indigo-600">
                                    Uploading to server...
                                  </span>
                                ) : uploadedMediaUrl ? (
                                  <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Uploaded & Ready
                                  </span>
                                ) : (
                                  <span className="text-red-500">
                                    Upload failed
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={
                              removeSelectedMedia
                            }
                            disabled={
                              submittingPost ||
                              cancellingPost
                            }
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            uploadingFile ||
                            submittingPost ||
                            cancellingPost
                          }
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all text-gray-400 hover:text-indigo-600 cursor-pointer"
                        >
                          <Upload className="w-6 h-6 mb-1.5" />

                          <span className="text-xs font-semibold">
                            Upload Media
                          </span>

                          <span className="text-[10px] text-gray-400 mt-0.5">
                            JPEG, PNG, MP4 up to 50MB
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                        Schedule Date
                      </label>

                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                        <input
                          type="date"
                          disabled={
                            saveAsDraft ||
                            submittingPost ||
                            cancellingPost
                          }
                          value={
                            scheduleDate
                          }
                          onChange={(e) =>
                            setScheduleDate(
                              e.target.value
                            )
                          }
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                        Schedule Time
                      </label>

                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                        <input
                          type="time"
                          disabled={
                            saveAsDraft ||
                            submittingPost ||
                            cancellingPost
                          }
                          value={
                            scheduleTime
                          }
                          onChange={(e) =>
                            setScheduleTime(
                              e.target.value
                            )
                          }
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Link to Campaign
                    </label>

                    <select
                      value={
                        selectedCampaignId
                      }
                      onChange={(e) =>
                        setSelectedCampaignId(
                          e.target.value
                        )
                      }
                      disabled={
                        submittingPost ||
                        cancellingPost
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm"
                    >
                      <option value="">
                        None
                      </option>

                      {campaigns.map(
                        (campaign) => (
                          <option
                            key={
                              campaign.id
                            }
                            value={
                              campaign.id
                            }
                          >
                            {campaign.name ||
                              campaign.title}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 select-none cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={
                        saveAsDraft
                      }
                      disabled={
                        submittingPost ||
                        cancellingPost
                      }
                      onChange={(e) =>
                        setSaveAsDraft(
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    />

                    <span className="text-xs text-gray-600 font-medium">
                      Save this post as a draft
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <div>
                      {editingPostId && (
                        <Button
                          type="button"
                          variant="danger"
                          loading={
                            cancellingPost
                          }
                          disabled={
                            submittingPost ||
                            cancellingPost
                          }
                          icon={
                            !cancellingPost ? (
                              <X className="w-4 h-4" />
                            ) : undefined
                          }
                          onClick={
                            handleCancelPost
                          }
                        >
                          Cancel Post
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={
                          submittingPost ||
                          cancellingPost
                        }
                        onClick={() =>
                          setIsPostModalOpen(
                            false
                          )
                        }
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        loading={
                          submittingPost
                        }
                        disabled={
                          uploadingFile ||
                          cancellingPost ||
                          (mediaType !==
                            'text' &&
                            !uploadedMediaUrl)
                        }
                      >
                        {editingPostId
                          ? 'Update Post'
                          : 'Schedule Post'}
                      </Button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ClientWorkspacePage;