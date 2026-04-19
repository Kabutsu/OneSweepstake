"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthContainer from "@/components/auth/auth-container";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        console.log("Callback page loaded");
        console.log("Search params:", Object.fromEntries(searchParams.entries()));
        console.log("Hash:", window.location.hash);

        // Check if there's a code in the URL (PKCE flow)
        const code = searchParams.get("code");
        if (code) {
          console.log("Found code, exchanging for session...");
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          console.log("Exchange result:", data, exchangeError);
          
          if (exchangeError) {
            console.error("Error exchanging code:", exchangeError);
            setError("Failed to authenticate. Please try again.");
            setTimeout(() => router.push("/auth/enter"), 2000);
            return;
          }
        }

        // Check for tokens in hash (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        
        if (accessToken && refreshToken) {
          console.log("Found tokens in hash, setting session...");
          // Manually set the session from hash tokens
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          console.log("Set session result:", data.session?.user?.email, setSessionError);
          
          if (setSessionError) {
            console.error("Error setting session from hash:", setSessionError);
          }
        }

        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 300));

        // Now check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Final session check:", session?.user?.email, sessionError);

        if (!session?.user) {
          console.error("No session found after processing");
          setError("Could not establish session. Please try again.");
          setTimeout(() => router.push("/auth/enter"), 2000);
          return;
        }

        // User is authenticated - check if they need profile completion
        const response = await fetch(
          `/api/auth/user-exists?email=${encodeURIComponent(session.user.email || "")}`
        );
        const data = await response.json();
        console.log("User exists:", data.exists);

        if (data.exists) {
          // Existing user - get redirect destination
          const redirectResponse = await fetch("/api/auth/get-redirect");
          const redirectData = await redirectResponse.json();
          console.log("Redirecting to:", redirectData.destination);
          router.push(redirectData.destination || "/");
        } else {
          // New user - go to profile completion
          console.log("New user, going to profile completion");
          router.push("/auth/complete-profile");
        }
      } catch (err) {
        console.error("Callback error:", err);
        setError("An error occurred. Please try again.");
        setTimeout(() => router.push("/auth/enter"), 2000);
      }
    }

    handleCallback();
  }, [router, searchParams, supabase.auth]);

  return (
    <AuthContainer loading={!error} error={error}>
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-wide">
          {error ? "Authentication Error" : "Verifying..."}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          {error || "Please wait while we log you in"}
        </p>
      </div>
    </AuthContainer>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthContainer loading={true}>
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-wide">
              Verifying...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Please wait while we log you in
            </p>
          </div>
        </AuthContainer>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
