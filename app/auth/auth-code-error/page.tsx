"use client";

import { useSearchParams } from "next/navigation";

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const description = searchParams.get("description");

  const getErrorMessage = () => {
    if (error === "otp_expired") {
      return "The magic link has expired. Please request a new one.";
    }
    if (description) {
      return decodeURIComponent(description);
    }
    return "There was a problem signing you in. Please try again.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {getErrorMessage()}
        </p>
        {error && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 font-mono">
            Error code: {error}
          </p>
        )}
        <a
          href="/auth/signin"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Return to Sign In
        </a>
      </div>
    </div>
  );
}
