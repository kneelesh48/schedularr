import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, CheckCircle, AlertCircle, Clock } from "lucide-react";

import { currentTheme } from "@/lib/themes";


interface RedditAccount {
  id: number;
  reddit_username: string;
  created_at: string;
}

interface RedditAccountsPanelProps {
  redditAccounts: RedditAccount[];
  isLoading?: boolean;
  onLinkAccount: () => void;
  onUnlinkAccount: (accountId: number) => void;
}


export function RedditAccountsPanel({
  redditAccounts,
  isLoading,
  onLinkAccount,
  onUnlinkAccount,
}: RedditAccountsPanelProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<RedditAccount | null>(null);

  const handleDeleteClick = (account: RedditAccount) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      onUnlinkAccount(accountToDelete.id);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reddit Accounts</span>
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Reddit Accounts</span>
              <Badge variant="secondary" className="text-xs">
                {redditAccounts.length} connected
              </Badge>
            </div>
            <Button
              onClick={onLinkAccount}
              size="sm"
              className={`${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Account
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {redditAccounts.length > 0 ? (
            <div className="space-y-3">
              {redditAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={account.reddit_username} />
                      <AvatarFallback
                        className={`${currentTheme.backgrounds.light} ${currentTheme.text.primary} font-medium`}
                      >
                        {account.reddit_username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          u/{account.reddit_username}
                        </span>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Linked {formatDate(account.created_at)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(account)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`mx-auto h-12 w-12 rounded-full ${currentTheme.backgrounds.light} flex items-center justify-center mb-4`}>
                <AlertCircle className={`h-6 w-6 ${currentTheme.text.primary}`} />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No Reddit accounts connected
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Reddit account to start scheduling posts
              </p>
              <Button
                onClick={onLinkAccount}
                className={`${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect Reddit Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Reddit Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the Reddit account "u/
              {accountToDelete?.reddit_username}"? This will stop all scheduled
              posts for this account and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Remove Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
