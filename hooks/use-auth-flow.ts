"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
} from "@/lib/validation";

export type Step = "password" | "email" | "signup";

export interface UseAuthFlowResult {
  // State
  step: Step;
  password: string;
  email: string;
  displayName: string;
  loading: boolean;
  error: string | null;
  lockedUntil: number | null;
  passwordError?: string;
  emailError?: string;
  displayNameError?: string;
  
  // Actions
  setPassword: (value: string) => void;
  setEmail: (value: string) => void;
  setDisplayName: (value: string) => void;
  handlePasswordSubmit: (e: React.FormEvent) => Promise<void>;
  handleEmailSubmit: (e: React.FormEvent) => Promise<void>;
  handleSignupSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Hook managing authentication flow state machine with optimistic UI
 */
export function useAuthFlow(initialStep: Step = "password"): UseAuthFlowResult {
  const [step, setStep] = useState<Step>(initialStep);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  
  // Progressive validation states
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [displayNameTouched, setDisplayNameTouched] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [displayNameError, setDisplayNameError] = useState<string>();

  const router = useRouter();
  const supabase = createClient();

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

  // Progressive validation - validate on change after first submit
  useEffect(() => {
    if (passwordTouched) {
      const result = validatePassword(password);
      setPasswordError(result.isValid ? undefined : result.error);
    }
  }, [password, passwordTouched]);

  useEffect(() => {
    if (emailTouched) {
      const result = validateEmail(email);
      setEmailError(result.isValid ? undefined : result.error);
    }
  }, [email, emailTouched]);

  useEffect(() => {
    if (displayNameTouched) {
      const result = validateDisplayName(displayName);
      setDisplayNameError(result.isValid ? undefined : result.error);
    }
  }, [displayName, displayNameTouched]);

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordTouched(true);

      if (lockedUntil && Date.now() < lockedUntil) return;

      const validation = validatePassword(password);
      if (!validation.isValid) {
        setPasswordError(validation.error);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/verify-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Optimistic transition to email step
          setPassword("");
          setPasswordError(undefined);
          setStep("email");
        } else if (response.status === 429) {
          setError(data.error);
          if (data.lockedUntil) {
            setLockedUntil(data.lockedUntil);
          }
        } else {
          const errorMsg = data.attemptsRemaining !== undefined
            ? `${data.error} (${data.attemptsRemaining} attempts remaining)`
            : data.error;
          setError(errorMsg);
          setPasswordError(errorMsg);
        }
      } catch (err) {
        console.error("Error during password verification:", err);
        const errorMsg = "An error occurred. Please try again.";
        setError(errorMsg);
        setPasswordError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [password, lockedUntil]
  );

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setEmailTouched(true);

      const validation = validateEmail(email);
      if (!validation.isValid) {
        setEmailError(validation.error);
        return;
      }

      setLoading(true);
      setError(null);
      
      // Store previous step for rollback
      const previousStep = step;

      try {
        const response = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.exists) {
            // Existing user - log them in (keep on same step while processing)
            await loginUser(data.email);
          } else {
            // New user - optimistically show signup form
            setStep("signup");
            setLoading(false);
          }
        } else {
          setError(data.error);
          setEmailError(data.error);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking email:", err);
        setError("An error occurred. Please try again.");
        setLoading(false);
      }
    },
    [email, step]
  );

  const loginUser = async (userEmail: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok && data.sessionToken) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: data.sessionToken,
          type: "magiclink",
        });

        if (error) {
          console.error("Session error:", error);
          setError("Failed to establish session. Please try again.");
          setLoading(false);
          return;
        }

        // Get redirect destination
        const redirectResponse = await fetch("/api/auth/get-redirect");
        const redirectData = await redirectResponse.json();

        // Success - redirect
        router.push(redirectData.destination || "/");
        router.refresh();
      } else {
        setError(data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSignupSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setDisplayNameTouched(true);

      const validation = validateDisplayName(displayName);
      if (!validation.isValid) {
        setDisplayNameError(validation.error);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, displayName: displayName.trim() }),
        });

        const data = await response.json();

        if (response.ok && data.sessionToken) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: data.sessionToken,
            type: "magiclink",
          });

          if (error) {
            console.error("Session error:", error);
            setError("Account created but failed to log in. Please try again.");
            setLoading(false);
            return;
          }

          // Get redirect destination
          const redirectResponse = await fetch("/api/auth/get-redirect");
          const redirectData = await redirectResponse.json();

          // Success - redirect
          router.push(redirectData.destination || "/");
          router.refresh();
        } else {
          // Rollback to email step
          setStep("email");
          setError(data.error);
          setLoading(false);
        }
      } catch (err) {
        console.error("Signup error:", err);
        // Rollback to email step
        setStep("email");
        setError("An error occurred. Please try again.");
        setLoading(false);
      }
    },
    [email, displayName, router, supabase]
  );

  return {
    step,
    password,
    email,
    displayName,
    loading,
    error,
    lockedUntil,
    passwordError,
    emailError,
    displayNameError,
    setPassword,
    setEmail,
    setDisplayName,
    handlePasswordSubmit,
    handleEmailSubmit,
    handleSignupSubmit,
  };
}
