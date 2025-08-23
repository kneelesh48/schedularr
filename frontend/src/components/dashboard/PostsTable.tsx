import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Calendar,
} from "lucide-react";

import { currentTheme } from "@/lib/themes";
import type { ScheduledPost } from "@/types/api";


interface PostsTableProps {
  posts: ScheduledPost[];
  isLoading?: boolean;
  onDelete: (postId: number) => void;
  onCreatePost: () => void;
  onEditPost: (postId: number) => void;
}


export function PostsTable({
  posts,
  isLoading,
  onDelete,
  onCreatePost,
  onEditPost,
}: PostsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            <Clock className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="border-yellow-300 text-yellow-700">
            <Pause className="w-3 h-3 mr-1" />
            Paused
          </Badge>
        );
      case "queued":
        return (
          <Badge variant="outline" className={`border-orange-300 ${currentTheme.text.primary}`}>
            <Calendar className="w-3 h-3 mr-1" />
            Queued
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTimeString: string | null) => {
    console.log(dateTimeString);
    if (!dateTimeString) return "Not scheduled";

    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return "Past due";
      } else if (diffDays === 0) {
        return (
          "Today " +
          date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } else if (diffDays === 1) {
        return (
          "Tomorrow " +
          date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } else if (diffDays < 7) {
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 border rounded"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Scheduled Posts</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {posts.length} total
          </Badge>
          <Button
            onClick={onCreatePost}
            className={`${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`}
          >
            Create New Post
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {posts.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead className="hidden sm:table-cell">Account</TableHead>
                    <TableHead className="hidden md:table-cell">Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-1">
                          <div
                            className="font-medium line-clamp-1"
                            title={post.title}
                          >
                            {post.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            r/{post.subreddit}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm">
                          u/{post.reddit_account_username}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          {formatDateTime(post.next_run)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onEditPost(post.id)}
                              className="flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(post.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className={`mx-auto h-12 w-12 ${currentTheme.text.primary} opacity-50 mb-4`} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled posts</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first scheduled Reddit post</p>
            <Button
              onClick={onCreatePost}
              className={`${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`}
            >
              Create Your First Post
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
