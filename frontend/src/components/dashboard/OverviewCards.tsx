import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { currentTheme } from "@/lib/themes";
import type { ScheduledPost } from "@/types/api";

interface OverviewCardsProps {
  posts: ScheduledPost[];
  redditAccountsCount: number;
  isLoading?: boolean;
}

export function OverviewCards({
  posts,
  redditAccountsCount,
  isLoading,
}: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate metrics
  const totalPosts = posts.length;
  const activePosts = posts.filter((post) => post.status === "active").length;
  const errorPosts = posts.filter((post) => post.status === "error").length;

  // Calculate posts this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const postsThisMonth = posts.filter((post) => {
    const postDate = new Date(post.created_at);
    return (
      postDate.getMonth() === currentMonth &&
      postDate.getFullYear() === currentYear
    );
  }).length;

  // Calculate success rate
  const publishedPosts = posts.filter(
    (post) => post.status === "completed"
  ).length;
  const successRate =
    totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0;

  const cards = [
    {
      title: "Total Posts",
      icon: Calendar,
      value: totalPosts.toString(),
      description: "All scheduled posts",
      trend: postsThisMonth > 0 ? "up" : null,
      trendValue:
        postsThisMonth > 0
          ? `+${postsThisMonth} this month`
          : "No posts this month",
    },
    {
      title: "Active Posts",
      icon: Clock,
      value: activePosts.toString(),
      description: "Currently scheduled",
      badge:
        activePosts > 0 ? { text: "Live", variant: "default" as const } : null,
      trendValue: errorPosts > 0 ? `${errorPosts} failed` : "Running smoothly",
    },
    {
      title: "Reddit Accounts",
      icon: Users,
      value: redditAccountsCount.toString(),
      description: "Connected accounts",
      badge:
        redditAccountsCount > 0
          ? { text: "Connected", variant: "secondary" as const }
          : { text: "Not Connected", variant: "destructive" as const },
      trendValue:
        redditAccountsCount > 1
          ? "Multi-account setup"
          : redditAccountsCount === 1
          ? "Single account"
          : "No accounts",
    },
    {
      title: "Success Rate",
      icon: CheckCircle,
      value: `${successRate}%`,
      description: "Posts published successfully",
      trend: successRate >= 90 ? "up" : successRate >= 70 ? null : "down",
      trendValue:
        publishedPosts > 0
          ? `${publishedPosts} published`
          : "No posts published yet",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {card.badge && (
                  <Badge variant={card.badge.variant} className="text-xs">
                    {card.badge.text}
                  </Badge>
                )}
                <Icon className={`h-4 w-4 ${currentTheme.text.primary}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </div>
                {card.trend && (
                  <div className="flex items-center">
                    {card.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {card.trendValue}
                </p>
              </div>
            </CardContent>
            {/* Subtle accent border */}
            <div
              className={`absolute bottom-0 left-0 h-1 w-full ${currentTheme.backgrounds.primary} opacity-20`}
            ></div>
          </Card>
        );
      })}
    </div>
  );
}
