import { AxiosError } from 'axios';

import type { ApiError, ValidationError } from '../types/api';

export function createApiError(error: AxiosError): ApiError {
  const status = error.response?.status;
  const data = error.response?.data as Record<string, unknown>;

  if (status === 400) {
    return {
      message: (data.error as string) || (data.message as string) || 'Bad request',
      code: 'BAD_REQUEST',
      status,
      details: data
    };
  }

  if (status === 422 && data?.field_errors) {
    return {
      message: (data.message as string) || 'Validation failed',
      code: 'VALIDATION_ERROR',
      status,
      details: data,
      field_errors: data.field_errors as Record<string, string[]>
    } as ValidationError;
  }

  if (status === 401) {
    return {
      message: 'Authentication required',
      code: 'AUTHENTICATION_ERROR',
      status,
      details: data
    };
  }

  if (status === 403) {
    return {
      message: 'Access forbidden',
      code: 'AUTHORIZATION_ERROR', 
      status,
      details: data
    };
  }

  if (status === 404) {
    return {
      message: 'Resource not found',
      code: 'NOT_FOUND',
      status,
      details: data
    };
  }

  if (status === 429) {
    return {
      message: 'Too many requests - please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      status,
      details: data
    };
  }

  if (status && status >= 500) {
    return {
      message: 'Server error - please try again later',
      code: 'SERVER_ERROR',
      status,
      details: data
    };
  }

  if (error.code === 'ECONNABORTED') {
    return {
      message: 'Request timeout - please check your connection',
      code: 'TIMEOUT_ERROR',
      details: { originalError: error.message }
    };
  }

  if (error.code === 'ERR_NETWORK') {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
      details: { originalError: error.message }
    };
  }

  return {
    message: (data?.message as string) || error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status,
    details: data || { originalError: error.message }
  };
}

export async function withErrorHandling<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof AxiosError) {
      throw createApiError(error);
    }
    throw error;
  }
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: ApiError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    return Boolean(
      error.code === 'NETWORK_ERROR' || 
      error.code === 'TIMEOUT_ERROR' ||
      (error.status && error.status >= 500)
    );
  }
};

export async function withRetry<T>(
  apiCall: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, retryDelay, retryCondition } = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withErrorHandling(apiCall);
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !retryCondition?.(error as ApiError)) {
        throw error;
      }
      
      await new Promise(resolve => 
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
    }
  }
  
  throw lastError;
}