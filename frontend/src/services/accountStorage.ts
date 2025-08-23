const SELECTED_ACCOUNT_KEY = "selectedRedditAccountId";

export interface AccountStorage {
  getSelectedAccountId(): number | null;
  setSelectedAccountId(accountId: number): void;
  clearSelectedAccountId(): void;
  hasSelectedAccount(): boolean;
}

class LocalStorageAccountStorage implements AccountStorage {
  getSelectedAccountId(): number | null {
    const saved = localStorage.getItem(SELECTED_ACCOUNT_KEY);
    return saved ? parseInt(saved, 10) : null;
  }

  setSelectedAccountId(accountId: number): void {
    localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId.toString());
  }

  clearSelectedAccountId(): void {
    localStorage.removeItem(SELECTED_ACCOUNT_KEY);
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
