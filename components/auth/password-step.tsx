"use client";

import { FormEvent } from "react";
import { Input } from "./input";
import { Button } from "./button";

export interface PasswordStepProps {
  password: string;
  setPassword: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  disabled: boolean;
  error?: string;
}

export default function PasswordStep({
  password,
  setPassword,
  onSubmit,
  loading,
  disabled,
  error,
}: PasswordStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white text-center tracking-wide">
        Enter Password
      </h2>
      <Input
        label="Site Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter the site password"
        disabled={loading || disabled}
        autoFocus
        error={error}
      />
      <Button type="submit" disabled={loading || !password || disabled} loading={loading}>
        {loading ? "Verifying..." : "Continue"}
      </Button>
    </form>
  );
}
