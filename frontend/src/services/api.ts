import axios from 'axios';

import { withErrorHandling, withRetry } from './errorHandling';
import { tokenStorage, AuthenticationRequiredError } from './tokenStorage';
import type {
  LoginCredentials,
  LoginResponse,
  SignupData,
  SignupResponse,
  UserResponse,
  RedditAccount,
  ScheduledPost,
  ScheduledPostData,
  ScheduledPostUpdate,
  SubmittedPost,
  DashboardData
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshTokenValue = tokenStorage.getRefreshToken();
        if (refreshTokenValue) {
          const response = await axios.post(`${API_BASE_URL}/api/users/auth/token/refresh/`, {
            refresh: refreshTokenValue
          });

          const { access } = response.data;
          tokenStorage.setAccessToken(access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch {
        tokenStorage.clearTokens();
        throw new AuthenticationRequiredError('Session expired - please log in again');
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return withErrorHandling(async () => {
    const response = await apiClient.post('/api/users/auth/token/', credentials);
    const { access, refresh } = response.data;
    if (access && refresh) {
      tokenStorage.setTokens(access, refresh);
    }
    return response.data;
  });
};

export const signup = async (userData: SignupData): Promise<SignupResponse> => {
  return withErrorHandling(async () => {
    const response = await apiClient.post('/api/users/auth/register/', userData);
    return response.data;
  });
};

export const logout = async (): Promise<void> => {
  tokenStorage.clearTokens();
};

/**
 * Refreshes the access token using the stored refresh token
 * @returns Promise resolving to token refresh response
 * @throws Error if no refresh token is available
 */
export const refreshToken = async (): Promise<{ access: string }> => {
  const refresh = tokenStorage.getRefreshToken();
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post('/api/users/auth/token/refresh/', { refresh });
  const { access } = response.data;

  if (access) {
    tokenStorage.setAccessToken(access);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  }

  return response.data;
};

/**
 * Verifies the current user's authentication status
 * @returns Promise resolving to user response
 * @throws Error if no access token is found
 */
export const getUser = async (): Promise<UserResponse> => {
  return withErrorHandling(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      throw new AuthenticationRequiredError('No access token found');
    }

    await apiClient.post('/api/users/auth/token/verify/', { token });

    try {
      const dashboardData = await apiClient.get('/api/reddit/dashboard/');
      return {
        authenticated: true,
        user: dashboardData.data.user
      };
    } catch {
      return { authenticated: true };
    }
  });
};

export const getDashboardData = async (): Promise<DashboardData> => {
  return withRetry(async () => {
    const response = await apiClient.get('/api/reddit/dashboard/');
    return response.data;
  });
};

export const getScheduledPosts = async (): Promise<ScheduledPost[]> => {
  return withRetry(async () => {
    const response = await apiClient.get('/api/reddit/posts/');
    return response.data;
  });
};

export const getScheduledPost = async (id: number): Promise<ScheduledPost> => {
  const response = await apiClient.get(`/api/reddit/posts/${id}/`);
  return response.data;
};

export const createScheduledPost = async (data: ScheduledPostData): Promise<ScheduledPost> => {
  return withErrorHandling(async () => {
    const response = await apiClient.post('/api/reddit/posts/', data);
    return response.data;
  });
};

export const updateScheduledPost = async (id: number, data: ScheduledPostUpdate): Promise<ScheduledPost> => {
  const response = await apiClient.patch(`/api/reddit/posts/${id}/`, data);
  return response.data;
};

export const deleteScheduledPost = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/reddit/posts/${id}/`);
};

export const getRedditLoginUrl = async (): Promise<string> => {
  const response = await apiClient.get('/api/reddit/user/reddit-login-url/');
  return response.data.login_url;
};

export const getRedditAccounts = async (): Promise<RedditAccount[]> => {
  const response = await apiClient.get('/api/reddit/user/accounts/');
  return response.data;
};

export const getSubmittedPosts = async (scheduledPostId?: number): Promise<SubmittedPost[]> => {
  const url = scheduledPostId 
    ? `/api/reddit/posts/${scheduledPostId}/submissions/`
    : '/api/reddit/submissions/';
  const response = await apiClient.get(url);
  return response.data;
};

export const getSubmittedPost = async (id: number): Promise<SubmittedPost> => {
  const response = await apiClient.get(`/api/reddit/submissions/${id}/`);
  return response.data;
};

export const unlinkRedditAccount = async (accountId: number): Promise<void> => {
  await apiClient.delete('/api/reddit/user/unlink/', {
    data: { reddit_account_id: accountId }
  });
};

export const convertTextToCron = async (scheduleText: string): Promise<{ cron_schedule: string; schedule_text: string }> => {
  return withErrorHandling(async () => {
    const response = await apiClient.post('/api/reddit/convert-cron/', {
      schedule_text: scheduleText
    });
    return response.data;
  });
};
