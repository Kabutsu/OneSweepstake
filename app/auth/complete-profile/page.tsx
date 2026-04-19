"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthContainer from "@/components/auth/auth-container";
import { Input } from "@/components/auth/input";
import { Button } from "@/components/auth/button";

export default function CompleteProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Get user email on mount
  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      } else {
        // Not authenticated, redirect to auth page
        router.push("/auth/enter");
      }
    }
    getUser();
  }, [router, supabase.auth]);

  // Debounced display name availability check
  useEffect(() => {
    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName.length === 0) {
      setNameAvailable(null);
      return;
    }

    if (trimmedName.length > 50) {
      setNameAvailable(false);
      setError("Display name must be 50 characters or less");
      return;
    }

    setError(undefined);
    setCheckingName(true);

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/auth/check-display-name?name=${encodeURIComponent(trimmedName)}`
        );
        const data = await response.json();
        setNameAvailable(data.available);
        if (!data.available) {
          setError(`The display name "${trimmedName}" is already taken`);
        }
      } catch (err) {
        console.error("Error checking display name:", err);
      } finally {
        setCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.type === "success") {
        // Redirect to destination
        router.push(data.redirectTo);
      } else {
        setError(data.error || "Failed to create profile");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error completing profile:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const isValid = displayName.trim().length > 0 && nameAvailable === true;

  return (
    <AuthContainer error={error} loading={loading}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-wide">
            Complete Your Profile
          </h2>
          {email && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {email}
            </p>
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
    </AuthContainer>
  );
}
