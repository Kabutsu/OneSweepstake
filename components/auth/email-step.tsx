"use client";

import { FormEvent } from "react";
import { Input } from "./input";
import { Button } from "./button";

export interface EmailStepProps {
  email: string;
  setEmail: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  error?: string;
  magicLinkSent?: boolean;
  onResend?: () => void;
  onChangeEmail?: () => void;
  resendDisabledSeconds?: number;
}

export default function EmailStep({
  email,
  setEmail,
  onSubmit,
  loading,
  error,
  magicLinkSent = false,
  onResend,
  onChangeEmail,
  resendDisabledSeconds = 0,
}: EmailStepProps) {
  if (magicLinkSent) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl">✓</div>
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-wide">
            Check Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Click the link in the email to continue
          </p>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onChangeEmail}
            disabled={resendDisabledSeconds > 0}
            className="flex-1"
          >
            {resendDisabledSeconds > 0
              ? `Wait ${resendDisabledSeconds}s`
              : "Change Email"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onResend}
            disabled={resendDisabledSeconds > 0}
            className="flex-1"
          >
            {resendDisabledSeconds > 0
              ? `Wait ${resendDisabledSeconds}s`
              : "Resend Link"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white text-center tracking-wide">
        Enter Your Email
      </h2>
      <Input
        label="Email Address"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        disabled={loading}
        autoFocus
        error={error}
      />
      <Button type="submit" disabled={loading || !email} loading={loading}>
        {loading ? "Checking..." : "Continue"}
      </Button>
    </form>
  );
}
