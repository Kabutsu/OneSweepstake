"use client";

import ThemeToggle from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";
import SweepstakeListItem from "./sweepstake-list-item";
import type { User, Sweepstake } from "@/types/dashboard";

export interface SidebarProps {
  user: User;
  sweepstakes: Sweepstake[];
  selectedSweepstake: Sweepstake;
  onSelectSweepstake: (sweepstake: Sweepstake) => void;
  isOpen: boolean;
  onClose: () => void;
  onNewSweepstake: () => void;
}

export default function Sidebar({
  user,
  sweepstakes,
  selectedSweepstake,
  onSelectSweepstake,
  isOpen,
  onClose,
  onNewSweepstake,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple to-magenta flex items-center justify-center shadow-md">
                <span className="text-white font-display text-lg font-bold">OS</span>
              </div>
              <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                OneSweepstake
              </h1>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.displayName || "User"} className="w-10 h-10 rounded-full" /> : user.displayName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.displayName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {sweepstakes.length} sweepstakes
              </div>
            </div>
          </div>
        </div>

        {/* Sweepstakes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-2">
            Your Sweepstakes
          </div>
          {sweepstakes.map((sweep) => (
            <SweepstakeListItem
              key={sweep.id}
              sweepstake={sweep}
              isSelected={selectedSweepstake.id === sweep.id}
              onClick={() => {
                onSelectSweepstake(sweep);
                onClose();
              }}
            />
          ))}

          <button
            onClick={onNewSweepstake}
            className="w-full p-4 mt-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple dark:hover:border-purple hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-gray-600 dark:text-gray-400 hover:text-purple dark:hover:text-purple-400"
          >
            <div className="text-2xl mb-1">+</div>
            <div className="text-sm font-semibold">New Sweepstake</div>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
