import { useState, useCallback, useRef, useEffect } from "react";

import * as api from "../services/api";
import type { RedditAccount } from "../types/api";
import { useApiErrorHandler } from "./useApiErrorHandler";
import { accountStorage } from "../services/accountStorage";


export function useAccountSelection() {
  const [redditAccounts, setRedditAccounts] = useState<RedditAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<RedditAccount | null>(null);

  const { handleApiCall } = useApiErrorHandler();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initializeAccountSelection = useCallback(
    (accounts: RedditAccount[]) => {
      setRedditAccounts(accounts);

      if (accounts.length > 0 && !selectedAccount) {
        const savedAccountId = accountStorage.getSelectedAccountId();
        let accountToSelect = null;

        if (savedAccountId) {
          accountToSelect = accounts.find((account) => account.id === savedAccountId);
        }

        if (!accountToSelect) {
          accountToSelect = accounts[0];
          accountStorage.setSelectedAccountId(accountToSelect.id);
        }

        setSelectedAccount(accountToSelect);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleAccountChange = useCallback(
    (accountId: string) => {
      const parsedId = parseInt(accountId, 10);
      if (isNaN(parsedId)) {
        console.warn('Invalid account ID provided:', accountId);
        return;
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the account change to prevent rapid API calls
      debounceTimeoutRef.current = setTimeout(() => {
        const account = redditAccounts.find((acc) => acc.id === parsedId);
        if (account) {
          setSelectedAccount(account);
          accountStorage.setSelectedAccountId(account.id);
        } else {
          console.warn('Account not found with ID:', parsedId);
        }
      }, 300); // 300ms debounce
    },
    [redditAccounts]
  );

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleLinkReddit = useCallback(async () => {
    return handleApiCall(() => api.getRedditLoginUrl(), {
      context: "linking Reddit account",
      errorMessage: "Failed to initiate Reddit linking",
      onSuccess: (redditLoginUrl) => {
        window.location.href = redditLoginUrl;
      },
    });
  }, [handleApiCall]);

  const handleUnlinkRedditAccount = useCallback(
    async (accountId: number) => {
      return handleApiCall(() => api.unlinkRedditAccount(accountId), {
        context: "unlinking Reddit account",
        successMessage: "Reddit account unlinked successfully",
        errorMessage: "Failed to unlink Reddit account",
        onSuccess: () => {
          const updatedAccounts = redditAccounts.filter((account) => account.id !== accountId);
          setRedditAccounts(updatedAccounts);

          if (selectedAccount?.id === accountId) {
            const newSelectedAccount = updatedAccounts.length > 0 ? updatedAccounts[0] : null;
            setSelectedAccount(newSelectedAccount);

            if (newSelectedAccount) {
              accountStorage.setSelectedAccountId(newSelectedAccount.id);
            } else {
              accountStorage.clearSelectedAccountId();
            }
          }
        },
      });
    },
    [handleApiCall, redditAccounts, selectedAccount]
  );

  const clearAccountSelection = useCallback(() => {
    accountStorage.clearSelectedAccountId();
    setSelectedAccount(null);
    setRedditAccounts([]);
  }, []);

  return {
    redditAccounts,
    selectedAccount,
    initializeAccountSelection,
    handleAccountChange,
    handleLinkReddit,
    handleUnlinkRedditAccount,
    clearAccountSelection,
  };
}
