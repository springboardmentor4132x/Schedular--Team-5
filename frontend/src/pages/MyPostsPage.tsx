import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Share2,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  ArrowUpDown,
  X,
  Link2,
  Ban,
  Loader2,
  Send,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

import {
  postService,
  accountService,
  campaignService,
  contentWorkflowService,
} from '../services/api';

type Status =
  | 'draft'
  | 'pending_approval'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'cancelled';

type Tab = 'all' | Status;

type SortOrder = 'newest' | 'oldest';

type Campaign = {
  id: number | string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  client_id?: number | null;
  [key: string]: any;
};

/* =====================================================
   ROLE HELPERS
===================================================== */

type UserRole =
  | 'administrator'
  | 'marketing_team'
  | 'business_user'
  | 'content_creator'
  | '';

function normalizeRole(role: any): UserRole {
  const normalized = String(role || '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');

  if (
    normalized === 'administrator' ||
    normalized === 'admin'
  ) {
    return 'administrator';
  }

  if (
    normalized === 'marketing_team' ||
    normalized === 'marketingteam' ||
    normalized === 'marketing'
  ) {
    return 'marketing_team';
  }

  if (
    normalized === 'business_user' ||
    normalized === 'businessuser' ||
    normalized === 'business'
  ) {
    return 'business_user';
  }

  if (
    normalized === 'content_creator' ||
    normalized === 'contentcreator' ||
    normalized === 'creator'
  ) {
    return 'content_creator';
  }

  return '';
}

