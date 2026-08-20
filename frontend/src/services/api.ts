import axios from 'axios';

/* =========================================================
   API CLIENT
========================================================= */

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000',
  timeout: 120000,
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('auth_token');

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    } else if (
      config.data instanceof URLSearchParams
    ) {
      config.headers =
        config.headers || {};

      config.headers['Content-Type'] =
        'application/x-www-form-urlencoded';
    } else if (
      config.data &&
      typeof config.data === 'object'
    ) {
      config.headers =
        config.headers || {};

      config.headers['Content-Type'] =
        'application/json';
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401
    ) {
      console.warn(
        'API returned 401:',
        error.config?.url
      );
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   HEALTH
========================================================= */

export const healthService = {
  check: () =>
    api.get('/health'),
};

/* =========================================================
   AUTH
========================================================= */

export const authService = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role: string;
  }) =>
    api.post(
      '/users/',
      data
    ),

  checkAdministratorExists: () =>
    api.get(
      '/users/admin-exists'
    ),

  login: (
    username: string,
    password: string
  ) => {
    const formData =
      new URLSearchParams();

    formData.append(
      'username',
      username
    );

    formData.append(
      'password',
      password
    );

    return api.post(
      '/users/login',
      formData
    );
  },

  getMe: () =>
    api.get('/users/me'),

  updateProfile: (data: {
    full_name?: string;
    email?: string;
  }) =>
    api.put(
      '/users/me',
      data
    ),

  updatePassword: (data: {
    current_password: string;
    new_password: string;
  }) =>
    api.put(
      '/users/me/password',
      data
    ),

  updateMe: (data: {
    username?: string;
    email?: string;
    full_name?: string;
    phone?: string;
    company?: string;
    website?: string;
    bio?: string;
  }) =>
    api.put(
      '/users/me',
      data
    ),

  /* =======================================================
     NOTIFICATION PREFERENCES
  ======================================================= */

  getNotificationPreferences: () =>
    api.get(
      '/notification-preferences'
    ),

  updateNotificationPreferences: (
    data: {
      publishing_notifications_enabled: boolean;
      campaign_notifications_enabled: boolean;
      account_activity_notifications_enabled: boolean;
      team_collaboration_notifications_enabled: boolean;
      system_notifications_enabled: boolean;
      in_app_notifications_enabled: boolean;
      email_notifications_enabled: boolean;
      push_notifications_enabled: boolean;
    }
  ) =>
    api.patch(
      '/notification-preferences',
      data
    ),

  getEmailPreferences: () =>
    api.get(
      '/notification-preferences/email'
    ),

  updateEmailPreferences: (
    data: {
      email_notifications_enabled: boolean;
      email_frequency: string;
      promotional_emails_enabled: boolean;
    }
  ) =>
    api.patch(
      '/notification-preferences/email',
      data
    ),
};

/* =========================================================
   USERS
========================================================= */

export type User = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;

  phone?: string | null;
  company?: string | null;
  website?: string | null;
  bio?: string | null;

  [key: string]: any;
};

export const userService = {
  /* -------------------------------------------------------
     Get all users
     Backend:
     GET /users/all
  ------------------------------------------------------- */

  getAll: () =>
    api.get<User[]>(
      '/users/all'
    ),

  /* -------------------------------------------------------
     Get current logged-in user
     Backend:
     GET /users/me
  ------------------------------------------------------- */

  getCurrentUser: () =>
    api.get(
      '/users/me'
    ),

  /* -------------------------------------------------------
     Delete a user
     Backend:
     DELETE /users/{user_id}
  ------------------------------------------------------- */

  deleteUser: (
    id: string | number
  ) =>
    api.delete(
      `/users/${id}`
    ),

  /* -------------------------------------------------------
     Get all content creators
     Backend:
     GET /users/creator
  ------------------------------------------------------- */

  getContentCreators: () =>
    api.get<User[]>(
      '/users/creator'
    ),

  /* -------------------------------------------------------
     Get all business users
     Backend:
     GET /users/business-users
  ------------------------------------------------------- */

  getBusinessUsers: () =>
    api.get<User[]>(
      '/users/business-users'
    ),

  /* -------------------------------------------------------
     Get all marketing team users
     Backend:
     GET /users/marketing-users
  ------------------------------------------------------- */

  getMarketingUsers: () =>
    api.get<User[]>(
      '/users/marketing-users'
    ),
};

/* =========================================================
   UPLOADS
========================================================= */

