"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Step = "password" | "email" | "signup";

export default function EnterPage() {
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  const router = useRouter();
  const supabase = createClient();

  // Check if user already has password verified on mount
  useEffect(() => {
    const checkPasswordCookie = async () => {
      try {
        // Try to verify password (will succeed if cookie exists)
        const response = await fetch("/api/auth/check-password-cookie");
        const data = await response.json();
        
        if (data.verified) {
          setStep("email");
        }
      } catch (error) {
        console.error("Error checking password cookie:", error);
      } finally {
        setInitializing(false);
      }
    };
    
    checkPasswordCookie();
  }, []);

  // Handle password verification from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPassword = params.get("password");

    if (urlPassword) {
      // Auto-verify password from URL
      verifyPassword(urlPassword, true);
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockedUntil) {
        setLockedUntil(null);
        setRemainingTime(0);
        setError(null);
      } else {
        setRemainingTime(Math.ceil((lockedUntil - now) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  const verifyPassword = async (pwd: string, fromUrl: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Password correct - clear URL if it came from there
        if (fromUrl) {
          window.history.replaceState({}, "", window.location.pathname);
        }
        
        // Transition to email step
        setPassword("");
        setStep("email");
      } else if (response.status === 429) {
        // Locked out
        setError(data.error);
        if (data.lockedUntil) {
          setLockedUntil(data.lockedUntil);
        }
      } else {
        setError(data.error);
        if (data.attemptsRemaining !== undefined) {
          setError(`${data.error} (${data.attemptsRemaining} attempts remaining)`);
        }
      }
    } catch (err) {
      console.error("Error during password verification:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil && Date.now() < lockedUntil) return;
    await verifyPassword(password);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.exists) {
          // Existing user - log them in
          await loginUser(data.email);
        } else {
          // New user - show signup form
          setStep("signup");
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (userEmail: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok && data.sessionToken) {
        // Exchange token for session
        const { error } = await supabase.auth.verifyOtp({
          token_hash: data.sessionToken,
          type: "magiclink",
        });

        if (error) {
          console.error("Session error:", error);
          setError("Failed to establish session. Please try again.");
          return;
        }

        // Get redirect destination
        const redirectResponse = await fetch("/api/auth/get-redirect");
        const redirectData = await redirectResponse.json();

        // Redirect to stored destination or home
        router.push(redirectData.destination || "/");
        router.refresh();
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate display name
    const trimmedName = displayName.trim();
    if (trimmedName.length === 0) {
      setError("Display name cannot be empty");
      setLoading(false);
      return;
    }

    if (trimmedName.length > 50) {
      setError("Display name must be 50 characters or less");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName: trimmedName }),
      });

      const data = await response.json();

      if (response.ok && data.sessionToken) {
        // Exchange token for session
        const { error } = await supabase.auth.verifyOtp({
          token_hash: data.sessionToken,
          type: "magiclink",
        });

        if (error) {
          console.error("Session error:", error);
          setError("Account created but failed to log in. Please try again.");
          return;
        }

        // Get redirect destination
        const redirectResponse = await fetch("/api/auth/get-redirect");
        const redirectData = await redirectResponse.json();

        // Redirect to stored destination or home
        router.push(redirectData.destination || "/");
        router.refresh();
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          {error && (
            <div className="p-3 rounded-md text-sm bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
              {lockedUntil && remainingTime > 0 && (
                <span className="block mt-1 font-semibold">
                  Retry in {remainingTime} seconds
                </span>
              )}
            </div>
          )}

          {/* Loading State */}
          {initializing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading...
              </p>
            </div>
          )}

          {/* Password Step */}
          {!initializing && step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                Enter Password
              </h2>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Site Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the site password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={loading || (lockedUntil !== null && Date.now() < lockedUntil)}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || !password || (lockedUntil !== null && Date.now() < lockedUntil)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>
          )}

          {/* Email Step */}
          {!initializing && step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                Enter Your Email
              </h2>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Checking..." : "Continue"}
              </button>
            </form>
          )}

          {/* Signup Step */}
          {!initializing && step === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                Create Your Account
              </h2>
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {displayName.length}/50 characters
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || !displayName.trim()}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
