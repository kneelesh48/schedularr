const SELECTED_ACCOUNT_KEY = "selectedRedditAccountId";

export interface AccountStorage {
  getSelectedAccountId(): number | null;
  setSelectedAccountId(accountId: number): void;
  clearSelectedAccountId(): void;
  hasSelectedAccount(): boolean;
}

class LocalStorageAccountStorage implements AccountStorage {
  getSelectedAccountId(): number | null {
    try {
      const saved = localStorage.getItem(SELECTED_ACCOUNT_KEY);
      return saved ? parseInt(saved, 10) : null;
    } catch (error) {
      console.warn("Failed to read selected account from localStorage:", error);
      return null;
    }
  }

  setSelectedAccountId(accountId: number): void {
    try {
      localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId.toString());
    } catch (error) {
      console.warn("Failed to save selected account to localStorage:", error);
    }
  }

  clearSelectedAccountId(): void {
    try {
      localStorage.removeItem(SELECTED_ACCOUNT_KEY);
    } catch (error) {
      console.warn(
        "Failed to clear selected account from localStorage:",
        error
      );
    }
  }

  hasSelectedAccount(): boolean {
    return this.getSelectedAccountId() !== null;
  }
}

export const accountStorage: AccountStorage = new LocalStorageAccountStorage();

export class AccountSelectionError extends Error {
  constructor(message = "Failed to manage account selection") {
    super(message);
    this.name = "AccountSelectionError";
  }
}
