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
type SignupStep = "details" | "otp";

type FieldErrors = {
  firstName?: string;
  surname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
  newPassword?: string;
  newConfirmPassword?: string;
  resetEmail?: string;
};

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  return undefined;
}

function validateName(value: string, label: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
  return undefined;
}

function validateOtp(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Verification code is required.";
  if (!/^\d{6}$/.test(trimmed)) return "Enter the 6-digit code from your email.";
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

function mapVerifyOtpError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("expired")) {
    return "This verification code has expired. Request a new one.";
  }
  if (normalized.includes("invalid") || normalized.includes("token")) {
    return "Invalid verification code. Please check the code and try again.";
  }
  if (normalized.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return "Unable to verify your email right now. Please try again.";
}

function mapUpdatePasswordError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("same password")) {
    return "Choose a different password from your current one.";
  }
  if (normalized.includes("password")) {
    return "Choose a stronger password with at least 8 characters.";
  }
  return "Unable to update your password right now. Please try again.";
}

function getPasswordResetRedirectUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const nextPath = encodeURIComponent("/login?recovery=1");
  return `${window.location.origin}/auth/callback?next=${nextPath}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [signupStep, setSignupStep] = useState<SignupStep>("details");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryChecking, setRecoveryChecking] = useState(true);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false);
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false);

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

  useEffect(() => {
    const supabase = createClient();

    const enableRecoveryMode = () => {
      setRecoveryMode(true);
      setRecoveryError(null);
    };

    const verifyRecoverySession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session) {
        enableRecoveryMode();
        return true;
      }

      return false;
    };

    const initializeRecoveryFlow = async () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      if (params.get("error") === "auth_callback_error") {
        setRecoveryError("This reset link is invalid or has expired. Request a new one.");
        setRecoveryChecking(false);
        return;
      }

      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setRecoveryError("This reset link is invalid or has expired. Request a new one.");
          setRecoveryChecking(false);
          return;
        }

        window.history.replaceState(null, "", "/login?recovery=1");
        enableRecoveryMode();
        setRecoveryChecking(false);
        return;
      }

      if (hashParams.get("type") === "recovery") {
        enableRecoveryMode();
        window.history.replaceState(null, "", "/login?recovery=1");
        setRecoveryChecking(false);
        return;
      }

      if (params.get("recovery") === "1") {
        const hasSession = await verifyRecoverySession();
        if (!hasSession) {
          setRecoveryError("This reset link is invalid or has expired. Request a new one.");
        }
        setRecoveryChecking(false);
        return;
      }

      setRecoveryChecking(false);
    };

    void initializeRecoveryFlow();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        enableRecoveryMode();
        setRecoveryChecking(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
    if (loading || resendOtpLoading) return;
    setMode(nextMode);
    setSignupStep("details");
    setFormError(null);
    setFirstName("");
    setSurname("");
    setConfirmPassword("");
    setOtpCode("");
    setFieldErrors({});
  };

  const backToSignupDetails = () => {
    if (loading || resendOtpLoading) return;
    setSignupStep("details");
    setOtpCode("");
    setFormError(null);
    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
  };

  const onSignupDetailsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const firstNameError = validateName(firstName, "Name");
    const surnameError = validateName(surname, "Surname");
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, true);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    const nextErrors: FieldErrors = {};

    if (firstNameError) nextErrors.firstName = firstNameError;
    if (surnameError) nextErrors.surname = surnameError;
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    if (confirmPasswordError) nextErrors.confirmPassword = confirmPasswordError;

    setFieldErrors(nextErrors);
    setFormError(null);

    if (firstNameError || surnameError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const trimmedFirstName = firstName.trim();
      const trimmedSurname = surname.trim();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: trimmedFirstName,
            last_name: trimmedSurname,
            full_name: `${trimmedFirstName} ${trimmedSurname}`
          }
        }
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

      setSignupStep("otp");
      setOtpCode("");
      toast.success("Verification code sent to your email");
    } catch {
      setFormError("Unable to create your account right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const otpError = validateOtp(otpCode);
    setFieldErrors((prev) => ({ ...prev, otp: otpError }));
    setFormError(null);

    if (otpError) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: "signup"
      });

      if (error) {
        setFormError(mapVerifyOtpError(error.message));
        return;
      }

      if (!data.session) {
        setFormError("Unable to complete registration right now. Please try again.");
        return;
      }

      toast.success("Account verified");
      setSignupStep("details");
      setOtpCode("");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Unable to verify your email right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = async () => {
    if (loading || resendOtpLoading) return;

    setResendOtpLoading(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim()
      });

      if (error) {
        toast.error(mapVerifyOtpError(error.message));
        return;
      }

      toast.success("Verification code sent");
    } catch {
      toast.error("Unable to resend the verification code right now.");
    } finally {
      setResendOtpLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    if (mode === "signup") {
      if (signupStep === "otp") {
        await onVerifyOtpSubmit(event);
      } else {
        await onSignupDetailsSubmit(event);
      }
      return;
    }

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const nextErrors: FieldErrors = {};

    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;

    setFieldErrors(nextErrors);
    setFormError(null);

    if (emailError || passwordError) return;

    setLoading(true);

    try {
      const supabase = createClient();

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
      setFormError("Unable to sign in right now. Please try again.");
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
      const redirectTo = getPasswordResetRedirectUrl();

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

  const onUpdatePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (updatePasswordLoading) return;

    const newPasswordError = validatePassword(newPassword, true);
    const newConfirmPasswordError = validateConfirmPassword(newPassword, newConfirmPassword);
    const nextErrors: FieldErrors = {};

    if (newPasswordError) nextErrors.newPassword = newPasswordError;
    if (newConfirmPasswordError) nextErrors.newConfirmPassword = newConfirmPasswordError;

    setFieldErrors(nextErrors);
    setRecoveryError(null);

    if (newPasswordError || newConfirmPasswordError) return;

    setUpdatePasswordLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setRecoveryError(mapUpdatePasswordError(error.message));
        return;
      }

      toast.success("Password updated");
      setRecoveryMode(false);
      setNewPassword("");
      setNewConfirmPassword("");
      window.history.replaceState(null, "", "/login");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setRecoveryError("Unable to update your password right now. Please try again.");
    } finally {
      setUpdatePasswordLoading(false);
    }
  };

  const recoveryForm = (
    <form className="space-y-5" onSubmit={onUpdatePasswordSubmit} noValidate>
      {recoveryError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {recoveryError}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium text-foreground">
          New password
        </label>
        <div className="relative">
          <Input
            id="new-password"
            name="new-password"
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setFieldErrors((prev) => ({
                ...prev,
                newPassword: undefined,
                newConfirmPassword: undefined
              }));
              setRecoveryError(null);
            }}
            placeholder="Enter a new password (min. 8 characters)"
            aria-invalid={Boolean(fieldErrors.newPassword)}
            aria-describedby={fieldErrors.newPassword ? "new-password-error" : undefined}
            disabled={updatePasswordLoading}
            className={cn(
              "pr-11",
              fieldErrors.newPassword && "border-red-300 focus:border-red-400"
            )}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-foreground/50 transition hover:text-foreground"
            aria-label={showNewPassword ? "Hide password" : "Show password"}
            disabled={updatePasswordLoading}
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.newPassword ? (
          <p id="new-password-error" className="text-sm text-red-600">
            {fieldErrors.newPassword}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="new-confirm-password" className="text-sm font-medium text-foreground">
          Confirm new password
        </label>
        <div className="relative">
          <Input
            id="new-confirm-password"
            name="new-confirm-password"
            type={showNewConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            value={newConfirmPassword}
            onChange={(event) => {
              setNewConfirmPassword(event.target.value);
              setFieldErrors((prev) => ({ ...prev, newConfirmPassword: undefined }));
              setRecoveryError(null);
            }}
            placeholder="Re-enter your new password"
            aria-invalid={Boolean(fieldErrors.newConfirmPassword)}
            aria-describedby={
              fieldErrors.newConfirmPassword ? "new-confirm-password-error" : undefined
            }
            disabled={updatePasswordLoading}
            className={cn(
              "pr-11",
              fieldErrors.newConfirmPassword && "border-red-300 focus:border-red-400"
            )}
          />
          <button
            type="button"
            onClick={() => setShowNewConfirmPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-foreground/50 transition hover:text-foreground"
            aria-label={showNewConfirmPassword ? "Hide password" : "Show password"}
            disabled={updatePasswordLoading}
          >
            {showNewConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {fieldErrors.newConfirmPassword ? (
          <p id="new-confirm-password-error" className="text-sm text-red-600">
            {fieldErrors.newConfirmPassword}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="secondary"
        className="h-11 w-full text-base font-semibold"
        disabled={updatePasswordLoading}
      >
        {updatePasswordLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );

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
            {recoveryMode
              ? "Set a new password"
              : mode === "signup" && signupStep === "otp"
                ? "Verify your email"
                : mode === "signin"
                  ? "Sign in to your account"
                  : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-foreground/65">
            {recoveryMode
              ? "Choose a new password for your BuddyAI staff account."
              : mode === "signup" && signupStep === "otp"
                ? `Enter the 6-digit code sent to ${email.trim() || "your email"}.`
                : mode === "signin"
                  ? "Access is restricted to authorised BuddyAI staff."
                  : "Enter your details to register for the BuddyAI admin portal."}
          </p>
        </div>

        {recoveryChecking ? (
          <div className="flex items-center justify-center py-8 text-sm text-foreground/65">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying reset link...
          </div>
        ) : recoveryMode ? (
          recoveryForm
        ) : (
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {formError}
            </div>
          ) : null}

          {mode === "signup" && signupStep === "otp" ? (
            <>
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium text-foreground">
                  Verification code
                </label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otpCode}
                  onChange={(event) => {
                    setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                    setFormError(null);
                  }}
                  placeholder="Enter 6-digit code"
                  aria-invalid={Boolean(fieldErrors.otp)}
                  aria-describedby={fieldErrors.otp ? "otp-error" : undefined}
                  disabled={loading || resendOtpLoading}
                  className={cn(
                    "text-center text-lg tracking-[0.35em]",
                    fieldErrors.otp && "border-red-300 focus:border-red-400"
                  )}
                />
                {fieldErrors.otp ? (
                  <p id="otp-error" className="text-sm text-red-600">
                    {fieldErrors.otp}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                variant="secondary"
                className="h-11 w-full text-base font-semibold"
                disabled={loading || resendOtpLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify and create account"
                )}
              </Button>

              <div className="flex flex-col gap-3 text-center text-sm">
                <button
                  type="button"
                  onClick={() => void onResendOtp()}
                  disabled={loading || resendOtpLoading}
                  className="font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline disabled:opacity-50"
                >
                  {resendOtpLoading ? "Sending code..." : "Resend verification code"}
                </button>
                <button
                  type="button"
                  onClick={backToSignupDetails}
                  disabled={loading || resendOtpLoading}
                  className="text-foreground/70 underline-offset-4 transition hover:text-foreground hover:underline disabled:opacity-50"
                >
                  Back to registration details
                </button>
              </div>
            </>
          ) : (
            <>
          {mode === "signup" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="first-name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                    setFormError(null);
                  }}
                  placeholder="First name"
                  aria-invalid={Boolean(fieldErrors.firstName)}
                  aria-describedby={fieldErrors.firstName ? "first-name-error" : undefined}
                  disabled={loading}
                  className={cn(fieldErrors.firstName && "border-red-300 focus:border-red-400")}
                />
                {fieldErrors.firstName ? (
                  <p id="first-name-error" className="text-sm text-red-600">
                    {fieldErrors.firstName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="surname" className="text-sm font-medium text-foreground">
                  Surname
                </label>
                <Input
                  id="surname"
                  name="surname"
                  type="text"
                  autoComplete="family-name"
                  value={surname}
                  onChange={(event) => {
                    setSurname(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, surname: undefined }));
                    setFormError(null);
                  }}
                  placeholder="Surname"
                  aria-invalid={Boolean(fieldErrors.surname)}
                  aria-describedby={fieldErrors.surname ? "surname-error" : undefined}
                  disabled={loading}
                  className={cn(fieldErrors.surname && "border-red-300 focus:border-red-400")}
                />
                {fieldErrors.surname ? (
                  <p id="surname-error" className="text-sm text-red-600">
                    {fieldErrors.surname}
                  </p>
                ) : null}
              </div>
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
                {mode === "signup" ? "Sending code..." : "Signing in..."}
              </>
            ) : mode === "signup" ? (
              "Send verification code"
            ) : (
              "Sign in"
            )}
          </Button>

          {mode === "signin" || signupStep === "details" ? (
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
          ) : null}
            </>
          )}
        </form>
        )}
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