function getLoggedInUserRole(): UserRole {
  /*
   * The application stores the logged-in user's role
   * directly in localStorage as "user_role".
   */
  const storedRole =
    localStorage.getItem('user_role');

  const normalizedRole =
    normalizeRole(storedRole);

  if (normalizedRole) {
    return normalizedRole;
  }

  /*
   * Fallback: check common user-storage patterns.
   */
  const possibleUserKeys = [
    'user',
    'currentUser',
    'authUser',
    'loggedInUser',
    'profile',
  ];

  for (const key of possibleUserKeys) {
    try {
      const raw =
        localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed =
        JSON.parse(raw);

      const role =
        parsed?.role ||
        parsed?.user?.role ||
        parsed?.data?.role ||
        parsed?.data?.user?.role;

      const normalized =
        normalizeRole(role);

      if (normalized) {
        return normalized;
      }
    } catch {
      /*
       * Ignore invalid JSON and continue.
       */
    }
  }

  /*
   * Fallback: inspect the JWT stored by the application.
   */
  const token =
    localStorage.getItem('auth_token');

  if (token) {
    try {
      const parts =
        token.split('.');

      if (parts.length === 3) {
        const payload =
          JSON.parse(
            atob(
              parts[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/')
            )
          );

        const role =
          payload?.role ||
          payload?.user_role ||
          payload?.user?.role;

        const normalized =
          normalizeRole(role);

        if (normalized) {
          return normalized;
        }
      }
    } catch {
      /*
       * Ignore malformed JWT payloads.
       */
    }
  }

  return '';
}

/* =====================================================
   WORKFLOW PERMISSION HELPERS
===================================================== */

function canSubmitForApproval(
  role: UserRole,
  post: any
): boolean {
  const status = normalizeStatus(post?.status);

  if (status !== 'draft') {
    return false;
  }

  return (
    role === 'administrator' ||
    role === 'content_creator'
  );
}

function canApproveOrReject(
  role: UserRole,
  post: any
): boolean {
  const status = normalizeStatus(post?.status);

  if (status !== 'pending_approval') {
    return false;
  }

  return (
    role === 'administrator' ||
    role === 'marketing_team'
  );
}

export function MyPostsPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [cancellingId, setCancellingId] =
    useState<number | null>(null);

  const [assigningCampaignId, setAssigningCampaignId] =
    useState<number | null>(null);

  const [workflowLoadingId, setWorkflowLoadingId] =
    useState<number | null>(null);

  const [viewingPost, setViewingPost] =
    useState<any | null>(null);

  const [campaignPost, setCampaignPost] =
    useState<any | null>(null);

  const [rejectingPost, setRejectingPost] =
    useState<any | null>(null);

  const [rejectReason, setRejectReason] =
    useState('');

  const [selectedCampaignId, setSelectedCampaignId] =
    useState<string>('');

  const [activeTab, setActiveTab] =
    useState<Tab>('all');

  const [searchTerm, setSearchTerm] =
    useState('');

  const [platformFilter, setPlatformFilter] =
    useState('all');

  const [sortOrder, setSortOrder] =
    useState<SortOrder>('newest');

  const [userRole, setUserRole] =
    useState<UserRole>('');

  /* =====================================================
     LOAD USER ROLE
  ===================================================== */

  useEffect(() => {
  const role = getLoggedInUserRole();

  console.log('=== NOTIFICATION WORKFLOW ROLE DEBUG ===');
  console.log('Detected user role:', role);
  console.log('Expected Content Creator role: content_creator');
  console.log('=========================================');

  setUserRole(role);
}, []);
  /* =====================================================
     LOAD POSTS + SOCIAL ACCOUNTS
  ===================================================== */

  const loadPostsAndAccounts = async () => {
    try {
      const [
        postsResult,
        accountsResult,
      ] = await Promise.allSettled([
        postService.getAll(),
        accountService.getAll(),
      ]);

      if (postsResult.status === 'fulfilled') {
        const postData =
          postsResult.value?.data;

        if (Array.isArray(postData)) {
          setPosts(postData);
        } else if (
          Array.isArray(postData?.items)
        ) {
          setPosts(postData.items);
        } else if (
          Array.isArray(postData?.posts)
        ) {
          setPosts(postData.posts);
        } else {
          setPosts([]);
        }
      } else {
        console.error(
          'Unable to load posts:',
          postsResult.reason
        );
      }

      if (accountsResult.status === 'fulfilled') {
        const accountData =
          accountsResult.value?.data;

        if (Array.isArray(accountData)) {
          setAccounts(accountData);
        } else if (
          Array.isArray(accountData?.items)
        ) {
          setAccounts(accountData.items);
        } else if (
          Array.isArray(accountData?.accounts)
        ) {
          setAccounts(accountData.accounts);
        } else {
          setAccounts([]);
        }
      } else {
        console.error(
          'Unable to load social accounts:',
          accountsResult.reason
        );
      }
    } catch (error) {
      console.error(
        'Unable to load My Posts:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD CAMPAIGNS
  ===================================================== */

  const loadCampaigns = async () => {
    try {
      setLoadingCampaigns(true);

      const response =
        await campaignService.getAll();

      const data = response?.data;

      if (Array.isArray(data)) {
        setCampaigns(data);
      } else if (
        Array.isArray(data?.items)
      ) {
        setCampaigns(data.items);
      } else if (
        Array.isArray(data?.campaigns)
      ) {
        setCampaigns(data.campaigns);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error(
        'Unable to load campaigns:',
        error
      );

      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  /* =====================================================
     LOAD ALL PAGE DATA
  ===================================================== */

  const loadData = async () => {
    await Promise.all([
      loadPostsAndAccounts(),
      loadCampaigns(),
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =====================================================
     AUTO REFRESH
  ===================================================== */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        loadData();
      }, 30000);

    const handleFocus = () => {
      loadData();
    };

    window.addEventListener(
      'focus',
      handleFocus
    );

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(
        'focus',
        handleFocus
      );
    };
  }, []);

  /* =====================================================
     STATUS COUNTS
  ===================================================== */

  const counts = useMemo(() => {
    const base: Record<Status, number> = {
      draft: 0,
      pending_approval: 0,
      scheduled: 0,
      publishing: 0,
      published: 0,
      failed: 0,
      cancelled: 0,
    };

    posts.forEach((post) => {
      const status =
        normalizeStatus(
          post.status
        ) as Status;

        console.log('=== POST WORKFLOW DEBUG ===');
        console.log('Post ID:', post?.id);
        console.log('Post status:', post?.status);
        console.log('Normalized status:', status);
        console.log('User role:', userRole);
        console.log(
           'Can submit:',
            canSubmitForApproval(userRole, post)
      );
        console.log('===========================');

      if (status in base) {
        base[status] += 1;
      }
    });

    return base;
  }, [posts]);

  /* =====================================================
     AVAILABLE PLATFORMS
  ===================================================== */

  const availablePlatforms = useMemo(() => {
    const platformSet =
      new Set<string>();

    posts.forEach((post) => {
      getPostPlatforms(
        post,
        accounts
      ).forEach((platform) => {
        platformSet.add(platform);
      });
    });

    return Array.from(
      platformSet
    ).sort();
  }, [posts, accounts]);

  /* =====================================================
     FILTER + SORT POSTS
  ===================================================== */

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (activeTab === 'all') {
          return true;
        }

        return (
          normalizeStatus(
            post.status
          ) === activeTab
        );
      })
      .filter((post) => {
        if (
          platformFilter === 'all'
        ) {
          return true;
        }

        return getPostPlatforms(
          post,
          accounts
        ).includes(
          platformFilter
        );
      })
      .filter((post) => {
        const search =
          searchTerm
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        const content =
          String(
            post.content || ''
          ).toLowerCase();

        const campaign =
          String(
            post.campaign?.name ||
              post.campaign?.title ||
              post.campaign_name ||
              ''
          ).toLowerCase();

        const platformText =
          getPostPlatforms(
            post,
            accounts
          )
            .join(' ')
            .toLowerCase();

        return (
          content.includes(
            search
          ) ||
          campaign.includes(
            search
          ) ||
          platformText.includes(
            search
          )
        );
      })
      .sort((a, b) =>
        sortOrder === 'newest'
          ? getPostSortDate(b) -
            getPostSortDate(a)
          : getPostSortDate(a) -
            getPostSortDate(b)
      );
  }, [
    posts,
    accounts,
    activeTab,
    platformFilter,
    searchTerm,
    sortOrder,
  ]);

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = (
    postId: number | string
  ) => {
    navigate(
      `/app/create-post?edit=${postId}`
    );
  };

  /* =====================================================
     SUBMIT FOR APPROVAL
  ===================================================== */

  const handleSubmitForApproval = async (
    post: any
  ) => {
    const postId = Number(
      post?.id
    );

    if (!Number.isFinite(postId)) {
      window.alert(
        'Invalid post ID. This post cannot be submitted for approval.'
      );
      return;
    }

    if (
      !canSubmitForApproval(
        userRole,
        post
      )
    ) {
      window.alert(
        'You do not have permission to submit this post for approval.'
      );
      return;
    }

    const confirmed =
      window.confirm(
        'Submit this draft for approval?'
      );

    if (!confirmed) {
      return;
    }

    setWorkflowLoadingId(
      postId
    );

    try {
      const response =
        await contentWorkflowService.submitForReview(
          postId
        );

      const updatedPost =
        response?.data || null;

      setPosts((previous) =>
        previous.map((item) =>
          Number(item.id) ===
          postId
            ? {
                ...item,
                ...(updatedPost || {}),
                status:
                  updatedPost?.status ||
                  'pending_approval',
              }
            : item
        )
      );

      setViewingPost(
        (previous) =>
          previous &&
          Number(previous.id) ===
            postId
            ? {
                ...previous,
                ...(updatedPost || {}),
                status:
                  updatedPost?.status ||
                  'pending_approval',
              }
            : previous
      );

      await loadPostsAndAccounts();

      window.alert(
        'Post submitted for approval successfully.'
      );
    } catch (error: any) {
      console.error(
        'Unable to submit post for approval:',
        error
      );

      const detail =
        error?.response?.data
          ?.detail;

      window.alert(
        Array.isArray(detail)
          ? detail
              .map(
                (item: any) =>
                  item?.msg ||
                  'Submission failed.'
              )
              .join(', ')
          : detail ||
              'Could not submit the post for approval. Please try again.'
      );
    } finally {
      setWorkflowLoadingId(
        null
      );
    }
  };

  /* =====================================================
     APPROVE POST
  ===================================================== */

  const handleApprove = async (
    post: any
  ) => {
    const postId = Number(
      post?.id
    );

    if (!Number.isFinite(postId)) {
      window.alert(
        'Invalid post ID. This post cannot be approved.'
      );
      return;
    }

    if (
      !canApproveOrReject(
        userRole,
        post
      )
    ) {
      window.alert(
        'You do not have permission to approve this post.'
      );
      return;
    }

    const confirmed =
      window.confirm(
        'Approve this post? The post will move to Scheduled status.'
      );

    if (!confirmed) {
      return;
    }

    setWorkflowLoadingId(
      postId
    );

    try {
      const response =
        await contentWorkflowService.approve(
          postId
        );

      const updatedPost =
        response?.data || null;

      setPosts((previous) =>
        previous.map((item) =>
          Number(item.id) ===
          postId
            ? {
                ...item,
                ...(updatedPost || {}),
                status:
                  updatedPost?.status ||
                  'scheduled',
              }
            : item
        )
      );

      setViewingPost(
        (previous) =>
          previous &&
          Number(previous.id) ===
            postId
            ? {
                ...previous,
                ...(updatedPost || {}),
                status:
                  updatedPost?.status ||
                  'scheduled',
              }
            : previous
      );

      await loadPostsAndAccounts();

      window.alert(
        'Post approved successfully.'
      );
    } catch (error: any) {
      console.error(
        'Unable to approve post:',
        error
      );

      const detail =
        error?.response?.data
          ?.detail;

      window.alert(
        Array.isArray(detail)
          ? detail
              .map(
                (item: any) =>
                  item?.msg ||
                  'Approval failed.'
              )
              .join(', ')
          : detail ||
              'Could not approve the post. Please try again.'
      );
    } finally {
      setWorkflowLoadingId(
        null
      );
    }
  };

  /* =====================================================
     OPEN REJECTION MODAL
  ===================================================== */

  const openRejectModal = (
    post: any
  ) => {
    if (
      !canApproveOrReject(
        userRole,
        post
      )
    ) {
      window.alert(
        'You do not have permission to reject this post.'
      );
      return;
    }

    setRejectingPost(post);
    setRejectReason('');
  };

  /* =====================================================
     CLOSE REJECTION MODAL
  ===================================================== */

  const closeRejectModal = () => {
    if (
      workflowLoadingId !== null
    ) {
      return;
    }

    setRejectingPost(null);
    setRejectReason('');
  };

  /* =====================================================
     REJECT POST
  ===================================================== */

  const handleReject = async () => {
    if (!rejectingPost) {
      return;
    }

    const postId = Number(
      rejectingPost.id
    );

    if (!Number.isFinite(postId)) {
      window.alert(
        'Invalid post ID. This post cannot be rejected.'
      );
      return;
    }

    if (
      !canApproveOrReject(
        userRole,
        rejectingPost
      )
    ) {
      window.alert(
        'You do not have permission to reject this post.'
      );
      return;
    }

    const reason =
      rejectReason.trim();

    if (!reason) {
      window.alert(
        'Please enter a rejection reason.'
      );
      return;
    }

    setWorkflowLoadingId(
      postId
    );

    try {
      const response =
        await contentWorkflowService.reject(
          postId,
          reason
        );

      const updatedPost =
        response?.data || null;

      setPosts((previous) =>
        previous.map((item) =>
          Number(item.id) ===
          postId
            ? {
                ...item,
                ...(updatedPost || {}),
                status:
                  updatedPost?.status ||
                  'draft',
                rejection_reason:
                  updatedPost?.rejection_reason ||
                  reason,
              }
            : item
        )
      );

      setViewingPost(
        (previous) =>
          previous &&
          Number(previous.id) ===
            postId
            ? {
                ...previous,
                ...(updatedPost || {}),
                status:
                  updatedPost?.status ||
                  'draft',
                rejection_reason:
                  updatedPost?.rejection_reason ||
                  reason,
              }
            : previous
      );

      await loadPostsAndAccounts();

      setRejectingPost(null);
      setRejectReason('');

      window.alert(
        'Post rejected successfully. It has been returned to Draft status.'
      );
    } catch (error: any) {
      console.error(
        'Unable to reject post:',
        error
      );

      const detail =
        error?.response?.data
          ?.detail;

      window.alert(
        Array.isArray(detail)
          ? detail
              .map(
                (item: any) =>
                  item?.msg ||
                  'Rejection failed.'
              )
              .join(', ')
          : detail ||
              'Could not reject the post. Please try again.'
      );
    } finally {
      setWorkflowLoadingId(
        null
      );
    }
  };

  /* =====================================================
     CAMPAIGN HELPERS
  ===================================================== */

  const getPostCampaignId = (
    post: any
  ): string | null => {
    const campaignId =
      post?.campaign_id ??
      post?.campaignId ??
      post?.campaign?.id ??
      null;

    if (
      campaignId === null ||
      campaignId === undefined ||
      campaignId === ''
    ) {
      return null;
    }

    return String(campaignId);
  };

  const getCampaignName = (
    campaignId: string | null,
    post?: any
  ): string | null => {
    if (!campaignId) {
      if (
        post?.campaign?.name ||
        post?.campaign?.title
      ) {
        return (
          post.campaign.name ||
          post.campaign.title
        );
      }

      if (post?.campaign_name) {
        return post.campaign_name;
      }

      return null;
    }

    const campaign =
      campaigns.find(
        (item) =>
          String(item.id) ===
          String(campaignId)
      );

    if (campaign) {
      return (
        campaign.name ||
        campaign.title ||
        `Campaign #${campaign.id}`
      );
    }

    if (
      post?.campaign?.name ||
      post?.campaign?.title
    ) {
      return (
        post.campaign.name ||
        post.campaign.title
      );
    }

    if (post?.campaign_name) {
      return post.campaign_name;
    }

    return `Campaign #${campaignId}`;
  };

  const openCampaignModal = (
    post: any
  ) => {
    const currentCampaignId =
      getPostCampaignId(post);

    setCampaignPost(post);

    setSelectedCampaignId(
      currentCampaignId || ''
    );
  };

  const closeCampaignModal = () => {
    if (
      assigningCampaignId !== null
    ) {
      return;
    }

    setCampaignPost(null);
    setSelectedCampaignId('');
  };

  /* =====================================================
     CAMPAIGN ASSIGNMENT
  ===================================================== */

  const handleCampaignAssignment =
    async () => {
      if (!campaignPost) {
        return;
      }

      const postId = Number(
        campaignPost.id
      );

      if (!Number.isFinite(postId)) {
        window.alert(
          'Invalid post ID. The campaign cannot be changed.'
        );
        return;
      }

      const oldCampaignId =
        getPostCampaignId(
          campaignPost
        );

      const newCampaignId =
        selectedCampaignId.trim() ||
        null;

      if (
        oldCampaignId ===
        newCampaignId
      ) {
        closeCampaignModal();
        return;
      }

      setAssigningCampaignId(
        postId
      );

      try {
        if (newCampaignId) {
          await campaignService.assignPostToCampaign(
            Number(newCampaignId),
            postId
          );
        }

        if (oldCampaignId) {
          await campaignService.removePostFromCampaign(
            Number(oldCampaignId),
            postId
          );
        }

        await loadPostsAndAccounts();

        const selectedCampaign =
          newCampaignId
            ? campaigns.find(
                (campaign) =>
                  String(
                    campaign.id
                  ) ===
                  String(
                    newCampaignId
                  )
              )
            : null;

        const updatedPost = {
          ...campaignPost,
          campaign_id:
            newCampaignId
              ? Number(
                  newCampaignId
                )
              : null,
          campaign:
            selectedCampaign ||
            null,
          campaign_name:
            selectedCampaign?.name ||
            selectedCampaign?.title ||
            null,
        };

        setPosts((previous) =>
          previous.map((post) =>
            Number(post.id) ===
            postId
              ? {
                  ...post,
                  ...updatedPost,
                }
              : post
          )
        );

        setViewingPost(
          (previous) =>
            previous &&
            Number(previous.id) ===
              postId
              ? {
                  ...previous,
                  ...updatedPost,
                }
              : previous
        );

        setCampaignPost(null);
        setSelectedCampaignId('');

        window.alert(
          newCampaignId
            ? 'Post successfully connected to the selected campaign.'
            : 'Post successfully disconnected from the campaign.'
        );
      } catch (error: any) {
        console.error(
          'Unable to update post campaign:',
          error
        );

        const detail =
          error?.response?.data
            ?.detail;

        window.alert(
          Array.isArray(detail)
            ? detail
                .map(
                  (item: any) =>
                    item?.msg ||
                    'Campaign assignment failed.'
                )
                .join(', ')
            : detail ||
                'Could not update the campaign assignment. Please try again.'
        );
      } finally {
        setAssigningCampaignId(
          null
        );
      }
    };

  /* =====================================================
     CANCEL POST
  ===================================================== */

  const handleCancel = async (
    post: any
  ) => {
    const status =
      normalizeStatus(
        post.status
      );

    if (
      status === 'cancelled' ||
      status === 'published'
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Cancel this post? The post will remain in My Posts with Cancelled status.'
      );

    if (!confirmed) {
      return;
    }

    const postId = Number(
      post.id
    );

    if (!Number.isFinite(postId)) {
      window.alert(
        'Invalid post ID. This post cannot be cancelled.'
      );
      return;
    }

    setCancellingId(
      postId
    );

    try {
      const response =
        await postService.cancel(
          postId
        );

      const updatedPost =
        response?.data || null;

      setPosts((previous) =>
        previous.map((item) => {
          if (
            Number(item.id) !==
            postId
          ) {
            return item;
          }

          return {
            ...item,
            ...(updatedPost || {}),
            status:
              updatedPost?.status ||
              'cancelled',
          };
        })
      );

      setViewingPost(
        (previous) => {
          if (
            !previous ||
            Number(previous.id) !==
              postId
          ) {
            return previous;
          }

          return {
            ...previous,
            ...(updatedPost || {}),
            status:
              updatedPost?.status ||
              'cancelled',
          };
        }
      );

      await loadPostsAndAccounts();
    } catch (error: any) {
      console.error(
        'Unable to cancel post:',
        error
      );

      const detail =
        error?.response?.data
          ?.detail;

      window.alert(
        Array.isArray(detail)
          ? detail
              .map(
                (item: any) =>
                  item?.msg ||
                  'Cancellation failed.'
              )
              .join(', ')
          : detail ||
              'Could not cancel this post. Please try again.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  /* =====================================================
     DELETE POST
  ===================================================== */

  const handleDelete = async (
    postId: number
  ) => {
    const confirmed =
      window.confirm(
        'Delete this post? This cannot be undone.'
      );

    if (!confirmed) {
      return;
    }

    if (!Number.isFinite(postId)) {
      window.alert(
        'Invalid post ID. This post cannot be deleted.'
      );
      return;
    }

    setDeletingId(postId);

    try {
      await postService.delete(
        postId
      );

      setPosts((previous) =>
        previous.filter(
          (post) =>
            Number(post.id) !==
            postId
        )
      );

      if (
        viewingPost &&
        Number(viewingPost.id) ===
          postId
      ) {
        setViewingPost(null);
      }
    } catch (error: any) {
      console.error(
        'Unable to delete post:',
        error
      );

      const detail =
        error?.response?.data
          ?.detail;

      window.alert(
        Array.isArray(detail)
          ? detail
              .map(
                (item: any) =>
                  item?.msg ||
                  'Delete failed.'
              )
              .join(', ')
          : detail ||
              'Could not delete this post. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading your posts...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Posts
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Track, edit, and manage everything
            you've created.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate('/app/create-post')
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* =================================================
          ROLE INDICATOR
      ================================================= */}

      {userRole && (
        <div className="text-xs text-gray-400">
          Role:{' '}
          <span className="font-medium text-gray-600">
            {formatRole(userRole)}
          </span>
        </div>
      )}

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3">
        <MiniStatCard
          label="Total"
          value={posts.length}
          icon={LayoutGrid}
          active={
            activeTab === 'all'
          }
          onClick={() =>
            setActiveTab('all')
          }
        />

        <MiniStatCard
          label="Drafts"
          value={counts.draft}
          icon={FileText}
          active={
            activeTab === 'draft'
          }
          onClick={() =>
            setActiveTab('draft')
          }
        />

        <MiniStatCard
          label="Pending"
          value={
            counts.pending_approval
          }
          icon={Clock}
          active={
            activeTab ===
            'pending_approval'
          }
          onClick={() =>
            setActiveTab(
              'pending_approval'
            )
          }
        />

        <MiniStatCard
          label="Scheduled"
          value={counts.scheduled}
          icon={Calendar}
          active={
            activeTab ===
            'scheduled'
          }
          onClick={() =>
            setActiveTab(
              'scheduled'
            )
          }
        />

        <MiniStatCard
          label="Publishing"
          value={counts.publishing}
          icon={Loader2}
          active={
            activeTab ===
            'publishing'
          }
          onClick={() =>
            setActiveTab(
              'publishing'
            )
          }
        />

        <MiniStatCard
          label="Published"
          value={counts.published}
          icon={CheckCircle}
          active={
            activeTab ===
            'published'
          }
          onClick={() =>
            setActiveTab(
              'published'
            )
          }
        />

        <MiniStatCard
          label="Failed"
          value={counts.failed}
          icon={AlertCircle}
          active={
            activeTab === 'failed'
          }
          onClick={() =>
            setActiveTab('failed')
          }
        />

        <MiniStatCard
          label="Cancelled"
          value={counts.cancelled}
          icon={XCircle}
          active={
            activeTab ===
            'cancelled'
          }
          onClick={() =>
            setActiveTab(
              'cancelled'
            )
          }
        />
      </div>

      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search captions, campaigns..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-400"
          />
        </div>

        <select
          value={platformFilter}
          onChange={(event) =>
            setPlatformFilter(
              event.target.value
            )
          }
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-400"
        >
          <option value="all">
            All Platforms
          </option>

          {availablePlatforms.map(
            (platform) => (
              <option
                key={platform}
                value={platform}
              >
                {platform}
              </option>
            )
          )}
        </select>

        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />

          <select
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target
                  .value as SortOrder
              )
            }
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/10 focus:border-violet-400 appearance-none"
          >
            <option value="newest">
              Newest first
            </option>

            <option value="oldest">
              Oldest first
            </option>
          </select>
        </div>
      </div>

      {/* =================================================
          STATUS TABS
      ================================================= */}

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <TabButton
          label="All"
          active={
            activeTab === 'all'
          }
          onClick={() =>
            setActiveTab('all')
          }
        />

        <TabButton
          label="Drafts"
          active={
            activeTab === 'draft'
          }
          onClick={() =>
            setActiveTab('draft')
          }
        />

        <TabButton
          label="Pending"
          active={
            activeTab ===
            'pending_approval'
          }
          onClick={() =>
            setActiveTab(
              'pending_approval'
            )
          }
        />

        <TabButton
          label="Scheduled"
          active={
            activeTab ===
            'scheduled'
          }
          onClick={() =>
            setActiveTab(
              'scheduled'
            )
          }
        />

        <TabButton
          label="Publishing"
          active={
            activeTab ===
            'publishing'
          }
          onClick={() =>
            setActiveTab(
              'publishing'
            )
          }
        />

        <TabButton
          label="Published"
          active={
            activeTab ===
            'published'
          }
          onClick={() =>
            setActiveTab(
              'published'
            )
          }
        />

        <TabButton
          label="Failed"
          active={
            activeTab === 'failed'
          }
          onClick={() =>
            setActiveTab('failed')
          }
        />

        <TabButton
          label="Cancelled"
          active={
            activeTab ===
            'cancelled'
          }
          onClick={() =>
            setActiveTab(
              'cancelled'
            )
          }
        />
      </div>

      {/* =================================================
          POST LIST
      ================================================= */}

      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <FileText className="w-10 h-10 mx-auto text-gray-300" />

          <p className="mt-3 text-sm font-medium text-gray-600">
            {searchTerm ||
            platformFilter !== 'all'
              ? 'No posts match your filters'
              : 'No posts here yet'}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {searchTerm ||
            platformFilter !== 'all'
              ? 'Try adjusting your search or platform filter.'
              : 'Create your first post to see it here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map(
            (post: any) => (
              <PostRow
                key={post.id}
                post={post}
                accounts={accounts}
                campaigns={campaigns}
                userRole={userRole}
                workflowLoading={
                  workflowLoadingId ===
                  Number(post.id)
                }
                onView={() =>
                  setViewingPost(
                    post
                  )
                }
                onEdit={() =>
                  handleEdit(
                    post.id
                  )
                }
                onCampaign={() =>
                  openCampaignModal(
                    post
                  )
                }
                onCancel={() =>
                  handleCancel(
                    post
                  )
                }
                onDelete={() =>
                  handleDelete(
                    Number(post.id)
                  )
                }
                onSubmitForApproval={() =>
                  handleSubmitForApproval(
                    post
                  )
                }
                onApprove={() =>
                  handleApprove(
                    post
                  )
                }
                onReject={() =>
                  openRejectModal(
                    post
                  )
                }
                deleting={
                  deletingId ===
                  Number(post.id)
                }
                cancelling={
                  cancellingId ===
                  Number(post.id)
                }
              />
            )
          )}
        </div>
      )}

      {/* =================================================
          VIEW MODAL
      ================================================= */}

      {viewingPost && (
        <PostViewModal
          post={viewingPost}
          accounts={accounts}
          campaigns={campaigns}
          userRole={userRole}
          workflowLoading={
            workflowLoadingId ===
            Number(viewingPost.id)
          }
          onClose={() =>
            setViewingPost(null)
          }
          onEdit={() => {
            const postId =
              viewingPost.id;

            setViewingPost(null);

            handleEdit(postId);
          }}
          onCampaign={() => {
            const post =
              viewingPost;

            setViewingPost(null);

            openCampaignModal(
              post
            );
          }}
          onCancel={() =>
            handleCancel(
              viewingPost
            )
          }
          onSubmitForApproval={() =>
            handleSubmitForApproval(
              viewingPost
            )
          }
          onApprove={() =>
            handleApprove(
              viewingPost
            )
          }
          onReject={() =>
            openRejectModal(
              viewingPost
            )
          }
          cancelling={
            cancellingId ===
            Number(
              viewingPost.id
            )
          }
        />
      )}

      {/* =================================================
          CAMPAIGN MODAL
      ================================================= */}

      {campaignPost && (
        <CampaignAssignmentModal
          post={campaignPost}
          campaigns={campaigns}
          selectedCampaignId={
            selectedCampaignId
          }
          loading={
            loadingCampaigns
          }
          saving={
            assigningCampaignId ===
            Number(
              campaignPost.id
            )
          }
          currentCampaignId={getPostCampaignId(
            campaignPost
          )}
          onChange={
            setSelectedCampaignId
          }
          onClose={
            closeCampaignModal
          }
          onSave={
            handleCampaignAssignment
          }
          getCampaignName={
            getCampaignName
          }
        />
      )}

      {/* =================================================
          REJECT MODAL
      ================================================= */}

      {rejectingPost && (
        <RejectPostModal
          post={rejectingPost}
          reason={rejectReason}
          saving={
            workflowLoadingId ===
            Number(
              rejectingPost.id
            )
          }
          onChange={
            setRejectReason
          }
          onClose={
            closeRejectModal
          }
          onReject={
            handleReject
          }
        />
      )}
    </div>
  );
}

