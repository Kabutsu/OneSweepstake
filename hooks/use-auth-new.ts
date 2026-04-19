"use client";

/**
 * Unified Auth Hook - Manages 3-step auth flow
 *
 * Step flow:
 * 1. Password verification
 * 2. Email submission (instant auth if password verified, magic link otherwise)
 * 3. Signup (profile completion for new users)
 *
 * Hides all complexity internally:
 * - State machine logic
 * - Progressive validation
 * - API request/response handling
 * - Loading states and error formatting
 * - Router navigation on success
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ===== Types =====

export type AuthStep = "password" | "email" | "signup";

export interface AuthConfig {
  onSuccess?: (destination: string) => void;
  initialStep?: AuthStep;
}

export interface UseAuthResult {
  // Current step state (read-only)
  step: AuthStep;

  // Single action per step
  submitPassword: (password: string) => Promise<void>;
  submitEmail: (email: string) => Promise<void>;
  submitProfile: (displayName: string) => Promise<void>;

  // Derived state (computed internally)
  loading: boolean;
  error: string | null;
  validationError?: string;

  // Magic link state (for email step)
  magicLinkSent: boolean;
  resendDisabledSeconds: number;
  handleResend: () => void;
  handleChangeEmail: () => void;
}

// ===== Validation Helpers =====

function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  return { isValid: true };
}

function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { isValid: false, error: "Email is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  return { isValid: true };
}

function validateDisplayName(displayName: string): { isValid: boolean; error?: string } {
  const trimmedName = displayName.trim();
  if (!trimmedName) {
    return { isValid: false, error: "Display name is required" };
  }
  if (trimmedName.length > 50) {
    return { isValid: false, error: "Display name must be 50 characters or less" };
  }
  return { isValid: true };
}

// ===== Hook =====

export function useAuth(config?: AuthConfig): UseAuthResult {
  const router = useRouter();
  const supabase = createClient();

  // Step state machine
  const [step, setStep] = useState<AuthStep>(config?.initialStep || "password");

  // Input values (for progressive validation)
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>();

  // Magic link state (for email step when password not verified)
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resendDisabledSeconds, setResendDisabledSeconds] = useState(0);

  // Lockout state (for password step)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Progressive validation - validate as user types after first submit
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendDisabledSeconds <= 0) return;

    const interval = setInterval(() => {
      setResendDisabledSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendDisabledSeconds]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockedUntil) {
        setLockedUntil(null);
        setError(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  // Progressive validation for password
  useEffect(() => {
    if (passwordTouched && currentPassword) {
      const result = validatePassword(currentPassword);
      setValidationError(result.isValid ? undefined : result.error);
    }
  }, [currentPassword, passwordTouched]);

  // Progressive validation for email
  useEffect(() => {
    if (emailTouched && currentEmail) {
      const result = validateEmail(currentEmail);
      setValidationError(result.isValid ? undefined : result.error);
    }
  }, [currentEmail, emailTouched]);

  // Clear errors when step changes
  useEffect(() => {
    setError(null);
    setValidationError(undefined);
  }, [step]);

  /**
   * Step 1: Submit password
   */
  const submitPassword = useCallback(
    async (password: string) => {
      setPasswordTouched(true);
      setCurrentPassword(password);

      // Check if locked out
      if (lockedUntil && Date.now() < lockedUntil) return;

      // Validate
      const validation = validatePassword(password);
      if (!validation.isValid) {
        setValidationError(validation.error);
        return;
      }

      setLoading(true);
      setError(null);
      setValidationError(undefined);

      try {
        const response = await fetch("/api/auth/verify-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Success - transition to email step
          setStep("email");
          setCurrentPassword("");
        } else if (response.status === 429) {
          // Rate limited
          setError(data.error);
          setValidationError(data.error);
          if (data.lockedUntil) {
            setLockedUntil(data.lockedUntil);
          }
        } else {
          // Failed
          const errorMsg =
            data.attemptsRemaining !== undefined
              ? `${data.error} (${data.attemptsRemaining} attempts remaining)`
              : data.error;
          setError(errorMsg);
          setValidationError(errorMsg);
        }
      } catch (err) {
        console.error("Error during password verification:", err);
        const errorMsg = "An error occurred. Please try again.";
        setError(errorMsg);
        setValidationError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [lockedUntil]
  );

  /**
   * Step 2: Submit email
   */
  const submitEmail = useCallback(
    async (email: string) => {
      setEmailTouched(true);
      setCurrentEmail(email);

      // Validate
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setValidationError(validation.error);
        return;
      }

      setLoading(true);
      setError(null);
      setValidationError(undefined);

      try {
        const response = await fetch("/api/auth/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.type === "instant-auth") {
            // Instant auth - establish session
            if (data.sessionToken) {
              const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: data.sessionToken,
                type: "magiclink",
              });

              if (verifyError) {
                console.error("Session establishment error:", verifyError);
                setError("Failed to establish session. Please try again.");
                setLoading(false);
                return;
              }
            }

            if (data.needsProfile) {
              // New user - transition to signup step
              setStep("signup");
              setLoading(false);
            } else {
              // Existing user - redirect
              const destination = data.redirectTo || "/";
              if (config?.onSuccess) {
                config.onSuccess(destination);
              } else {
                router.push(destination);
                router.refresh();
              }
            }
          } else if (data.type === "magic-link-sent") {
            // Magic link sent - show confirmation
            setMagicLinkSent(true);
            setResendDisabledSeconds(60);
            setLoading(false);
          }
        } else {
          setError(data.error || "An error occurred");
          setValidationError(data.error);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error submitting email:", err);
        const errorMsg = "An error occurred. Please try again.";
        setError(errorMsg);
        setValidationError(errorMsg);
        setLoading(false);
      }
    },
    [router, supabase, config]
  );

  /**
   * Step 3: Submit profile (display name)
   */
  const submitProfile = useCallback(
    async (displayName: string) => {
      // Validate
      const validation = validateDisplayName(displayName);
      if (!validation.isValid) {
        setValidationError(validation.error);
        return;
      }

      setLoading(true);
      setError(null);
      setValidationError(undefined);

      try {
        const response = await fetch("/api/auth/complete-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: displayName.trim() }),
        });

        const data = await response.json();

        if (response.ok && data.type === "success") {
          // Success - redirect
          const destination = data.redirectTo || "/";
          if (config?.onSuccess) {
            config.onSuccess(destination);
          } else {
            router.push(destination);
            router.refresh();
          }
        } else {
          setError(data.error || "An error occurred");
          setValidationError(data.error);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error submitting profile:", err);
        const errorMsg = "An error occurred. Please try again.";
        setError(errorMsg);
        setValidationError(errorMsg);
        setLoading(false);
      }
    },
    [router, config]
  );

  /**
   * Resend magic link
   */
  const handleResend = useCallback(() => {
    if (resendDisabledSeconds > 0) return;
    submitEmail(currentEmail);
  }, [resendDisabledSeconds, currentEmail, submitEmail]);

  /**
   * Change email (reset magic link state)
   */
  const handleChangeEmail = useCallback(() => {
    setMagicLinkSent(false);
    setCurrentEmail("");
    setEmailTouched(false);
  }, []);

  return {
    step,
    submitPassword,
    submitEmail,
    submitProfile,
    loading,
    error,
    validationError,
    magicLinkSent,
    resendDisabledSeconds,
    handleResend,
    handleChangeEmail,
  };
}
