"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthContainer from "@/components/auth/auth-container";
import { Input } from "@/components/auth/input";
import { Button } from "@/components/auth/button";
import { trpc } from "@/lib/trpc/client";

export default function CompleteProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();
  const supabase = createClient();

  // tRPC mutations
  const completeProfile = trpc.auth.completeProfile.useMutation({
    onSuccess: (data) => {
      router.push(data.redirectTo);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError("Display name is required");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Display name must be 50 characters or less");
      return;
    }

    completeProfile.mutate({ displayName: trimmedName });
  };

  const isValid = displayName.trim().length > 0 && displayName.trim().length <= 50;
  const loading = completeProfile.isPending;

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
          error={error}
          helperText={`${displayName.length}/50 characters`}
        />

        <Button
          type="submit"
          disabled={loading || !isValid}
          loading={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </AuthContainer>
  );
}
