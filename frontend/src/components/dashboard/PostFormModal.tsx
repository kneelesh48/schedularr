import React, { useState, useEffect } from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  FileText,
  Settings,
  Info,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { currentTheme } from "@/lib/themes";

import {
  createScheduledPost,
  updateScheduledPost,
  getScheduledPost,
  getDashboardData,
} from "@/services/api";
import type { ScheduledPostData, RedditAccount } from "@/types/api";


interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: number | null;
  onSuccess: () => void;
}

const formatDateTimeLocal = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - timezoneOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  } catch (e) {
    console.error("Error formatting date:", e);
    return "";
  }
};


export function PostFormModal({
  isOpen,
  onClose,
  postId,
  onSuccess,
}: PostFormModalProps) {
  const [subreddit, setSubreddit] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cronSchedule, setCronSchedule] = useState("");
  const [endDate, setEndDate] = useState<string | null>(null);
  const [redditAccount, setRedditAccount] = useState<number | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<RedditAccount[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = postId !== null && postId !== undefined;
  const modalTitle = isEdit ? "Edit Scheduled Post" : "Create New Post";
  const submitButtonText = isEdit ? "Update Post" : "Schedule Post";

  useEffect(() => {
    if (!isOpen) {
      setSubreddit("");
      setTitle("");
      setBody("");
      setCronSchedule("");
      setEndDate(null);
      setRedditAccount(null);
      setError(null);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const dashboardData = await getDashboardData();
        setAvailableAccounts(dashboardData.reddit_accounts.accounts || []);

        if (isEdit && postId) {
          const post = await getScheduledPost(postId);
          setSubreddit(post.subreddit);
          setTitle(post.title);
          setBody(post.selftext);
          setCronSchedule(post.cron_schedule ?? "");
          setEndDate(formatDateTimeLocal(post.end_date));
          setRedditAccount(post.reddit_account);
        } else {
          const accounts = dashboardData.reddit_accounts.accounts || [];
          if (accounts.length > 0) {
            setRedditAccount(accounts[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load data. Please try again.");
        toast.error("Failed to load data", {
          description: "Could not load Reddit accounts or post data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isEdit, postId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!subreddit || !title || !body || !redditAccount) {
      setError("Subreddit, title, body, and Reddit account are required.");
      setIsSubmitting(false);
      return;
    }

    const postData: ScheduledPostData = {
      subreddit: subreddit.trim(),
      title: title.trim(),
      selftext: body.trim(),
      reddit_account: redditAccount,
      cron_schedule: cronSchedule.trim() === "" ? null : cronSchedule.trim(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
    };

    try {
      if (isEdit && postId) {
        await updateScheduledPost(postId, postData);
        toast.success("Post updated successfully", {
          description: "Your scheduled post has been updated.",
        });
      } else {
        await createScheduledPost(postData);
        toast.success("Post scheduled successfully", {
          description: "Your post has been added to the schedule.",
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to save post:", err);

      let errorMessage = `Failed to ${isEdit ? "update" : "schedule"} post. Please try again.`;

      if (typeof err === "object" && err !== null && "response" in err) {
        type ErrorResponseData = Record<string, string | string[]> | string;
        const axiosError = err as {
          response?: { data?: ErrorResponseData; status?: number };
        };
        if (axiosError.response && axiosError.response.data) {
          const responseData = axiosError.response.data;
          if (typeof responseData === "object" && responseData !== null) {
            const messages = Object.entries(responseData)
              .map(
                ([field, messages]) =>
                  `${field}: ${
                    Array.isArray(messages) ? messages.join(", ") : messages
                  }`
              )
              .join("; ");
            if (messages) {
              errorMessage = `Validation failed: ${messages}`;
            }
          } else if (typeof responseData === "string") {
            errorMessage = responseData;
          }
        }
      }

      setError(errorMessage);
      toast.error(`Failed to ${isEdit ? "update" : "schedule"} post`, {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAccountName = availableAccounts?.find?.((acc) => acc.id === redditAccount)?.reddit_username;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isEdit ? (
              <FileText className="h-5 w-5" />
            ) : (
              <Calendar className="h-5 w-5" />
            )}
            <span>{modalTitle}</span>
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your scheduled Reddit post details below."
              : "Fill in the details to schedule a new Reddit post."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Basic Post Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <MessageCircle className={`h-4 w-4 ${currentTheme.text.primary}`} />
                <h3 className="text-sm font-medium">Post Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="redditAccount">Reddit Account</Label>
                  {availableAccounts.length > 0 ? (
                    <Select
                      value={redditAccount?.toString() || ""}
                      onValueChange={(value) => setRedditAccount(Number(value))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select account">
                            {selectedAccountName && `u/${selectedAccountName}`}
                          </SelectValue>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {availableAccounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.id.toString()}
                          >
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>u/{account.reddit_username}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>No Reddit accounts connected</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subreddit">Subreddit</Label>
                  <div className="relative">
                    <Input
                      id="subreddit"
                      placeholder="e.g., learnprogramming"
                      value={subreddit}
                      onChange={(e) => setSubreddit(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                      r/
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Body Content</Label>
                <Textarea
                  id="body"
                  placeholder="Write your post content here... (Markdown supported)"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Markdown formatting is supported
                </p>
              </div>
            </div>

            <Separator />

            {/* Scheduling Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Settings className={`h-4 w-4 ${currentTheme.text.primary}`} />
                <h3 className="text-sm font-medium">Scheduling Options</h3>
                <Badge variant="outline" className="text-xs">
                  Optional
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cronSchedule">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Cron Schedule</span>
                    </div>
                  </Label>
                  <Input
                    id="cronSchedule"
                    placeholder="e.g., 0 9 * * 1 (Every Monday at 9 AM)"
                    value={cronSchedule}
                    onChange={(e) => setCronSchedule(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank for one-time post. Use standard cron format
                    (minute hour day month weekday).
                  </p>
                </div>

                {cronSchedule && (
                  <div className="space-y-2">
                    <Label htmlFor="endDate">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>End Date</span>
                      </div>
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={endDate || ""}
                      onChange={(e) => setEndDate(e.target.value || null)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      When should the recurring posts stop? (Optional)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || availableAccounts.length === 0}
                className={`${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Scheduling..."}
                  </>
                ) : (
                  <>
                    {isEdit ? (
                      <FileText className="mr-2 h-4 w-4" />
                    ) : (
                      <Calendar className="mr-2 h-4 w-4" />
                    )}
                    {submitButtonText}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
