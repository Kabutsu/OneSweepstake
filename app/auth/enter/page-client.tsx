"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthContainer from "@/components/auth/auth-container";
import EmailStep from "@/components/auth/email-step";
import ThemeToggle from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

export default function EnterPageClient() {
  const router = useRouter();
  const supabase = createClient();
  
  const {
    step,
    email,
    loading,
    error,
    magicLinkSent,
    resendDisabledSeconds,
    setEmail,
    handleEmailSubmit,
    handleResend,
    handleChangeEmail,
  } = useAuth();

  // Redirect to complete-profile when step changes to signup
  useEffect(() => {
    if (step === "signup") {
      router.push("/auth/complete-profile");
    }
  }, [step, router]);

  // Handle case where user lands here with auth tokens in hash (from magic link)
  useEffect(() => {
    async function checkAuthFromHash() {
      // Check if there's a hash fragment (magic link tokens)
      if (!window.location.hash) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // User is authenticated - check if they have a profile in DB
          const { data: dbUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (dbUser) {
            // Existing user - redirect to home (getRedirect happens server-side)
            router.push("/");
          } else {
            // New user - go to profile completion
            router.push("/auth/complete-profile");
          }
        }
      } catch (err) {
        console.error("Error handling auth from hash:", err);
      }
    }

    checkAuthFromHash();
  }, [router, supabase]);

  return (
    <>
      {/* Theme toggle - positioned absolutely */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <AuthContainer error={error} loading={loading}>
        <EmailStep
          email={email}
          setEmail={setEmail}
          onSubmit={handleEmailSubmit}
          loading={loading}
          error={error || undefined}
          magicLinkSent={magicLinkSent}
          onResend={handleResend}
          onChangeEmail={handleChangeEmail}
          resendDisabledSeconds={resendDisabledSeconds}
        />
      </AuthContainer>
    </>
  );
}
