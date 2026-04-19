"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";

export type Step = "email" | "signup";

export interface UseAuthResult {
  step: Step;
  email: string;
  displayName: string;
  loading: boolean;
  error: string | null;
  magicLinkSent: boolean;
  resendDisabledSeconds: number;
  emailError?: string;
  displayNameError?: string;
  setEmail: (value: string) => void;
  setDisplayName: (value: string) => void;
  handleEmailSubmit: (e?: React.FormEvent) => Promise<void>;
  handleSignupSubmit: (e: React.FormEvent) => Promise<void>;
  handleResend: () => void;
  handleChangeEmail: () => void;
}

export function useAuth(initialStep: Step = "email"): UseAuthResult {
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resendDisabledSeconds, setResendDisabledSeconds] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);
  const [displayNameTouched, setDisplayNameTouched] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [displayNameError, setDisplayNameError] = useState<string>();

  const router = useRouter();
  const supabase = createClient();

  const authenticateEmail = trpc.auth.authenticateEmail.useMutation();
  const completeProfile = trpc.auth.completeProfile.useMutation();

  useEffect(() => {
    if (resendDisabledSeconds <= 0) return;
    const interval = setInterval(() => {
      setResendDisabledSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendDisabledSeconds]);

  useEffect(() => {
    if (emailTouched) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        setEmailError("Email is required");
      } else if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError(undefined);
      }
    }
  }, [email, emailTouched]);

  useEffect(() => {
    if (displayNameTouched) {
      if (!displayName.trim()) {
        setDisplayNameError("Display name is required");
      } else if (displayName.trim().length > 50) {
        setDisplayNameError("Display name must be 50 characters or less");
      } else {
        setDisplayNameError(undefined);
      }
    }
  }, [displayName, displayNameTouched]);

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setEmailTouched(true);

    if (emailError || !email) {
      return;
    }

    setError(null);

    try {
      const result = await authenticateEmail.mutateAsync({ email });

      if (result.type === "instant-auth") {
        if (result.sessionToken) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: result.sessionToken,
            type: "magiclink",
          });

          if (verifyError) {
            console.error("Session establishment error:", verifyError);
            setError("Failed to establish session. Please try again.");
            return;
          }
        }

        if (result.needsProfile) {
          setStep("signup");
        } else {
          router.push(result.redirectTo || "/");
        }
      } else if (result.type === "magic-link-sent") {
        setMagicLinkSent(true);
        setResendDisabledSeconds(60);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisplayNameTouched(true);

    if (displayNameError || !displayName.trim()) {
      return;
    }

    setError(null);

    try {
      const result = await completeProfile.mutateAsync({ displayName });
      router.push(result.redirectTo);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  const handleResend = () => {
    if (resendDisabledSeconds > 0) return;
    handleEmailSubmit();
  };

  const handleChangeEmail = () => {
    setMagicLinkSent(false);
    setEmail("");
    setEmailTouched(false);
  };

  const loading = authenticateEmail.isPending || completeProfile.isPending;

  return {
    step,
    email,
    displayName,
    loading,
    error,
    magicLinkSent,
    resendDisabledSeconds,
    emailError,
    displayNameError,
    setEmail,
    setDisplayName,
    handleEmailSubmit,
    handleSignupSubmit,
    handleResend,
    handleChangeEmail,
  };
}