export const uploadService = {
  uploadMedia: (
    file: File,
    platform: string = 'general'
  ) => {
    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    return api.post(
      '/uploads/',
      formData,
      {
        params: {
          platform,
        },
        timeout: 120000,
      }
    );
  },
};

/* =========================================================
   POSTS
========================================================= */

export type PostPayload = {
  client_id?: number | null;
  content?: string | null;
  media_url?: string | null;
  media_type: string;
  scheduled_time?: string | null;
  timezone?: string;
  campaign_id?: number | null;
  social_account_ids: number[];
  save_as_draft: boolean;
};

export type PostUpdatePayload = {
  content?: string | null;
  media_url?: string | null;
  media_type?: string;
  scheduled_time?: string | null;
  timezone?: string;
  campaign_id?: number | null;
  social_account_ids?: number[];
  save_as_draft?: boolean;
};

export const postService = {
  getAll: (
    status?: string,
    clientId?: number
  ) => {
    const params: Record<
      string,
      any
    > = {};

    if (status) {
      params.status = status;
    }

    if (
      clientId !== undefined &&
      clientId !== null
    ) {
      params.client_id =
        clientId;
    }

    return api.get(
      '/posts/',
      {
        params,
      }
    );
  },

  getById: (
    id: string | number
  ) =>
    api.get(
      `/posts/${id}`
    ),

  create: (
    data: PostPayload
  ) =>
    api.post(
      '/posts/',
      data
    ),

  update: (
    id: string | number,
    data: PostUpdatePayload
  ) =>
    api.put(
      `/posts/${id}`,
      data
    ),

  delete: (
    id: string | number
  ) =>
    api.delete(
      `/posts/${id}`
    ),

  deleteFromSocialAccount: (
    postId: string | number,
    socialAccountId:
      | string
      | number
  ) =>
    api.delete(
      `/posts/${postId}/social-accounts/${socialAccountId}`
    ),

  cancel: (
    id: string | number
  ) =>
    api.post(
      `/posts/${id}/cancel`
    ),

  getCalendar: (
    clientId?: number
  ) => {
    const params: Record<
      string,
      any
    > = {};

    if (
      clientId !== undefined &&
      clientId !== null
    ) {
      params.client_id =
        clientId;
    }

    return api.get(
      '/posts/calendar',
      {
        params,
      }
    );
  },

  getQueue: (
    clientId?: number
  ) => {
    const params: Record<
      string,
      any
    > = {};

    if (
      clientId !== undefined &&
      clientId !== null
    ) {
      params.client_id =
        clientId;
    }

    return api.get(
      '/posts/queue',
      {
        params,
      }
    );
  },
};

/* =========================================================
   CONTENT WORKFLOW
========================================================= */

export const contentWorkflowService = {
  submitForReview: (
    postId: string | number
  ) =>
    api.post(
      `/content-workflow/${postId}/submit-review`
    ),

  approve: (
    postId: string | number
  ) =>
    api.post(
      `/content-workflow/${postId}/approve`
    ),

  reject: (
    postId: string | number,
    reason?: string
  ) =>
    api.post(
      `/content-workflow/${postId}/reject`,
      reason
        ? {
            reason,
          }
        : undefined
    ),
};

/* =========================================================
   CAMPAIGNS
========================================================= */

export const campaignService = {
  getAll: (
    clientId?: number
  ) => {
    const params: Record<
      string,
      any
    > = {};

    if (
      clientId !== undefined &&
      clientId !== null
    ) {
      params.client_id =
        clientId;
    }

    return api.get(
      '/campaigns/',
      {
        params,
      }
    );
  },

  getById: (
    id: string | number
  ) =>
    api.get(
      `/campaigns/${id}`
    ),

  create: (
    data: any
  ) =>
    api.post(
      '/campaigns/',
      data
    ),

  update: (
    id: string | number,
    data: any
  ) =>
    api.put(
      `/campaigns/${id}`,
      data
    ),

  delete: (
    id: string | number
  ) =>
    api.delete(
      `/campaigns/${id}`
    ),

  getCampaignPosts: (
    campaignId:
      | string
      | number
  ) =>
    api.get(
      `/campaigns/${campaignId}/posts`
    ),

  assignPostToCampaign: (
    campaignId:
      | string
      | number,
    postId:
      | string
      | number
  ) =>
    api.post(
      `/campaigns/${campaignId}/posts/${postId}`
    ),

  removePostFromCampaign: (
    campaignId:
      | string
      | number,
    postId:
      | string
      | number
  ) =>
    api.delete(
      `/campaigns/${campaignId}/posts/${postId}`
    ),
};

