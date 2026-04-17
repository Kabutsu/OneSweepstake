"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import AuthContainer from "@/components/auth/auth-container";
import PasswordStep from "@/components/auth/password-step";
import EmailStep from "@/components/auth/email-step";
import SignupStep from "@/components/auth/signup-step";
import ThemeToggle from "@/components/theme-toggle";
import { useAuthFlow } from "@/hooks/use-auth-flow";
import { useStepTransition } from "@/hooks/use-step-transition";

export interface EnterPageClientProps {
  initialStep: "password" | "email";
}

export default function EnterPageClient({ initialStep }: EnterPageClientProps) {
  const searchParams = useSearchParams();
  const {
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
  } = useAuthFlow(initialStep);

  const { containerRef, transitionTo } = useStepTransition();
  const previousStepRef = useRef(step);

  // Handle URL password parameter
  useEffect(() => {
    const urlPassword = searchParams.get("password");
    if (urlPassword && step === "password") {
      setPassword(urlPassword);
      // Clear URL parameter after reading
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, step, setPassword]);

  const getTransitionDirection = useCallback((
    from: typeof step,
    to: typeof step
  ): "forward" | "backward" => {
    const stepOrder = ["password", "email", "signup"];
    const fromIndex = stepOrder.indexOf(from);
    const toIndex = stepOrder.indexOf(to);
    return toIndex > fromIndex ? "forward" : "backward";
  }, [step]);

  // Animate step transitions
  useEffect(() => {
    if (step === previousStepRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const direction = getTransitionDirection(previousStepRef.current, step);

    previousStepRef.current = step;
  }, [step, containerRef, transitionTo, getTransitionDirection]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  return (
    <>
      {/* Theme toggle - positioned absolutely */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <AuthContainer error={error} loading={loading}>
        <div ref={containerRef}>
          {step === "password" && (
            <PasswordStep
              password={password}
              setPassword={setPassword}
              onSubmit={handlePasswordSubmit}
              loading={loading}
              disabled={isLocked}
              error={passwordError}
            />
          )}
          {step === "email" && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              onSubmit={handleEmailSubmit}
              loading={loading}
              error={emailError}
            />
          )}
          {step === "signup" && (
            <SignupStep
              displayName={displayName}
              setDisplayName={setDisplayName}
              onSubmit={handleSignupSubmit}
              loading={loading}
              error={displayNameError}
            />
          )}
        </div>
      </AuthContainer>
    </>
  );
}
