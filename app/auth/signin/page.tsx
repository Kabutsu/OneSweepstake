"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();

  const handleMagicLinkSignIn = useCallback(
    async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Check your email for the sign-in link!" });
      setEmail("");
    }

    setLoading(false);
  },
  [email, supabase]
);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            OneSweepstake
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Multi-Tournament Football Sweepstakes Platform
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Sign In
            </h2>

            {message && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Magic Link Form */}
            <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sending..." : "Send Sign-In Link"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
