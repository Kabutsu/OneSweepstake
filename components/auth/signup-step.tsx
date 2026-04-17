"use client";

import { FormEvent } from "react";
import { Input } from "./input";
import { Button } from "./button";

export interface SignupStepProps {
  displayName: string;
  setDisplayName: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  error?: string;
}

export default function SignupStep({
  displayName,
  setDisplayName,
  onSubmit,
  loading,
  error,
}: SignupStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white text-center tracking-wide">
        Create Your Account
      </h2>
      <Input
        label="Display Name"
        id="displayName"
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
        maxLength={50}
        disabled={loading}
        autoFocus
        error={error}
        helperText={`${displayName.length}/50 characters`}
      />
      <Button type="submit" disabled={loading || !displayName.trim()} loading={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