/* =========================================================
   SOCIAL ACCOUNTS
========================================================= */

export type SocialAccount = {
  id: number;
  account_id: string;
  account_name: string;
  platform: string;
  is_connected: boolean;
  [key: string]: any;
};

export const accountService = {
  getAll: () =>
    api.get<SocialAccount[]>(
      '/social-accounts/'
    ),

  getById: (
    id: string | number
  ) =>
    api.get(
      `/social-accounts/${id}`
    ),

  delete: (
    id: string | number
  ) =>
    api.delete(
      `/social-accounts/${id}`
    ),

  facebookLogin: () =>
    api.get(
      '/social-accounts/facebook/login'
    ),

  instagramLogin: () =>
    api.get(
      '/social-accounts/instagram/login'
    ),

  linkedinLogin: () =>
    api.get(
      '/linkedin/login'
    ),

  youtubeLogin: () =>
    api.get(
      '/youtube/login'
    ),

  twitterLogin: () =>
    api.get(
      '/social-accounts/twitter/login'
    ),

  pinterestLogin: () =>
    api.get(
      '/social-accounts/pinterest/login'
    ),
};

/* =========================================================
   LINKEDIN PUBLISH
========================================================= */

export const linkedinPublishService = {
  publishCarousel: (
    accessToken: string,
    authorUrn: string,
    commentary: string,
    title: string,
    file: File
  ) => {
    const formData =
      new FormData();

    formData.append(
      'access_token',
      accessToken
    );

    formData.append(
      'author_urn',
      authorUrn
    );

    formData.append(
      'commentary',
      commentary
    );

    formData.append(
      'title',
      title
    );

    formData.append(
      'file',
      file
    );

    return api.post(
      '/linkedin/publish/carousel',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      }
    );
  },

  publishVideo: (
    accessToken: string,
    authorUrn: string,
    commentary: string,
    file: File
  ) => {
    const formData =
      new FormData();

    formData.append(
      'access_token',
      accessToken
    );

    formData.append(
      'author_urn',
      authorUrn
    );

    formData.append(
      'commentary',
      commentary
    );

    formData.append(
      'file',
      file
    );

    return api.post(
      '/linkedin/publish/video',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
        timeout: 300000,
      }
    );
  },
};

/* =========================================================
   ANALYTICS
========================================================= */

