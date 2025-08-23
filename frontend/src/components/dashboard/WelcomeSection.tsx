import { currentTheme } from "@/lib/themes";
import type { RedditAccount } from "@/types/api";

interface WelcomeSectionProps {
  userName: string | null;
  redditAccounts: RedditAccount[];
  handleLinkReddit: () => void;
}

export function WelcomeSection({
  userName,
  redditAccounts,
  handleLinkReddit,
}: WelcomeSectionProps) {
  return (
    <div
      className={`rounded-lg border ${currentTheme.accents.border} ${currentTheme.backgrounds.light} p-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your scheduled Reddit posts and monitor their performance.
          </p>
        </div>
        {redditAccounts.length === 0 && (
          <div className="hidden md:block">
            <button
              onClick={handleLinkReddit}
              className={`px-4 py-2 ${currentTheme.backgrounds.primary} text-white rounded-md ${currentTheme.backgrounds.primaryHover} font-medium`}
            >
              Connect Reddit Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
