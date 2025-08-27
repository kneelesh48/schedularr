import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import * as api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { currentTheme } from "@/lib/themes";
import type { ScheduledPost } from "../types/api";
import { useAccountSelection } from "../hooks/useAccountSelection";
import { useApiErrorHandler } from "../hooks/useApiErrorHandler";

import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { WelcomeSection } from "../components/dashboard/WelcomeSection";
import { OverviewCards } from "../components/dashboard/OverviewCards";
import { RedditAccountsPanel } from "../components/dashboard/RedditAccountsPanel";
import { PostsTable } from "../components/dashboard/PostsTable";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton";
import { PostFormModal } from "../components/dashboard/PostFormModal";


export default function DashboardPage() {
  type LoadingState = 'idle' | 'loading' | 'success' | 'error';

  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const { handleApiCall } = useApiErrorHandler();
  const {
    redditAccounts,
    selectedAccount,
    initializeAccountSelection,
    handleAccountChange,
    handleLinkReddit,
    handleUnlinkRedditAccount,
    clearAccountSelection
  } = useAccountSelection();


  const fetchData = async () => {
    setLoadingState('loading');
    setError(null);

    try {
      const dashboardData = await handleApiCall(() => api.getDashboardData(), {
        context: "fetching dashboard data",
        errorMessage: "Failed to load dashboard information"
      });

      if (!dashboardData) return;

      setUserName(dashboardData.user.username);

      // Fetch scheduled posts and Reddit accounts in parallel
      const [scheduledPostsResult, accountsResult] = await Promise.all([
        handleApiCall(
          () => api.getScheduledPosts(),
          { context: "fetching scheduled posts" }
        ),
        handleApiCall(
          () => api.getRedditAccounts(),
          { context: "fetching Reddit accounts" }
        )
      ]);

      if (scheduledPostsResult) {
        setPosts(scheduledPostsResult);
      }

      if (accountsResult) {
        initializeAccountSelection(accountsResult);
      }

      setLoadingState('success');
    } catch (err: unknown) {
      console.error("Unexpected error in fetchData:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setLoadingState('error');
      toast.error("Failed to load dashboard", {
        description: errorMessage,
      });
    }
  };

  const handleLogout = async () => {
    await handleApiCall(
      () => api.logout(),
      { context: "logging out" }
    );

    clearAccountSelection();
    logoutUser();
    navigate("/");
  };

  const handleDeletePost = async (postId: number) => {
    const originalPosts = posts;
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));

    const result = await handleApiCall(
      () => api.deleteScheduledPost(postId),
      {
        context: "deleting post",
        successMessage: "Post deleted successfully",
        errorMessage: "Failed to delete post"
      }
    );

    if (result === null) {
      setPosts(originalPosts);
    }
  };

  const handleCreatePost = () => {
    setEditingPostId(null);
    setIsPostModalOpen(true);
  };

  const handleEditPost = (postId: number) => {
    setEditingPostId(postId);
    setIsPostModalOpen(true);
  };

  const handlePostModalClose = () => {
    setEditingPostId(null);
    setIsPostModalOpen(false);
  };

  const handlePostModalSuccess = () => {
    fetchData();
  };


  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // No dependencies - only run on mount


  if (loadingState === 'loading' && !posts.length && !redditAccounts.length) {
    return <DashboardSkeleton />;
  }

  if (loadingState === 'error' && error) {
    return (
      <div className={`min-h-screen ${currentTheme.backgrounds.section} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">
            Failed to load dashboard
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 ${currentTheme.backgrounds.primary} text-white rounded ${currentTheme.backgrounds.primaryHover}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.backgrounds.section}`}>
      <DashboardHeader
        userName={userName}
        redditAccounts={redditAccounts}
        selectedAccount={selectedAccount}
        onAccountChange={handleAccountChange}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <WelcomeSection
            userName={userName}
            redditAccounts={redditAccounts}
            handleLinkReddit={handleLinkReddit}
          />

          {/* Overview Cards */}
          <OverviewCards
            posts={posts}
            redditAccountsCount={redditAccounts.length}
            isLoading={loadingState === 'loading' && posts.length === 0}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Reddit Accounts Panel - Takes 1/3 width on large screens */}
            <div className="lg:col-span-1">
              <RedditAccountsPanel
                redditAccounts={redditAccounts}
                isLoading={loadingState === 'loading' && redditAccounts.length === 0}
                onLinkAccount={handleLinkReddit}
                onUnlinkAccount={handleUnlinkRedditAccount}
              />
            </div>

            {/* Posts Table - Takes 2/3 width on large screens */}
            <div className="lg:col-span-2">
              <PostsTable
                posts={posts}
                isLoading={loadingState === 'loading' && posts.length === 0}
                onDelete={handleDeletePost}
                onCreatePost={handleCreatePost}
                onEditPost={handleEditPost}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Post Form Modal */}
      <PostFormModal
        isOpen={isPostModalOpen}
        onClose={handlePostModalClose}
        postId={editingPostId}
        onSuccess={handlePostModalSuccess}
      />
    </div>
  );
}