export const analyticsService = {
  facebookOverview: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/facebook/${accountId}/overview`,
      { params }
    ),

  facebookAudience: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/facebook/${accountId}/audience`,
      { params }
    ),

  facebookInsights: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/facebook/${accountId}/insights`,
      { params }
    ),

  facebookTrends: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/facebook/${accountId}/trends`,
      { params }
    ),

  facebookPosts: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/facebook/${accountId}/posts`,
      { params }
    ),

  instagramOverview: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/instagram/${accountId}/overview`,
      { params }
    ),

  instagramAudience: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/instagram/${accountId}/audience`,
      { params }
    ),

  instagramInsights: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/instagram/${accountId}/insights`,
      { params }
    ),

  instagramTrends: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/instagram/${accountId}/trends`,
      { params }
    ),

  instagramMedia: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/instagram/${accountId}/media`,
      { params }
    ),

  instagramMediaById: (
    accountId: number,
    mediaId:
      | string
      | number
  ) =>
    api.get(
      `/audience/instagram/${accountId}/media/${mediaId}`
    ),

  youtubeAnalytics: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/youtube/${accountId}/analytics`,
      { params }
    ),

  youtubeTrends: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/youtube/${accountId}/trends`,
      { params }
    ),

  youtubeGeography: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/youtube/${accountId}/geography`,
      { params }
    ),

  youtubeDemographics: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/youtube/${accountId}/demographics`,
      { params }
    ),

  linkedinAudience: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/linkedin/${accountId}/audience`,
      { params }
    ),

  linkedinTrends: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/linkedin/${accountId}/trends`,
      { params }
    ),

  linkedinDemographics: (
    accountId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/linkedin/${accountId}/demographics`,
      { params }
    ),

  campaignPerformance: (
    campaignId: number,
    params?: Record<
      string,
      any
    >
  ) =>
    api.get(
      `/audience/campaigns/${campaignId}/performance`,
      { params }
    ),

  getAnalytics: (
    range: string = '30d',
    platform: string = 'all'
  ) =>
    api.get(
      '/analytics/',
      {
        params: {
          range,
          platform,
        },
      }
    ),

  exportAnalytics: (
    range: string = '30d',
    platform: string = 'all'
  ) => {
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      'http://127.0.0.1:8000';

    return `${baseUrl}/analytics/export?range=${range}&platform=${platform}`;
  },
};

/* =========================================================
   BUSINESS ASSIGNMENT
========================================================= */

export const businessAssignmentService = {
  getMarketingTeams: () =>
    api.get(
      '/business-assignment/marketing-teams'
    ),

  getMyAssignment: () =>
    api.get(
      '/business-assignment/my-assignment'
    ),

  assignMarketingTeam: (
    marketingTeamId: number
  ) =>
    api.post(
      `/business-assignment/assign/${marketingTeamId}`
    ),

  getMyClients: () =>
    api.get(
      '/business-assignment/my-clients'
    ),

  getClientDetails: (
    clientId: number
  ) =>
    api.get(
      `/business-assignment/client/${clientId}`
    ),
};

/* =========================================================
   NOTIFICATION PREFERENCES
========================================================= */

export type NotificationPreferences = {
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

export type EmailNotificationPreferences = {
  email_notifications_enabled: boolean;
  email_frequency: string;
  promotional_emails_enabled: boolean;
};

export const notificationPreferencesService = {
  get: () =>
    api.get<NotificationPreferences>(
      '/notification-preferences'
    ),

  update: (
    data: Partial<NotificationPreferences>
  ) =>
    api.patch<NotificationPreferences>(
      '/notification-preferences',
      data
    ),

  getEmail: () =>
    api.get<EmailNotificationPreferences>(
      '/notification-preferences/email'
    ),

  updateEmail: (
    data: Partial<EmailNotificationPreferences>
  ) =>
    api.patch<EmailNotificationPreferences>(
      '/notification-preferences/email',
      data
    ),
};

/* =========================================================
   NOTIFICATION HISTORY
========================================================= */

export type NotificationResponse = {
  id: number;
  user_id: number;
  title: string;
  description: string;

  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | string;

  category?: string;
  delivery_channel?: string;

  is_read: boolean;

  related_post_id:
    | number
    | null;

  related_campaign_id:
    | number
    | null;

  created_at: string;
};

export type NotificationFilters = {
  search?: string;

  category?: string;

  notification_type?:
    | 'info'
    | 'success'
    | 'warning'
    | 'error';

  is_read?: boolean;

  date_from?: string;

  date_to?: string;
};

export const notificationService = {
  getAll: (
    filters?: NotificationFilters
  ) => {
    const params: Record<
      string,
      string | boolean
    > = {};

    if (
      filters?.search &&
      filters.search.trim()
    ) {
      params.search =
        filters.search.trim();
    }

    if (
      filters?.category
    ) {
      params.category =
        filters.category;
    }

    if (
      filters?.notification_type
    ) {
      params.notification_type =
        filters.notification_type;
    }

    if (
      filters?.is_read !== undefined
    ) {
      params.is_read =
        filters.is_read;
    }

    if (
      filters?.date_from
    ) {
      params.date_from =
        filters.date_from;
    }

    if (
      filters?.date_to
    ) {
      params.date_to =
        filters.date_to;
    }

    return api.get<
      NotificationResponse[]
    >(
      '/notification-history',
      {
        params,
      }
    );
  },

  getById: (
    id: string | number
  ) =>
    api.get<NotificationResponse>(
      `/notification-history/${id}`
    ),

  markAsRead: (
    id: string | number
  ) =>
    api.patch(
      `/notifications/${id}/read`
    ),

  markAllAsRead: () =>
    api.patch(
      '/notifications/read-all'
    ),

  delete: (
    id: string | number
  ) =>
    api.delete(
      `/notifications/${id}`
    ),

  clearAll: () =>
    api.delete(
      '/notifications'
    ),
};

/* =========================================================
   TEAM ACTIVITY
========================================================= */

export type TeamActivity = {
  id: number;
  user_id: number;
  activity_type: string;
  description: string;
  created_at: string;

  user_name?: string;
  username?: string;
  campaign_id?: number | null;
  post_id?: number | null;
};

export const teamActivityService = {
  getAll: (
    limit: number = 50,
    offset: number = 0
  ) =>
    api.get<TeamActivity[]>(
      '/team-activities',
      {
        params: {
          limit,
          offset,
        },
      }
    ),
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default api;