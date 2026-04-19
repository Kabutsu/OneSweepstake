"use client";

import ThemeToggle from "@/components/theme-toggle";

interface MobileFallbackProps {
  tournamentName: string;
}

export default function MobileFallback({ tournamentName }: MobileFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950/30 dark:to-indigo-950/30 relative">
      {/* Radial glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 w-[800px] h-[800px] bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-pink-200/30 dark:bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple to-magenta">
            Tournament Seeding
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="max-w-md text-center">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-purple-500 shadow-xl">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-magenta rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* Message */}
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Tablet or Desktop Required
            </h2>
            <p className="text-gray-700 dark:text-gray-300 font-body mb-2">
              The seeding interface requires a larger screen for the best experience.
            </p>
            <p className="text-gray-600 dark:text-gray-400 font-body text-sm">
              Please access this page from a tablet (768px+) or desktop device.
            </p>

            {/* Tournament Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-500 font-body">
                Tournament: <span className="font-semibold text-gray-700 dark:text-gray-300">{tournamentName}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