/* =====================================================
   POST ROW
===================================================== */

function PostRow({
  post,
  accounts,
  campaigns,
  userRole,
  workflowLoading,
  onView,
  onEdit,
  onCampaign,
  onCancel,
  onDelete,
  onSubmitForApproval,
  onApprove,
  onReject,
  deleting,
  cancelling,
}: {
  post: any;
  accounts: any[];
  campaigns: Campaign[];
  userRole: UserRole;
  workflowLoading: boolean;
  onView: () => void;
  onEdit: () => void;
  onCampaign: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onSubmitForApproval: () => void;
  onApprove: () => void;
  onReject: () => void;
  deleting: boolean;
  cancelling: boolean;
}) {
  const platforms =
    getPostPlatforms(
      post,
      accounts
    );

  const status =
    normalizeStatus(
      post.status
    );

  const campaignId =
    post.campaign_id ??
    post.campaignId ??
    post.campaign?.id ??
    null;

  const campaign =
    campaigns.find(
      (item) =>
        String(item.id) ===
        String(campaignId)
    ) ||
    post.campaign ||
    null;

  const campaignName =
    campaign?.name ||
    campaign?.title ||
    post.campaign_name ||
    null;

  const canCancel =
    status === 'scheduled' ||
    status ===
      'pending_approval' ||
    status === 'publishing';

  const showSubmit =
    canSubmitForApproval(
      userRole,
      post
    );

  const showApproveReject =
    canApproveOrReject(
      userRole,
      post
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={getStatusBadgeClass(
                status
              )}
            >
              {formatStatus(status)}
            </span>

            {platforms.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 text-xs font-medium text-violet-700">
                <Share2 className="w-3.5 h-3.5" />
                {platforms.join(', ')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-xs text-gray-500">
                <Share2 className="w-3.5 h-3.5" />
                No account linked
              </span>
            )}
          </div>

          <p className="text-sm text-gray-900 whitespace-pre-wrap line-clamp-3">
            {post.content ||
              'No content'}
          </p>

          {campaignName ? (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-xs font-medium text-indigo-700">
              <Link2 className="w-3.5 h-3.5" />
              Campaign: {campaignName}
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-xs text-gray-500">
              <Link2 className="w-3.5 h-3.5" />
              No campaign assigned
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {post.scheduled_time && (
              <span>
                Scheduled:{' '}
                {formatDateTime(
                  post.scheduled_time
                )}
              </span>
            )}

            {post.published_time && (
              <span>
                Published:{' '}
                {formatDateTime(
                  post.published_time
                )}
              </span>
            )}
          </div>

          {status === 'failed' &&
            (post.error_message ||
              post.failure_reason ||
              post.error) && (
              <div className="mt-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                <p className="text-xs text-red-600">
                  {post.error_message ||
                    post.failure_reason ||
                    post.error}
                </p>
              </div>
            )}

          {status ===
            'pending_approval' && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />

                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    Awaiting approval
                  </p>

                  <p className="text-[11px] text-amber-700 mt-0.5">
                    This post has been submitted for review.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'draft' &&
            post.rejection_reason && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />

                  <div>
                    <p className="text-xs font-semibold text-red-800">
                      Post rejected
                    </p>

                    <p className="text-[11px] text-red-700 mt-0.5">
                      {post.rejection_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
          <ActionButton
            label="View"
            icon={Eye}
            onClick={onView}
          />

          <ActionButton
            label="Edit"
            icon={Pencil}
            onClick={onEdit}
          />

          <ActionButton
            label="Campaign"
            icon={Link2}
            onClick={onCampaign}
          />

          {/* =================================================
              SUBMIT FOR APPROVAL
          ================================================= */}

          {showSubmit && (
            <ActionButton
              label={
                workflowLoading
                  ? 'Submitting...'
                  : 'Submit for Approval'
              }
              icon={Send}
              onClick={
                onSubmitForApproval
              }
              disabled={
                workflowLoading
              }
              primary
            />
          )}

          {/* =================================================
              APPROVE / REJECT
          ================================================= */}

          {showApproveReject && (
            <>
              <ActionButton
                label={
                  workflowLoading
                    ? 'Approving...'
                    : 'Approve'
                }
                icon={ThumbsUp}
                onClick={onApprove}
                disabled={
                  workflowLoading
                }
                success
              />

              <ActionButton
                label="Reject"
                icon={ThumbsDown}
                onClick={onReject}
                disabled={
                  workflowLoading
                }
                danger
              />
            </>
          )}

          {canCancel && (
            <ActionButton
              label={
                cancelling
                  ? 'Cancelling...'
                  : 'Cancel'
              }
              icon={Ban}
              onClick={onCancel}
              danger
              disabled={cancelling}
            />
          )}

          <ActionButton
            label={
              deleting
                ? 'Deleting...'
                : 'Delete'
            }
            icon={Trash2}
            onClick={onDelete}
            danger
            disabled={deleting}
          />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ACTION BUTTON
===================================================== */

function ActionButton({
  label,
  icon: Icon,
  onClick,
  danger,
  success,
  primary,
  disabled,
}: {
  label: string;
  icon: any;
  onClick: () => void;
  danger?: boolean;
  success?: boolean;
  primary?: boolean;
  disabled?: boolean;
}) {
  let className =
    'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  if (primary) {
    className +=
      ' border-violet-200 text-violet-700 hover:bg-violet-50';
  } else if (success) {
    className +=
      ' border-emerald-200 text-emerald-700 hover:bg-emerald-50';
  } else if (danger) {
    className +=
      ' border-red-200 text-red-600 hover:bg-red-50';
  } else {
    className +=
      ' border-gray-200 text-gray-600 hover:bg-gray-50';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {disabled ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}

      {label}
    </button>
  );
}

/* =====================================================
   CAMPAIGN ASSIGNMENT MODAL
===================================================== */

function CampaignAssignmentModal({
  post,
  campaigns,
  selectedCampaignId,
  currentCampaignId,
  loading,
  saving,
  onChange,
  onClose,
  onSave,
  getCampaignName,
}: {
  post: any;
  campaigns: Campaign[];
  selectedCampaignId: string;
  currentCampaignId: string | null;
  loading: boolean;
  saving: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  getCampaignName: (
    campaignId: string | null,
    post?: any
  ) => string | null;
}) {
  const currentCampaignName =
    getCampaignName(
      currentCampaignId,
      post
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Reassign Campaign
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Connect this post to another
              campaign or disconnect it.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
            <p className="text-xs text-gray-400">
              Post
            </p>

            <p className="text-sm text-gray-800 mt-1 line-clamp-3">
              {post.content ||
                'No content'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current Campaign
            </label>

            <p className="text-sm text-gray-600">
              {currentCampaignName ||
                'No campaign assigned'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Campaign
            </label>

            {loading ? (
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading campaigns...
              </div>
            ) : (
              <select
                value={
                  selectedCampaignId
                }
                onChange={(event) =>
                  onChange(
                    event.target.value
                  )
                }
                disabled={saving}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:bg-gray-50"
              >
                <option value="">
                  No Campaign
                </option>

                {campaigns.map(
                  (campaign) => (
                    <option
                      key={
                        campaign.id
                      }
                      value={String(
                        campaign.id
                      )}
                    >
                      {campaign.name ||
                        campaign.title ||
                        `Campaign #${campaign.id}`}
                    </option>
                  )
                )}
              </select>
            )}
          </div>

          {campaigns.length === 0 &&
            !loading && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">
                  No campaigns are
                  available. Create a
                  campaign first.
                </p>
              </div>
            )}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={
              saving ||
              loading
            }
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}

            {saving
              ? 'Saving...'
              : 'Save Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   POST VIEW MODAL
===================================================== */

function PostViewModal({
  post,
  accounts,
  campaigns,
  userRole,
  workflowLoading,
  onClose,
  onEdit,
  onCampaign,
  onCancel,
  onSubmitForApproval,
  onApprove,
  onReject,
  cancelling,
}: {
  post: any;
  accounts: any[];
  campaigns: Campaign[];
  userRole: UserRole;
  workflowLoading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCampaign: () => void;
  onCancel: () => void;
  onSubmitForApproval: () => void;
  onApprove: () => void;
  onReject: () => void;
  cancelling: boolean;
}) {
  const platforms =
    getPostPlatforms(
      post,
      accounts
    );

  const status =
    normalizeStatus(
      post.status
    );

  const campaignId =
    post.campaign_id ??
    post.campaignId ??
    post.campaign?.id ??
    null;

  const campaign =
    campaigns.find(
      (item) =>
        String(item.id) ===
        String(campaignId)
    ) ||
    post.campaign ||
    null;

  const campaignName =
    campaign?.name ||
    campaign?.title ||
    post.campaign_name ||
    null;

  const canCancel =
    status === 'scheduled' ||
    status ===
      'pending_approval' ||
    status === 'publishing';

  const showSubmit =
    canSubmitForApproval(
      userRole,
      post
    );

  const showApproveReject =
    canApproveOrReject(
      userRole,
      post
    );

  const mediaUrls =
    getMediaUrls(
      post.media_url
    );

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Post Details
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={getStatusBadgeClass(
                status
              )}
            >
              {formatStatus(status)}
            </span>

            {platforms.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 text-xs font-medium text-violet-700">
                <Share2 className="w-3.5 h-3.5" />
                {platforms.join(', ')}
              </span>
            )}
          </div>

          {/* =================================================
              WORKFLOW STATUS
          ================================================= */}

          {status ===
            'pending_approval' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5" />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Pending Approval
                  </p>

                  <p className="text-xs text-amber-700 mt-0.5">
                    This post is waiting for review by an authorized Marketing Team member or Administrator.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'draft' &&
            post.rejection_reason && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5" />

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Post Rejected
                    </p>

                    <p className="text-xs text-red-700 mt-0.5">
                      {post.rejection_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-indigo-500">
                  Campaign
                </p>

                <p className="text-sm font-medium text-indigo-800 mt-0.5 truncate">
                  {campaignName ||
                    'No campaign assigned'}
                </p>
              </div>

              <button
                type="button"
                onClick={onCampaign}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
              >
                <Link2 className="w-3.5 h-3.5" />
                Reassign
              </button>
            </div>
          </div>

          {mediaUrls.length > 0 && (
            <div
              className={`grid gap-2 ${
                mediaUrls.length > 1
                  ? 'grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {mediaUrls.map(
                (url, index) =>
                  post.media_type ===
                  'video' ? (
                    <video
                      key={index}
                      src={url}
                      controls
                      className="w-full rounded-lg bg-gray-100"
                    />
                  ) : (
                    <img
                      key={index}
                      src={url}
                      alt={`Post media ${
                        index + 1
                      }`}
                      className="w-full rounded-lg object-cover bg-gray-100"
                    />
                  )
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">
              Content
            </p>

            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {post.content ||
                'No content'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {post.created_at && (
              <div>
                <p className="text-gray-400">
                  Created
                </p>

                <p className="text-gray-700 mt-0.5">
                  {formatDateTime(
                    post.created_at
                  )}
                </p>
              </div>
            )}

            {post.updated_at && (
              <div>
                <p className="text-gray-400">
                  Updated
                </p>

                <p className="text-gray-700 mt-0.5">
                  {formatDateTime(
                    post.updated_at
                  )}
                </p>
              </div>
            )}

            {post.scheduled_time && (
              <div>
                <p className="text-gray-400">
                  Scheduled
                </p>

                <p className="text-gray-700 mt-0.5">
                  {formatDateTime(
                    post.scheduled_time
                  )}
                </p>
              </div>
            )}

            {post.published_time && (
              <div>
                <p className="text-gray-400">
                  Published
                </p>

                <p className="text-gray-700 mt-0.5">
                  {formatDateTime(
                    post.published_time
                  )}
                </p>
              </div>
            )}
          </div>

          {status === 'failed' &&
            (post.error_message ||
              post.failure_reason ||
              post.error) && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                <p className="text-xs font-medium text-red-700">
                  Publishing failed
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {post.error_message ||
                    post.failure_reason ||
                    post.error}
                </p>
              </div>
            )}
        </div>

        <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>

          {/* =================================================
              SUBMIT FOR APPROVAL
          ================================================= */}

          {showSubmit && (
            <button
              type="button"
              onClick={onSubmitForApproval}
              disabled={
                workflowLoading
              }
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-violet-200 text-violet-700 hover:bg-violet-50 disabled:opacity-50"
            >
              {workflowLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}

              {workflowLoading
                ? 'Submitting...'
                : 'Submit for Approval'}
            </button>
          )}

          {/* =================================================
              APPROVE / REJECT
          ================================================= */}

          {showApproveReject && (
            <>
              <button
                type="button"
                onClick={onApprove}
                disabled={
                  workflowLoading
                }
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {workflowLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ThumbsUp className="w-4 h-4" />
                )}

                Approve
              </button>

              <button
                type="button"
                onClick={onReject}
                disabled={
                  workflowLoading
                }
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
            </>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {cancelling && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}

              {cancelling
                ? 'Cancelling...'
                : 'Cancel Post'}
            </button>
          )}

          <button
            type="button"
            onClick={onEdit}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-violet-600 text-white hover:bg-violet-700"
          >
            Edit Post
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   REJECT POST MODAL
===================================================== */

function RejectPostModal({
  post,
  reason,
  saving,
  onChange,
  onClose,
  onReject,
}: {
  post: any;
  reason: string;
  saving: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Reject Post
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Provide a reason so the creator knows what needs to be changed.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-400">
              Post
            </p>

            <p className="text-sm text-gray-800 mt-1 line-clamp-4">
              {post.content ||
                'No content'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rejection Reason
            </label>

            <textarea
              value={reason}
              onChange={(event) =>
                onChange(
                  event.target.value
                )
              }
              disabled={saving}
              rows={5}
              placeholder="Explain why this post needs changes..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 disabled:bg-gray-50"
            />

            <p className="mt-1 text-[11px] text-gray-400">
              A rejection reason is required.
            </p>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onReject}
            disabled={
              saving ||
              !reason.trim()
            }
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}

            {saving
              ? 'Rejecting...'
              : 'Reject Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function MiniStatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border p-3 transition-all ${
        active
          ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-200'
          : 'border-gray-200 bg-white hover:border-violet-300'
      }`}
    >
      <Icon
        className={`w-4 h-4 mb-2 ${
          active
            ? 'text-violet-600'
            : 'text-gray-400'
        }`}
      />

      <p className="text-xl font-bold text-gray-900">
        {value}
      </p>

      <p className="text-[11px] text-gray-500">
        {label}
      </p>
    </button>
  );
}

/* =====================================================
   TAB BUTTON
===================================================== */

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-violet-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}

/* =====================================================
   SOCIAL PLATFORM HELPERS
===================================================== */

function getPostPlatforms(
  post: any,
  accounts: any[]
): string[] {
  const platforms =
    new Set<string>();

  const embeddedAccounts =
    post?.social_accounts ||
    post?.post_social_accounts ||
    post?.socialAccounts ||
    [];

  if (
    Array.isArray(
      embeddedAccounts
    )
  ) {
    embeddedAccounts.forEach(
      (account: any) => {
        const platform =
          account?.platform ||
          account?.social_account
            ?.platform;

        if (platform) {
          platforms.add(
            formatPlatform(
              platform
            )
          );
        }
      }
    );
  }

  const ids =
    post?.social_account_ids ||
    post?.socialAccountIds ||
    [];

  if (Array.isArray(ids)) {
    ids.forEach(
      (
        id: number | string
      ) => {
        const account =
          accounts.find(
            (item: any) =>
              String(item.id) ===
              String(id)
          );

        if (account?.platform) {
          platforms.add(
            formatPlatform(
              account.platform
            )
          );
        }
      }
    );
  }

  if (
    Array.isArray(
      embeddedAccounts
    )
  ) {
    embeddedAccounts.forEach(
      (item: any) => {
        const accountId =
          item?.social_account_id ||
          item?.socialAccountId ||
          item?.social_account
            ?.id;

        if (accountId) {
          const account =
            accounts.find(
              (accountItem: any) =>
                String(
                  accountItem.id
                ) ===
                String(accountId)
            );

          if (account?.platform) {
            platforms.add(
              formatPlatform(
                account.platform
              )
            );
          }
        }
      }
    );
  }

  return Array.from(
    platforms
  );
}

function formatPlatform(
  platform: string
): string {
  const normalized =
    String(platform)
      .toLowerCase()
      .replace(/[\_-]/g, '');

  if (
    normalized ===
    'facebook'
  ) {
    return 'Facebook';
  }

  if (
    normalized ===
    'instagram'
  ) {
    return 'Instagram';
  }

  if (
    normalized ===
    'linkedin'
  ) {
    return 'LinkedIn';
  }

  if (
    normalized ===
    'youtube'
  ) {
    return 'YouTube';
  }

  if (
    normalized ===
      'twitter' ||
    normalized === 'x'
  ) {
    return 'X';
  }

  if (
    normalized ===
    'pinterest'
  ) {
    return 'Pinterest';
  }

  return platform;
}

/* =====================================================
   MEDIA URL HELPER
===================================================== */

function getMediaUrls(
  mediaUrl: any
): string[] {
  if (!mediaUrl) {
    return [];
  }

  if (Array.isArray(mediaUrl)) {
    return mediaUrl.filter(
      (item) =>
        typeof item ===
          'string' &&
        item.trim()
    );
  }

  if (
    typeof mediaUrl !==
    'string'
  ) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(mediaUrl);

    if (
      Array.isArray(parsed)
    ) {
      return parsed.filter(
        (item) =>
          typeof item ===
            'string' &&
          item.trim()
      );
    }

    if (
      typeof parsed ===
        'string' &&
      parsed.trim()
    ) {
      return [parsed];
    }
  } catch {
    return [mediaUrl];
  }

  return [mediaUrl];
}

/* =====================================================
   STATUS HELPERS
===================================================== */

function normalizeStatus(
  status: any
): string {
  return String(
    status || ''
  )
    .toLowerCase()
    .trim();
}

function formatStatus(
  status: string
): string {
  switch (
    normalizeStatus(status)
  ) {
    case 'draft':
      return 'Draft';

    case 'pending_approval':
      return 'Pending Approval';

    case 'scheduled':
      return 'Scheduled';

    case 'publishing':
      return 'Publishing';

    case 'published':
      return 'Published';

    case 'failed':
      return 'Failed';

    case 'cancelled':
      return 'Cancelled';

    default:
      return status || 'Unknown';
  }
}

function getStatusBadgeClass(
  status: string
): string {
  const base =
    'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium';

  switch (
    normalizeStatus(status)
  ) {
    case 'draft':
      return `${base} bg-gray-100 text-gray-700`;

    case 'pending_approval':
      return `${base} bg-amber-100 text-amber-700`;

    case 'scheduled':
      return `${base} bg-blue-100 text-blue-700`;

    case 'publishing':
      return `${base} bg-violet-100 text-violet-700`;

    case 'published':
      return `${base} bg-emerald-100 text-emerald-700`;

    case 'failed':
      return `${base} bg-red-100 text-red-700`;

    case 'cancelled':
      return `${base} bg-gray-100 text-gray-600`;

    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
}

/* =====================================================
   ROLE DISPLAY
===================================================== */

function formatRole(
  role: UserRole
): string {
  switch (role) {
    case 'administrator':
      return 'Administrator';

    case 'marketing_team':
      return 'Marketing Team';

    case 'business_user':
      return 'Business User';

    case 'content_creator':
      return 'Content Creator';

    default:
      return 'User';
  }
}

/* =====================================================
   SORT / DATE HELPERS
===================================================== */

function getPostSortDate(
  post: any
): number {
  const value =
    post?.created_at ||
    post?.updated_at ||
    post?.scheduled_time ||
    post?.published_time ||
    post?.cancelled_at ||
    null;

  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return 'Not available';
  }

  try {
    return new Date(
      value
    ).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone:
        'Asia/Kolkata',
    });
  } catch {
    return value;
  }
}

export default MyPostsPage;