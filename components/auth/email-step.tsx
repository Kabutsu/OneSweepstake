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
}

export default function EmailStep({
  email,
  setEmail,
  onSubmit,
  loading,
  error,
}: EmailStepProps) {
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
