import axios from 'axios';

const api = axios.create({
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
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers?.['Content-Type'];
    } else if (
      config.data instanceof URLSearchParams
    ) {
      config.headers = config.headers || {};
      config.headers['Content-Type'] =
        'application/x-www-form-urlencoded';
    } else if (
      config.data &&
      typeof config.data === 'object'
    ) {
      config.headers = config.headers || {};
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
    api.post('/users/', data),

  checkAdministratorExists: () =>
    api.get('/users/admin-exists'),

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
    api.put('/users/me', data),

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
};

/* =========================================================
   USERS
========================================================= */

export const userService = {
  getAll: () =>
    api.get('/users/all'),
};

/* =========================================================
   MEDIA UPLOAD
========================================================= */

export const uploadService = {

  /*
   * IMPORTANT:
   *
   * Backend endpoint is:
   *
   * POST /uploads/?platform=facebook
   *
   * Therefore platform MUST be sent.
   */
  uploadMedia: (
    file: File,
    platform: string
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

    if (clientId) {
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

  create: (data: {
    client_id?: number | null;
    content?: string | null;
    media_url?: string | null;
    media_type: string;
    scheduled_time?: string | null;
    timezone?: string;
    campaign_id?: number | null;
    social_account_ids: number[];
    save_as_draft: boolean;
  }) =>
    api.post(
      '/posts/',
      data
    ),

  update: (
    id: string | number,
    data: {
      content?: string;
      media_url?: string | null;
      media_type?: string;
      scheduled_time?: string;
      timezone?: string;
      campaign_id?: number | null;
      social_account_ids?: number[];
    }
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

    if (clientId) {
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

    if (clientId) {
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

    if (clientId) {
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
    campaignId: string | number
  ) =>
    api.get(
      `/campaigns/${campaignId}/posts`
    ),
};

/* =========================================================
   SOCIAL ACCOUNTS
========================================================= */

export const accountService = {

  getAll: () =>
    api.get(
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
   NOTIFICATIONS
========================================================= */

export const notificationService = {

  getAll: () =>
    api.get(
      '/notifications'
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

  clearAll: () =>
    api.delete(
      '/notifications'
    ),
};

export default api;

