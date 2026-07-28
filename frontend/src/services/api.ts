import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000',
  timeout: 10000,
});

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
      delete config.headers?.['Content-Type'];
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
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        'auth_token'
      );

      localStorage.removeItem(
        'user_role'
      );
    }

    return Promise.reject(error);
  }
);


/* =====================================================
   HEALTH SERVICE
===================================================== */

export const healthService = {
  check: () => {
    return api.get('/health');
  },
};


/* =====================================================
   AUTH SERVICE
===================================================== */

export const authService = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role: string;
  }) => {
    return api.post(
      '/users/',
      data
    );
  },

  checkAdministratorExists: () => {
    return api.get(
      '/users/admin-exists'
    );
  },

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

  getMe: () => {
    return api.get(
      '/users/me'
    );
  },
};


/* =====================================================
   POST SERVICE
===================================================== */

export const postService = {
  getAll: (
    status?: string
  ) => {
    if (status) {
      return api.get(
        '/posts/',
        {
          params: {
            status,
          },
        }
      );
    }

    return api.get(
      '/posts/'
    );
  },

  getById: (
    id: string | number
  ) => {
    return api.get(
      `/posts/${id}`
    );
  },

  create: (data: {
    content?: string | null;
    media_url?: string | null;
    media_type: string;
    scheduled_time?: string | null;
    timezone?: string;
    campaign_id?: number | null;
    social_account_ids: number[];
    save_as_draft: boolean;
  }) => {
    return api.post(
      '/posts/',
      data
    );
  },

  update: (
    id: string | number,
    data: any
  ) => {
    return api.put(
      `/posts/${id}`,
      data
    );
  },

  delete: (
    id: string | number
  ) => {
    return api.delete(
      `/posts/${id}`
    );
  },

  cancel: (
    id: string | number
  ) => {
    return api.post(
      `/posts/${id}/cancel`
    );
  },

  getCalendar: () => {
    return api.get(
      '/posts/calendar'
    );
  },

  getQueue: () => {
    return api.get(
      '/posts/queue'
    );
  },
};


/* =====================================================
   CAMPAIGN SERVICE
===================================================== */

export const campaignService = {
  getAll: () => {
    return api.get(
      '/campaigns/'
    );
  },

  getClientCampaigns: (
    clientId: number
  ) => {
    return api.get(
      `/campaigns/client/${clientId}`
    );
  },

  getById: (
    id: string | number
  ) => {
    return api.get(
      `/campaigns/${id}`
    );
  },

  create: (
    data: any
  ) => {
    return api.post(
      '/campaigns/',
      data
    );
  },

  update: (
    id: string | number,
    data: any
  ) => {
    return api.put(
      `/campaigns/${id}`,
      data
    );
  },

  delete: (
    id: string | number
  ) => {
    return api.delete(
      `/campaigns/${id}`
    );
  },
};


/* =====================================================
   SOCIAL ACCOUNT SERVICE
===================================================== */

export const accountService = {
  getAll: () => {
    return api.get(
      '/social-accounts/'
    );
  },

  getById: (
    id: string | number
  ) => {
    return api.get(
      `/social-accounts/${id}`
    );
  },

  delete: (
    id: string | number
  ) => {
    return api.delete(
      `/social-accounts/${id}`
    );
  },

  facebookLogin: () => {
    return api.get(
      '/social-accounts/facebook/login'
    );
  },

  instagramLogin: () => {
    return api.get(
      '/social-accounts/instagram/login'
    );
  },

  youtubeLogin: () => {
    return api.get(
      '/social-accounts/youtube/login'
    );
  },

  linkedinLogin: () => {
    return api.get(
      '/social-accounts/linkedin/login'
    );
  },

  twitterLogin: () => {
    return api.get(
      '/social-accounts/twitter/login'
    );
  },

  pinterestLogin: () => {
    return api.get(
      '/social-accounts/pinterest/login'
    );
  },
};


/* =====================================================
   BUSINESS ASSIGNMENT SERVICE
===================================================== */

export const businessAssignmentService = {
  getMarketingTeams: () => {
    return api.get(
      '/business-assignment/marketing-teams'
    );
  },

  getMyAssignment: () => {
    return api.get(
      '/business-assignment/my-assignment'
    );
  },

  assignMarketingTeam: (
    marketingTeamId: number
  ) => {
    return api.post(
      `/business-assignment/assign/${marketingTeamId}`
    );
  },

  getMyClients: () => {
    return api.get(
      '/business-assignment/my-clients'
    );
  },

  getClientDetails: (
    clientId: number
  ) => {
    return api.get(
      `/business-assignment/client/${clientId}`
    );
  },
};


/* =====================================================
   DEFAULT API EXPORT
===================================================== */

export default api;