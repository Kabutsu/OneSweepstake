"use client";

import { useState, cloneElement, isValidElement } from "react";
import ThemeToggle from "@/components/theme-toggle";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactElement;
  mobileTitle: string;
}

export default function DashboardLayout({ children, sidebar, mobileTitle }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Clone sidebar element and inject isOpen/onClose props
  const sidebarWithProps = isValidElement(sidebar)
    ? cloneElement(sidebar, {
        isOpen: isSidebarOpen,
        onClose: () => setIsSidebarOpen(false),
      } as any)
    : sidebar;

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950/30 dark:to-indigo-950/30 relative">
      {/* Radial glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 w-[800px] h-[800px] bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-pink-200/30 dark:bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Sidebar - Clone sidebar with open/close props injected */}
      {sidebarWithProps}

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Bar (Mobile) */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white truncate">
              {mobileTitle}
            </h2>
            <ThemeToggle />
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto p-6 lg:p-12">{children}</div>
      </main>
    </div>
  );
}
