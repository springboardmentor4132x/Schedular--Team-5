import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (config.data instanceof URLSearchParams) {
      config.headers['Content-Type'] =
        'application/x-www-form-urlencoded';
    } else if (
      config.data &&
      typeof config.data === 'object'
    ) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }

    return Promise.reject(error);
  }
);

export const healthService = {
  check: () => {
    return api.get('/health');
  },
};

export const authService = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role: string;
  }) => {
    return api.post('/users/', data);
  },

  checkAdministratorExists: () => {
    return api.get('/users/admin-exists');
  },

  login: (
    username: string,
    password: string
  ) => {
    const formData = new URLSearchParams();

    formData.append('username', username);
    formData.append('password', password);

    return api.post('/users/login', formData);
  },

  getMe: () => {
    return api.get('/users/me');
  },
};

export const postService = {
  getAll: (status?: string, clientId?: number) => {
    const params: Record<string, any> = {};
    if (status) params.status = status;
    if (clientId) params.client_id = clientId;

    return api.get('/posts/', { params });
  },

  getById: (id: string | number) => {
    return api.get(`/posts/${id}`);
  },

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
  }) => {
    return api.post('/posts/', data);
  },

  update: (
    id: string | number,
    data: any
  ) => {
    return api.put(`/posts/${id}`, data);
  },

  delete: (id: string | number) => {
    return api.delete(`/posts/${id}`);
  },

  cancel: (id: string | number) => {
    return api.post(`/posts/${id}/cancel`);
  },

  getCalendar: (clientId?: number) => {
    const params: Record<string, any> = {};
    if (clientId) params.client_id = clientId;

    return api.get('/posts/calendar', { params });
  },

  getQueue: (clientId?: number) => {
    const params: Record<string, any> = {};
    if (clientId) params.client_id = clientId;

    return api.get('/posts/queue', { params });
  },
};

export const campaignService = {
  // Updated to accept an optional clientId parameter
  getAll: (clientId?: number) => {
    const params: Record<string, any> = {};
    if (clientId) params.client_id = clientId;
    
    return api.get('/campaigns/', { params });
  },

  getById: (id: string | number) => {
    return api.get(`/campaigns/${id}`);
  },

  // Standard creation handler
  create: (data: any) => {
    return api.post('/campaigns/', data);
  },

  update: (id: string | number, data: any) => {
    return api.put(`/campaigns/${id}`, data);
  },

  delete: (id: string | number) => {
    return api.delete(`/campaigns/${id}`);
  },

  getCampaignPosts: (campaignId: string | number) => {
    return api.get(`/campaigns/${campaignId}/posts`);
  },
};

export const accountService = {
  getAll: () => {
    return api.get('/social-accounts/');
  },

  getById: (
    id: string | number
  ) => {
    return api.get(`/social-accounts/${id}`);
  },

  delete: (id: string | number) => {
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

export default api;