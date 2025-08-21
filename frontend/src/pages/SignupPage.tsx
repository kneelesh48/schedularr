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
import * as api from "../services/api";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const { BrandIcon, brandName } = brandAssets;

  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors };

    switch (field) {
      case "username":
        if (value.length < 3) {
          errors.username = "Username must be at least 3 characters";
        } else {
          delete errors.username;
        }
        break;
      case "email":
        {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.email = "Please enter a valid email address";
          } else {
            delete errors.email;
          }
          break;
        }
      case "password":
        if (value.length < 8) {
          errors.password = "Password must be at least 8 characters";
        } else {
          delete errors.password;
        }
        if (passwordConfirm && value !== passwordConfirm) {
          errors.passwordConfirm = "Passwords do not match";
        } else if (passwordConfirm) {
          delete errors.passwordConfirm;
        }
        break;
      case "passwordConfirm":
        if (value !== password) {
          errors.passwordConfirm = "Passwords do not match";
        } else {
          delete errors.passwordConfirm;
        }
        break;
    }

    setFieldErrors(errors);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Basic validation
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.signup({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });

      toast.success("Account created successfully!", {
        description: "You can now log in with your credentials.",
      });

      navigate("/login");
    } catch (err: unknown) {
      console.error("Signup failed:", err);

      let errorMessage = "Registration failed. Please try again.";

      // Type guard for axios error with response
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {
          response?: { data?: unknown; status?: number };
        };
        if (axiosError.response && axiosError.response.data) {
          const responseData = axiosError.response.data;

          // Handle validation errors from backend
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
      toast.error("Registration failed", {description: errorMessage});
    } finally {
      setIsSubmitting(false);
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
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex items-center justify-center p-4 ${currentTheme.backgrounds.gradient}`}>
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join thousands of successful Redditors scheduling their way to the front page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-destructive text-sm text-center mb-4 p-3 bg-destructive/5 rounded border border-destructive/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (e.target.value)
                      validateField("username", e.target.value);
                  }}
                  onBlur={(e) => validateField("username", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Choose a username"
                  className={fieldErrors.username ? "border-destructive" : ""}
                />
                {fieldErrors.username && (
                  <p className="text-xs text-destructive mt-1">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value) validateField("email", e.target.value);
                  }}
                  onBlur={(e) => validateField("email", e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="your.email@example.com"
                  className={fieldErrors.email ? "border-destructive" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* First Name and Last Name in same row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value)
                        validateField("password", e.target.value);
                    }}
                    onBlur={(e) => validateField("password", e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Choose a strong password"
                    minLength={8}
                    className={`pr-10 ${fieldErrors.password ? "border-destructive" : ""
                      }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {fieldErrors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="passwordConfirm"
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      if (e.target.value)
                        validateField("passwordConfirm", e.target.value);
                    }}
                    onBlur={(e) =>
                      validateField("passwordConfirm", e.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    placeholder="Confirm your password"
                    minLength={8}
                    className={`pr-10 ${fieldErrors.passwordConfirm ? "border-destructive" : ""
                      }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {fieldErrors.passwordConfirm && (
                  <p className="text-xs text-destructive mt-1">
                    {fieldErrors.passwordConfirm}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${currentTheme.backgrounds.primary} ${currentTheme.backgrounds.primaryHover}`}
                size="lg"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className={`${currentTheme.text.primary} hover:underline font-medium`}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
