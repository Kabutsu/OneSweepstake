"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { validateEmail } from "@/lib/validation";

export interface UseAuthResult {
  // State
  email: string;
  loading: boolean;
  error: string | null;
  magicLinkSent: boolean;
  resendDisabledSeconds: number;

  // Actions
  setEmail: (value: string) => void;
  handleEmailSubmit: (e: React.FormEvent) => Promise<void>;
  handleResend: () => void;
  handleChangeEmail: () => void;
}

/**
 * Simplified auth hook for email-based authentication
 * Supports both instant auth (password-verified) and magic link
 */
export function useAuth(): UseAuthResult {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resendDisabledSeconds, setResendDisabledSeconds] = useState(0);

  const router = useRouter();

  // Countdown timer for resend button
  useEffect(() => {
    if (resendDisabledSeconds <= 0) return;

    const interval = setInterval(() => {
      setResendDisabledSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendDisabledSeconds]);

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateEmail(email);
      if (!validation.isValid) {
        setError(validation.error || "Invalid email");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.type === "instant-auth") {
            // Instant authentication (password-verified)
            // Establish session using the token
            if (data.sessionToken) {
              const supabase = (await import("@/lib/supabase/client")).createClient();
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
              // New user - navigate to profile completion
              router.push("/auth/complete-profile");
            } else {
              // Existing user - redirect to destination
              router.push(data.redirectTo || "/");
            }
          } else if (data.type === "magic-link-sent") {
            // Magic link sent - show confirmation
            setMagicLinkSent(true);
            setResendDisabledSeconds(60); // 1 minute cooldown
            setLoading(false);
          }
        } else {
          setError(data.error || "An error occurred");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error submitting email:", err);
        setError("An error occurred. Please try again.");
        setLoading(false);
      }
    },
    [email, router]
  );

  const handleResend = useCallback(() => {
    if (resendDisabledSeconds > 0) return;
    setMagicLinkSent(false);
    // Will trigger re-submission when user clicks continue again
  }, [resendDisabledSeconds]);

  const handleChangeEmail = useCallback(() => {
    if (resendDisabledSeconds > 0) return;
    setMagicLinkSent(false);
    setEmail("");
  }, [resendDisabledSeconds]);

  return {
    email,
    loading,
    error,
    magicLinkSent,
    resendDisabledSeconds,
    setEmail,
    handleEmailSubmit,
    handleResend,
    handleChangeEmail,
  };
}
