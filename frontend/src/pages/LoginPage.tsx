import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { currentTheme, brandAssets } from "@/lib/themes";
import { useAuth } from "../hooks/useAuth";
import * as api from "../services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const { BrandIcon, brandName } = brandAssets;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.login({ username, password });
      loginUser();

      toast.success("Login successful!", {
        description: "Welcome back to RedditScheduler",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);

      let errorMessage = "Login failed. Please check your username and password.";

      // Type guard for axios error with response
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {response?: { data?: unknown; status?: number }};
        if (axiosError.response && axiosError.response.data) {
          const responseData = axiosError.response.data;

          if (typeof responseData === "object" && responseData !== null) {
            const messages = Object.entries(responseData)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(", ")}`;
                }
                return `${field}: ${messages}`;
              })
              .join("; ");
            if (messages) {
              errorMessage = messages;
            }
          } else if (typeof responseData === "string") {
            errorMessage = responseData;
          }
        }
      }

      setError(errorMessage);
      toast.error("Login failed", {description: errorMessage});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center justify-center">
            <BrandIcon className={`h-6 w-6 ${currentTheme.text.primary}`} />
            <span className="ml-2 text-lg font-bold">{brandName}</span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className={`${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`}
              asChild
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex items-center justify-center p-4 ${currentTheme.backgrounds.gradient}`}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Sign in to {brandName}
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-destructive text-sm text-center mb-4 p-3 bg-destructive/5 rounded border border-destructive/20">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter your username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className={`${currentTheme.text.primary} hover:underline`}
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                className={`w-full ${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`}
                disabled={isLoading}
                size="lg"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground border-t pt-4">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className={`${currentTheme.text.primary} hover:underline font-medium`}
              >
                Create one here
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
