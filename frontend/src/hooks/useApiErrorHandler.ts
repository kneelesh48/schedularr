import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "./useAuth";
import { AuthenticationRequiredError } from "../services/tokenStorage";

interface ApiError {
  response?: {
    status?: number;
  };
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as ApiError).response === "object" &&
    (error as ApiError).response !== null &&
    "status" in ((error as ApiError).response as { status?: unknown })
  );
}

function isAuthenticationError(error: unknown): boolean {
  if (error instanceof AuthenticationRequiredError) {
    return true;
  }

  if (isApiError(error)) {
    const status = error.response?.status;
    return status === 401 || status === 403;
  }

  return false;
}

export function useApiErrorHandler() {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const errorContext = context || "API";
      console.error(`[${errorContext}] Error:`, {
        error,
        context,
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (isAuthenticationError(error)) {
        console.warn(`[${errorContext}] Authentication error detected. Logging out.`);
        logoutUser();
        navigate("/login");
        return true;
      }

      return false;
    },
    [logoutUser, navigate]
  );

  const handleApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      options: {
        context?: string;
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (result: T) => void;
        onError?: (error: unknown) => void;
      } = {}
    ): Promise<T | null> => {
      const { context, successMessage, errorMessage, onSuccess, onError } = options;

      try {
        const result = await apiCall();

        if (successMessage) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        const wasAuthError = handleError(error, context);

        if (!wasAuthError) {
          const message = errorMessage || `An error occurred${context ? ` while ${context}` : ""}`;
          const description = error instanceof Error ? error.message : "Please try again later.";

          console.error(`[${context || "API"}] Non-auth error:`, {
            error,
            message,
            description,
            timestamp: new Date().toISOString(),
          });

          toast.error(message, {description});

          if (onError) {
            onError(error);
          }
        }

        return null;
      }
    },
    [handleError]
  );

  return { handleError, handleApiCall };
}
