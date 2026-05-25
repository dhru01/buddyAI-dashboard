"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const REMEMBER_EMAIL_KEY = "buddyai_staff_remember_email";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthMode = "signin" | "signup";

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  resetEmail?: string;
};

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  return undefined;
}

function validatePassword(value: string, forSignup = false): string | undefined {
  if (!value) return "Password is required.";
  if (forSignup && value.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return undefined;
}

function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return undefined;
}

function mapSignInError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Invalid email or password. Please check your details and try again.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (normalized.includes("too many requests")) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }
  return "Unable to sign in right now. Please try again.";
}

function mapResetError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("too many requests")) {
    return "Too many reset attempts. Please wait a moment and try again.";
  }
  return "Unable to send a reset email right now. Please try again.";
}

function mapSignUpError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (normalized.includes("password")) {
    return "Choose a stronger password with at least 8 characters.";
  }
  if (normalized.includes("too many requests")) {
    return "Too many sign-up attempts. Please wait a moment and try again.";
  }
  return "Unable to create your account right now. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Ignore storage access errors in restricted browser contexts.
    }
  }, []);

  const openResetDialog = () => {
    setResetEmail(email.trim());
    setResetSent(false);
    setFieldErrors((prev) => ({ ...prev, resetEmail: undefined }));
    setResetOpen(true);
  };

  const closeResetDialog = () => {
    if (resetLoading) return;
    setResetOpen(false);
    setResetSent(false);
    setResetEmail("");
    setFieldErrors((prev) => ({ ...prev, resetEmail: undefined }));
  };

  const switchMode = (nextMode: AuthMode) => {
    if (loading) return;
    setMode(nextMode);
    setFormError(null);
    setSignupSuccess(null);
    setConfirmPassword("");
    setFieldErrors({});
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const isSignup = mode === "signup";
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, isSignup);
    const confirmPasswordError = isSignup
      ? validateConfirmPassword(password, confirmPassword)
      : undefined;
    const nextErrors: FieldErrors = {};

    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    if (confirmPasswordError) nextErrors.confirmPassword = confirmPasswordError;

    setFieldErrors(nextErrors);
    setFormError(null);
    setSignupSuccess(null);

    if (emailError || passwordError || confirmPasswordError) return;

    setLoading(true);

    try {
      const supabase = createClient();

      if (isSignup) {
        const emailRedirectTo =
          typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo }
        });

        if (error) {
          setFormError(mapSignUpError(error.message));
          return;
        }

        if (data.session) {
          toast.success("Account created");
          router.push("/dashboard");
          router.refresh();
          return;
        }

        setSignupSuccess(
          `Account created for ${email.trim()}. Check your inbox to confirm your email, then sign in.`
        );
        toast.success("Check your email to confirm your account");
        setPassword("");
        setConfirmPassword("");
        setMode("signin");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setFormError(mapSignInError(error.message));
        return;
      }

      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {
        // Non-blocking if storage is unavailable.
      }

      toast.success("Welcome back");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError(
        isSignup
          ? "Unable to create your account right now. Please try again."
          : "Unable to sign in right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (resetLoading) return;

    const resetEmailError = validateEmail(resetEmail);
    setFieldErrors((prev) => ({ ...prev, resetEmail: resetEmailError }));

    if (resetEmailError) return;

    setResetLoading(true);

    try {
      const supabase = createClient();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo
      });

      if (error) {
        toast.error(mapResetError(error.message));
        return;
      }

      setResetSent(true);
      toast.success("Reset email sent");
    } catch {
      toast.error("Unable to send a reset email right now. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md rounded-2xl border-border bg-card p-8 shadow-soft">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 overflow-hidden rounded-2xl shadow-sm">
            <Image
              src="/buddyai-logo.png"
              alt="BuddyAI"
              width={88}
              height={88}
              priority
              className="h-[88px] w-[88px] object-cover"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            BuddyAI Staff
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-foreground/65">
            {mode === "signin"
              ? "Access is restricted to authorised BuddyAI staff."
              : "Register with your staff email to access the BuddyAI admin portal."}
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {signupSuccess ? (
            <div
              role="status"
              className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground"
            >
              {signupSuccess}
            </div>
          ) : null}

          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {formError}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
                setFormError(null);
              }}
              placeholder="staff@buddylearning.org"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              disabled={loading}
              className={cn(fieldErrors.email && "border-red-300 focus:border-red-400")}
            />
            {fieldErrors.email ? (
              <p id="email-error" className="text-sm text-red-600">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    password: undefined,
                    confirmPassword: undefined
                  }));
                  setFormError(null);
                  setSignupSuccess(null);
                }}
                placeholder={mode === "signup" ? "Create a password (min. 8 characters)" : "Enter your password"}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                disabled={loading}
                className={cn(
                  "pr-11",
                  fieldErrors.password && "border-red-300 focus:border-red-400"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-foreground/50 transition hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p id="password-error" className="text-sm text-red-600">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          {mode === "signup" ? (
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                Confirm password
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    setFormError(null);
                    setSignupSuccess(null);
                  }}
                  placeholder="Re-enter your password"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword ? "confirm-password-error" : undefined
                  }
                  disabled={loading}
                  className={cn(
                    "pr-11",
                    fieldErrors.confirmPassword && "border-red-300 focus:border-red-400"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-foreground/50 transition hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword ? (
                <p id="confirm-password-error" className="text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              ) : null}
            </div>
          ) : null}

          {mode === "signin" ? (
            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-border text-primary accent-primary"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={openResetDialog}
                disabled={loading}
                className="text-sm font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>
          ) : null}

          <Button
            type="submit"
            variant="secondary"
            className="h-11 w-full text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "signup" ? "Creating account..." : "Signing in..."}
              </>
            ) : mode === "signup" ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-sm text-foreground/70">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  disabled={loading}
                  className="font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline disabled:opacity-50"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  disabled={loading}
                  className="font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline disabled:opacity-50"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </Card>

      <p className="mt-6 text-sm font-medium text-foreground/55">BuddyAI Admin Portal</p>

      <Dialog open={resetOpen} onOpenChange={(open) => (open ? setResetOpen(true) : closeResetDialog())}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your staff email and we&apos;ll send you a secure link to choose a new password.
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
                If an account exists for{" "}
                <span className="font-medium">{resetEmail.trim()}</span>, you will receive reset
                instructions shortly. Please check your inbox and spam folder.
              </div>
              <Button type="button" className="w-full" onClick={closeResetDialog}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onResetSubmit} noValidate>
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <Input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={resetEmail}
                  onChange={(event) => {
                    setResetEmail(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, resetEmail: undefined }));
                  }}
                  placeholder="staff@buddylearning.org"
                  aria-invalid={Boolean(fieldErrors.resetEmail)}
                  aria-describedby={fieldErrors.resetEmail ? "reset-email-error" : undefined}
                  disabled={resetLoading}
                  className={cn(fieldErrors.resetEmail && "border-red-300 focus:border-red-400")}
                />
                {fieldErrors.resetEmail ? (
                  <p id="reset-email-error" className="text-sm text-red-600">
                    {fieldErrors.resetEmail}
                  </p>
                ) : null}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeResetDialog}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="secondary" className="flex-1" disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
