"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthContainer from "@/components/auth/auth-container";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Check if there's a code in the URL (PKCE flow)
        const code = searchParams.get("code");
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
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
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (setSessionError) {
            console.error("Error setting session from hash:", setSessionError);
          }
        }

        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 300));

        // Now check if we have a session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          console.error("No session found after processing");
          setError("Could not establish session. Please try again.");
          setTimeout(() => router.push("/auth/enter"), 2000);
          return;
        }

        // Check if user exists in database
        const { data: dbUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (dbUser) {
          // Existing user - redirect to home
          router.push("/");
        } else {
          // New user - go to profile completion
          router.push("/auth/complete-profile");
        }
      } catch (err) {
        console.error("Callback error:", err);
        setError("An error occurred. Please try again.");
        setTimeout(() => router.push("/auth/enter"), 2000);
      }
    }

    handleCallback();
  }, [router, searchParams, supabase]);

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
    <Suspense fallback={
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
    }>
      <CallbackContent />
    </Suspense>
  );
}