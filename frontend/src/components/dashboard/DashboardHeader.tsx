import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, LogOut, User } from "lucide-react";

import { currentTheme, brandAssets } from "@/lib/themes";


interface RedditAccount {
  id: number;
  reddit_username: string;
  created_at: string;
}

interface DashboardHeaderProps {
  userName: string | null;
  redditAccounts: RedditAccount[];
  selectedAccount: RedditAccount | null;
  onAccountChange: (accountId: string) => void;
  onLogout: () => void;
}


export function DashboardHeader({
  userName,
  redditAccounts,
  selectedAccount,
  onAccountChange,
  onLogout,
}: DashboardHeaderProps) {
  const { BrandIcon, brandName } = brandAssets;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <BrandIcon className={`h-6 w-6 ${currentTheme.text.primary}`} />
              <span className="ml-2 text-lg font-bold">{brandName}</span>
            </div>
          </div>

          {/* Center - Account Switcher */}
          {redditAccounts.length > 0 && (
            <div className="flex items-center justify-center flex-1 mx-4 max-w-xs">
              <Select
                value={selectedAccount?.id.toString() || ""}
                onValueChange={onAccountChange}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {selectedAccount?.reddit_username
                          ?.charAt(0)
                          .toUpperCase() || "R"}
                      </AvatarFallback>
                    </Avatar>
                    <SelectValue placeholder="Select Reddit Account">
                      {selectedAccount ? (
                        <span className="truncate">
                          u/{selectedAccount.reddit_username}
                        </span>
                      ) : (
                        "Select Account"
                      )}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {redditAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {account.reddit_username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>u/{account.reddit_username}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={userName || ""} />
                    <AvatarFallback>
                      {userName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {redditAccounts.length} Reddit account
                      {redditAccounts.length !== 1 ? "s" : ""} connected
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

