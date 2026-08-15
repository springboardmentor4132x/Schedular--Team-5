import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authentication token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
    }

    return Promise.reject(error);
  }
);

// ==================== POSTS ====================

export const postService = {
  getAll: () => api.get("/posts"),

  getById: (id: string) =>
    api.get(`/posts/${id}`),

  create: (data: any) =>
    api.post("/posts", data),

  update: (id: string, data: any) =>
    api.put(`/posts/${id}`, data),

  delete: (id: string) =>
    api.delete(`/posts/${id}`),

  schedule: (id: string, date: string) =>
    api.post(`/posts/${id}/schedule`, {
      date,
    }),
};

// ==================== CAMPAIGNS ====================

export const campaignService = {
  getAll: () =>
    api.get("/campaigns"),

  getById: (id: string) =>
    api.get(`/campaigns/${id}`),

  create: (data: any) =>
    api.post("/campaigns", data),

  update: (id: string, data: any) =>
    api.put(`/campaigns/${id}`, data),

  delete: (id: string) =>
    api.delete(`/campaigns/${id}`),
};

// ==================== SOCIAL ACCOUNTS ====================

export const accountService = {
  // GET /social-accounts/
  getAll: () =>
    api.get("/social-accounts/"),

  // POST /social-accounts/
  connect: (platform: string) =>
    api.post("/social-accounts/", {
      platform,
      account_name: platform,
    }),

  // DELETE /social-accounts/{account_id}
  disconnect: (id: string) =>
    api.delete(`/social-accounts/${id}`),
};

// ==================== ANALYTICS ====================

export const analyticsService = {
  getOverview: () =>
    api.get("/analytics/overview"),

  getPlatform: (platform: string) =>
    api.get(`/analytics/platform/${platform}`),

  getCampaign: (id: string) =>
    api.get(`/analytics/campaign/${id}`),
};

// ==================== AUTH ====================

export const authService = {
  login: (
    email: string,
    password: string
  ) =>
    api.post("/auth/login", {
      email,
      password,
    }),

  register: (data: any) =>
    api.post("/auth/register", data),

  logout: () =>
    api.post("/auth/logout"),

  me: () =>
    api.get("/auth/me"),
};

export default api;