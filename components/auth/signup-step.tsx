"use client";

import { useState, useEffect, FormEvent } from "react";
import { Input } from "./input";
import { Button } from "./button";

export interface SignupStepProps {
  displayName: string;
  setDisplayName: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  error?: string;
  email?: string;
}

export default function SignupStep({
  displayName,
  setDisplayName,
  onSubmit,
  loading,
  error,
  email,
}: SignupStepProps) {
  const [checkingName, setCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string>();

  // Debounced display name availability check
  useEffect(() => {
    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName.length === 0) {
      setNameAvailable(null);
      setAvailabilityError(undefined);
      return;
    }

    if (trimmedName.length > 50) {
      setNameAvailable(false);
      setAvailabilityError("Display name must be 50 characters or less");
      return;
    }

    setAvailabilityError(undefined);
    setCheckingName(true);

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/auth/check-display-name?name=${encodeURIComponent(trimmedName)}`
        );
        const data = await response.json();
        setNameAvailable(data.available);
        if (!data.available) {
          setAvailabilityError(`The display name "${trimmedName}" is already taken`);
        }
      } catch (err) {
        console.error("Error checking display name:", err);
      } finally {
        setCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [displayName]);

  const isValid = displayName.trim().length > 0 && nameAvailable === true;
  const displayError = error || availabilityError;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-wide">
          Complete Your Profile
        </h2>
        {email && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{email}</p>
        )}
      </div>

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
        error={displayError}
        helperText={
          checkingName
            ? "Checking availability..."
            : nameAvailable === true
            ? "✓ Available"
            : nameAvailable === false
            ? undefined // Error shown above
            : `${displayName.length}/50 characters`
        }
      />

      <Button
        type="submit"
        disabled={loading || !isValid || checkingName}
        loading={loading}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
