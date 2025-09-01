// ===== Authentication Types =====

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface SignupResponse {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface TokenVerifyRequest {
  token: string;
}

export interface UserResponse {
  authenticated: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

// ===== Reddit Account Types =====

export interface RedditAccount {
  id: number;
  user: string;
  reddit_username: string;
  reddit_account_status: 'active' | 'suspended' | 'shadow_banned' | 'banned';
  created_at: string;
  updated_at: string;
}

export interface RedditLoginUrlResponse {
  login_url: string;
}

export interface RedditUnlinkRequest {
  reddit_account_id: number;
}

// ===== Scheduled Post Types =====

export interface ScheduledPost {
  id: number;
  user: number;
  username: string;
  reddit_account: number;
  reddit_account_username: string;
  subreddit: string;
  title: string;
  selftext: string;
  cron_schedule: string | null;
  user_timezone: string;
  next_run: string | null;
  end_date: string | null;
  status: 'active' | 'paused' | 'completed' | 'error';
  last_submission_error: string | null;
  last_run_started: string | null;
  last_run_finished: string | null;
  created_at: string;
  updated_at: string;
}

export type ScheduledPostData = Omit<
  ScheduledPost,
  | 'id'
  | 'user'
  | 'username'
  | 'reddit_account_username'
  | 'next_run'
  | 'status'
  | 'last_submission_error'
  | 'last_run_started'
  | 'last_run_finished'
  | 'created_at'
  | 'updated_at'
> & {
  cron_schedule: string | null;
};

export type ScheduledPostUpdate = Partial<ScheduledPostData>;

// ===== Submitted Post Types =====

export interface SubmittedPost {
  id: number;
  scheduled_post: number;
  reddit_account: number;
  subreddit: string;
  title: string;
  selftext: string;
  reddit_post_id: string;
  reddit_url: string | null;
  submitted_at: string;
  updated_at: string;
  removed_at: string | null;
  removed_by: string | null;
}

// ===== Dashboard Types =====

export interface DashboardData {
  user: {
    username: string;
    is_authenticated: boolean;
  };
  reddit_accounts: {
    is_linked: boolean;
    accounts: RedditAccount[];
    count: number;
  };
  links: {
    reddit_login: string;
  };
}

// ===== API Error Types =====

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface ValidationError extends ApiError {
  field_errors: Record<string, string[]>;
}

// ===== API Response Wrapper =====

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ===== Request Configuration =====

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

// ===== Environment Configuration =====

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  enableLogging: boolean;
}
