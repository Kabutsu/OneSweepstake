"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth-new";
import AuthContainer from "@/components/auth/auth-container";
import PasswordStep from "@/components/auth/password-step";
import EmailStep from "@/components/auth/email-step";
import SignupStep from "@/components/auth/signup-step";
import ThemeToggle from "@/components/theme-toggle";

export default function EnterPageNew() {
  const auth = useAuth();

  // Local state for form inputs
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Compute lockout state for password step
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.submitPassword(password);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.submitEmail(email);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.submitProfile(displayName);
  };

  return (
    <>
      {/* Theme toggle - positioned absolutely */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <AuthContainer error={auth.error} loading={auth.loading}>
        {auth.step === "password" && (
          <PasswordStep
            password={password}
            setPassword={setPassword}
            onSubmit={handlePasswordSubmit}
            loading={auth.loading}
            disabled={!!lockedUntil && Date.now() < lockedUntil}
            error={auth.validationError}
          />
        )}

        {auth.step === "email" && (
          <EmailStep
            email={email}
            setEmail={setEmail}
            onSubmit={handleEmailSubmit}
            loading={auth.loading}
            error={auth.validationError}
            magicLinkSent={auth.magicLinkSent}
            onResend={auth.handleResend}
            onChangeEmail={auth.handleChangeEmail}
            resendDisabledSeconds={auth.resendDisabledSeconds}
          />
        )}

        {auth.step === "signup" && (
          <SignupStep
            displayName={displayName}
            setDisplayName={setDisplayName}
            onSubmit={handleSignupSubmit}
            loading={auth.loading}
            error={auth.validationError}
            email={email}
          />
        )}
      </AuthContainer>
    </>
  );
}
